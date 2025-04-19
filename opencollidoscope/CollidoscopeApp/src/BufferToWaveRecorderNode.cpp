/*

 Copyright (C) 2016  Queen Mary University of London 
 Author: Fiore Martin

 This file is part of Collidoscope.
 
 Collidoscope is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

 This file incorporates work covered by the following copyright and permission notice: 

    Copyright (c) 2014, The Cinder Project

    This code is intended to be used with the Cinder C++ library, http://libcinder.org

    Redistribution and use in source and binary forms, with or without modification, are permitted provided that
    the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this list of conditions and
    the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
    the following disclaimer in the documentation and/or other materials provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
    WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
    PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
    ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
    TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
    HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
    NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
    POSSIBILITY OF SUCH DAMAGE.
 
*/

#include "BufferToWaveRecorderNode.h"
#include "cinder/audio/Context.h"
#include "cinder/audio/Target.h"



// ----------------------------------------------------------------------------------------------------
// MARK: - BufferRecorderNode
// ----------------------------------------------------------------------------------------------------

namespace {
    
const size_t DEFAULT_RECORD_BUFFER_FRAMES = 44100;

void resizeBufferAndShuffleChannels(ci::audio::BufferDynamic *buffer, size_t resultNumFrames)
{
    const size_t currentNumFrames = buffer->getNumFrames();
    const size_t sampleSize = sizeof(ci::audio::BufferDynamic::SampleType);

    if (currentNumFrames < resultNumFrames) {
        // if expanding, resize and then shuffle. Make sure to get the data pointer after the resize.
        buffer->setNumFrames(resultNumFrames);
        float *data = buffer->getData();

        for (size_t ch = 1; ch < buffer->getNumChannels(); ch++) {
            const size_t numZeroFrames = resultNumFrames - currentNumFrames;
            const float *currentChannel = &data[ch * currentNumFrames];
            float *resultChannel = &data[ch * resultNumFrames];

            memmove(resultChannel, currentChannel, currentNumFrames * sampleSize);
            memset(resultChannel - numZeroFrames, 0, numZeroFrames * sampleSize);
        }
    }
    else if (currentNumFrames > resultNumFrames) {
        // if shrinking, shuffle first and then resize.
        float *data = buffer->getData();

        for (size_t ch = 1; ch < buffer->getNumChannels(); ch++) {
            const float *currentChannel = &data[ch * currentNumFrames];
            float *resultChannel = &data[ch * resultNumFrames];

            memmove(resultChannel, currentChannel, currentNumFrames * sampleSize);
        }

        const size_t numZeroFrames = (currentNumFrames - resultNumFrames) * buffer->getNumChannels();
        memset(data + buffer->getSize() - numZeroFrames, 0, numZeroFrames * sampleSize);

        buffer->setNumFrames(resultNumFrames);
    }
}

}


BufferToWaveRecorderNode::BufferToWaveRecorderNode( std::size_t numChunks, double numSeconds )
    : SampleRecorderNode( Format().channels( 1 ) ),
    mLastOverrun( 0 ),
    mNumChunks( numChunks ),
    mNumSeconds( numSeconds ),
    mRingBuffer( numChunks ),
    mChunkMaxAudioVal( kMinAudioVal ),
    mChunkMinAudioVal( kMaxAudioVal ),
    mChunkSampleCounter( 0 ),
    mChunkIndex( 0 )
{
    
}

void BufferToWaveRecorderNode::initialize()
{
    // adjust recorder buffer to match channels once initialized, since they could have changed since construction.
    bool resize = mRecorderBuffer.getNumFrames() != 0;
    mRecorderBuffer.setNumChannels( getNumChannels() );

    // lenght of buffer is = number of seconds * sample rate 
    initBuffers( size_t( mNumSeconds * (double)getSampleRate() ) ); 

    // How many samples each chunk contains. That is it calculates the min and max of 
    // This is calculated here and not in the initializer list because it uses getNumFrames()
    // FIXME probably could be done in constructor body 
    mNumSamplesPerChunk = std::lround( float( getNumFrames() ) / mNumChunks );

    // if the buffer had already been resized, zero out any possibly existing data.
    if( resize )
        mRecorderBuffer.zero();

    mEnvRampLen = kRampTime * getSampleRate();
    mEnvDecayStart = mRecorderBuffer.getNumFrames() - mEnvRampLen;
    if ( mEnvRampLen <= 0 ){
        mEnvRampRate = 0;
    }
    else{
        mEnvRampRate = 1.0f / mEnvRampLen;
    }
}

void BufferToWaveRecorderNode::initBuffers(size_t numFrames)
{
    mRecorderBuffer.setSize( numFrames, getNumChannels() );
    mCopiedBuffer = std::make_shared<ci::audio::BufferDynamic>( numFrames, getNumChannels() );
}

void BufferToWaveRecorderNode::start()
{
    mWritePos = 0;
    mChunkIndex = 0;
    enable();
}

void BufferToWaveRecorderNode::stop()
{
    disable();
}

void BufferToWaveRecorderNode::setNumSeconds(double numSeconds, bool shrinkToFit)
{
    setNumFrames(size_t(numSeconds * (double)getSampleRate()), shrinkToFit);
}

double BufferToWaveRecorderNode::getNumSeconds() const
{
    return (double)getNumFrames() / (double)getSampleRate();
}

void BufferToWaveRecorderNode::setNumFrames(size_t numFrames, bool shrinkToFit)
{
    if (mRecorderBuffer.getNumFrames() == numFrames)
        return;

    std::lock_guard<std::mutex> lock(getContext()->getMutex());

    if (mWritePos != 0)
        resizeBufferAndShuffleChannels(&mRecorderBuffer, numFrames);
    else
        mRecorderBuffer.setNumFrames(numFrames);

    if (shrinkToFit)
        mRecorderBuffer.shrinkToFit();
}

ci::audio::BufferRef BufferToWaveRecorderNode::getRecordedCopy() const
{
    // first grab the number of current frames, which may be increasing as the recording continues.
    size_t numFrames = mWritePos;
    mCopiedBuffer->setSize(numFrames, mRecorderBuffer.getNumChannels());

    mCopiedBuffer->copy(mRecorderBuffer, numFrames);
    return mCopiedBuffer;
}

void BufferToWaveRecorderNode::writeToFile(const ci::fs::path &filePath, ci::audio::SampleType sampleType)
{
    size_t currentWritePos = mWritePos;
    ci::audio::BufferRef copiedBuffer = getRecordedCopy();

    ci::audio::TargetFileRef target = ci::audio::TargetFile::create(filePath, getSampleRate(), getNumChannels(), sampleType);
    target->write(copiedBuffer.get(), currentWritePos);
}

uint64_t BufferToWaveRecorderNode::getLastOverrun()
{
    uint64_t result = mLastOverrun;
    mLastOverrun = 0;
    return result;
}


void BufferToWaveRecorderNode::process(ci::audio::Buffer *buffer)
{
    size_t writePos = mWritePos;
    size_t numWriteFrames = buffer->getNumFrames();

    if ( writePos == 0 ){
        RecordWaveMsg msg = makeRecordWaveMsg( Command::WAVE_START, 0, 0, 0 );
        mRingBuffer.write( &msg, 1 );

        // reset everything
        mChunkMinAudioVal = kMaxAudioVal;
        mChunkMaxAudioVal = kMinAudioVal;
        mChunkSampleCounter = 0;
        mChunkIndex = 0;
        mEnvRamp = 0.0f;
    }

    // if buffer has too many frames (because we're nearly at the end or at the end ) 
    // of mRecoderBuffer then numWriteFrames becomes the number of samples left to 
    // fill mRecorderBuffer. Which is 0 if the buffer is at the end.
    if ( writePos + numWriteFrames > mRecorderBuffer.getNumFrames() )
        numWriteFrames = mRecorderBuffer.getNumFrames() - writePos;

    if ( numWriteFrames <= 0 )
        return;


    // apply envelope to the buffer at the edges to avoid clicks 
    if ( writePos < mEnvRampLen ){ // beginning of wave 
        for ( size_t i = 0; i < std::min( mEnvRampLen, numWriteFrames ); i++ ){
            buffer->getData()[i] *= mEnvRamp;
            mEnvRamp += mEnvRampRate;
            if ( mEnvRamp > 1.0f )
                mEnvRamp = 1.0f;
        }
    }
    else if ( writePos + numWriteFrames > mEnvDecayStart ){ // end of wave 
        for ( size_t i = std::max( writePos, mEnvDecayStart ) - writePos; i < numWriteFrames; i++ ){
            buffer->getData()[i] *= mEnvRamp;
            mEnvRamp -= mEnvRampRate;
            if ( mEnvRamp < 0.0f )
                mEnvRamp = 0.0f;
        }
    }


    mRecorderBuffer.copyOffset(*buffer, numWriteFrames, writePos, 0);

    if ( numWriteFrames < buffer->getNumFrames() )
        mLastOverrun = getContext()->getNumProcessedFrames();

    /* find max and minimum of this buffer */
    for ( size_t i = 0; i < numWriteFrames; i++ ){

        if ( buffer->getData()[i] < mChunkMinAudioVal ){
            mChunkMinAudioVal = buffer->getData()[i];
        }

        if ( buffer->getData()[i] > mChunkMaxAudioVal ){
            mChunkMaxAudioVal = buffer->getData()[i];
        }

        if ( mChunkSampleCounter >= mNumSamplesPerChunk              // if collected enough samples 
            || writePos + i >= mRecorderBuffer.getNumFrames() - 1 ){ // or at the end of recorder buffer 
            // send chunk to GUI
            size_t chunkIndex = mChunkIndex.fetch_add( 1 );

            RecordWaveMsg msg = makeRecordWaveMsg( Command::WAVE_CHUNK, chunkIndex, mChunkMinAudioVal, mChunkMaxAudioVal );
            mRingBuffer.write( &msg, 1 );
            
            // reset chunk info 
            mChunkMinAudioVal = kMaxAudioVal;
            mChunkMaxAudioVal = kMinAudioVal;
            mChunkSampleCounter = 0;
        }
        else{
            mChunkSampleCounter++;
        }
    }

    // check if write position has been reset by the GUI thread, if not write new value
    const size_t writePosNew = writePos + numWriteFrames;
    mWritePos.compare_exchange_strong( writePos, writePosNew );

}


const float BufferToWaveRecorderNode::kMinAudioVal = -1.0f;
const float BufferToWaveRecorderNode::kMaxAudioVal = 1.0f; 
const float BufferToWaveRecorderNode::kRampTime = 0.02;


