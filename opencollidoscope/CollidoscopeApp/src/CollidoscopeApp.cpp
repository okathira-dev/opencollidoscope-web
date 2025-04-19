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
*/


#include "cinder/app/App.h"
#include "cinder/app/RendererGl.h"
#include "cinder/gl/gl.h"
#include "cinder/Exception.h"
#include <stdexcept>


#include "Config.h"
#include "Wave.h"
#include "DrawInfo.h"
#include "Log.h"
#include "AudioEngine.h"
#include "Oscilloscope.h"
#include "Messages.h"
#include "MIDI.h"

using namespace ci;
using namespace ci::app;

using namespace std;


class CollidoscopeApp : public App {
  public:

    void setup() override;
    void setupGraphics();

    /** Receives MIDI command messages from MIDI thread */
    void receiveCommands();
    /** Prints command line usage */
    void usage();

    void keyDown( KeyEvent event ) override;
    void update() override;
    void draw() override;
    void resize() override;

    Config mConfig;
    collidoscope::MIDI mMIDI;
    AudioEngine mAudioEngine;
    
    array< shared_ptr< Wave >, NUM_WAVES > mWaves;
    array< shared_ptr< DrawInfo >, NUM_WAVES > mDrawInfos;
    array< shared_ptr< Oscilloscope >, NUM_WAVES > mOscilloscopes;
    // buffer to read the WAVE_* messages as a new wave gets recorded 
    array< RecordWaveMsg*, NUM_WAVES> mRecordWaveMessageBuffers;
    //buffer to read the TRIGGER_* messages as the pgranulars play
    array< vector< CursorTriggerMsg >, NUM_WAVES > mCursorTriggerMessagesBuffers;

    double mSecondsPerChunk;

    ~CollidoscopeApp();

};


void CollidoscopeApp::setup()
{
    hideCursor();
    /* setup is logged: setup steps and errors */
    
    /*try {
        mConfig.loadFromFile( "./collidoscope_config.xml" );
    }
    catch ( const Exception &e ){
        logError( string("Exception loading config from file:") + e.what() );
    }*/

    // setup buffers to read messages from audio thread 
    for ( size_t i = 0; i < NUM_WAVES; i++ ){
        mRecordWaveMessageBuffers[i] = new RecordWaveMsg[mConfig.getNumChunks()];
        mCursorTriggerMessagesBuffers[i].reserve( mConfig.getCursorTriggerMessageBufSize() );
    }

    mAudioEngine.setup( mConfig );

    setupGraphics();

    mSecondsPerChunk = mConfig.getWaveLen() / mConfig.getNumChunks();

    try {
        mMIDI.setup( mConfig );
    }
    catch ( const collidoscope::MIDIException &e ){
        logError( string( "Exception opening MIDI input device: " ) + e.getMessage() );
    }

}

void CollidoscopeApp::setupGraphics()
{
    for ( size_t i = 0; i < NUM_WAVES; i++ ){

        mDrawInfos[i] = make_shared< DrawInfo >( i );
        mWaves[i] = make_shared< Wave >(mConfig.getNumChunks(), mConfig.getWaveSelectionColor(i) );
        mOscilloscopes[i] = make_shared< Oscilloscope >( mAudioEngine.getAudioOutputBuffer( i ).getNumFrames() / mConfig.getOscilloscopeNumPointsDivider() );

    }
}

void CollidoscopeApp::keyDown( KeyEvent event )
{
    char c = event.getChar();

    const size_t waveIdx = 0;

    switch (c){
    case 'r' : 
        mAudioEngine.record( waveIdx );
        break;

    case 'w': {

        mWaves[waveIdx]->getSelection().setSize(mWaves[waveIdx]->getSelection().getSize() + 1);

        size_t numSelectionChunks = mWaves[waveIdx]->getSelection().getSize();
        // how many samples in one selection ?
        size_t selectionSize = numSelectionChunks * (mConfig.getWaveLen() * mAudioEngine.getSampleRate() / mConfig.getNumChunks());

        mAudioEngine.setSelectionSize(waveIdx, selectionSize);
    };
        break;

    case 's': {

        mWaves[waveIdx]->getSelection().setSize( mWaves[waveIdx]->getSelection().getSize() - 1 );

        size_t selectionSize = mWaves[waveIdx]->getSelection().getSize() *(mConfig.getWaveLen() * mAudioEngine.getSampleRate() / mConfig.getNumChunks());
        mAudioEngine.setSelectionSize( waveIdx, selectionSize );
    };
        break;

    case 'd': {

        size_t selectionStart = mWaves[waveIdx]->getSelection().getStart();
        mWaves[waveIdx]->getSelection().setStart( selectionStart + 1 );

        selectionStart = mWaves[waveIdx]->getSelection().getStart();
        mAudioEngine.setSelectionStart( waveIdx, selectionStart * (mConfig.getWaveLen() * mAudioEngine.getSampleRate() / mConfig.getNumChunks()) );
    };

        break;

    case 'a': {
        size_t selectionStart = mWaves[waveIdx]->getSelection().getStart();
        
        if ( selectionStart == 0 )
            return;

        mWaves[waveIdx]->getSelection().setStart( selectionStart - 1 );

        selectionStart = mWaves[waveIdx]->getSelection().getStart();

        mAudioEngine.setSelectionStart( waveIdx, selectionStart * (mConfig.getWaveLen() * mAudioEngine.getSampleRate() / mConfig.getNumChunks()) );
    };
        break;

    case 'f':
        setFullScreen( !isFullScreen() );
        break;

    case ' ': { 
        static bool isOn = false;
        isOn = !isOn;
        if ( isOn ){
            mAudioEngine.loopOn( waveIdx );
        }
        else{
            mAudioEngine.loopOff( waveIdx );
        }
    };
        break;

    case '9': {
        int c = mWaves[waveIdx]->getSelection().getParticleSpread();
        if ( c == 1 )
            return;
        else
            c -= 1;

        mAudioEngine.setGrainDurationCoeff( waveIdx, c );
        mWaves[waveIdx]->getSelection().setParticleSpread( float( c ) );

    }; break;

    case '0': {
        int c = mWaves[waveIdx]->getSelection().getParticleSpread();
        if ( c == 8 )
            return;
        else
            c += 1;

        mAudioEngine.setGrainDurationCoeff( waveIdx, c );
        mWaves[waveIdx]->getSelection().setParticleSpread( float( c ) );
    }; break;
    }

}

void CollidoscopeApp::update()
{
    // check incoming commands 
    receiveCommands();

    // check new wave chunks from recorder buffer 
    for ( size_t i = 0; i < NUM_WAVES; i++ ){
        size_t availableRead = mAudioEngine.getRecordWaveAvailable( i );
        mAudioEngine.readRecordWave( i, mRecordWaveMessageBuffers[i], availableRead );

        for ( size_t msgIndex = 0; msgIndex < availableRead; msgIndex++ ){
            const RecordWaveMsg & msg = mRecordWaveMessageBuffers[i][msgIndex];

            if ( msg.cmd == Command::WAVE_CHUNK ){
                mWaves[i]->setChunk( msg.index, msg.arg1, msg.arg2 );
            }
            else if ( msg.cmd == Command::WAVE_START ){
                mWaves[i]->reset( true ); // reset only chunks but leave selection 
            }
            
        }
    }

    // check if new cursors have been triggered 
    for ( size_t i = 0; i < NUM_WAVES; i++ ){
        
        mAudioEngine.checkCursorTriggers( i, mCursorTriggerMessagesBuffers[i] );
        for ( auto & trigger : mCursorTriggerMessagesBuffers[i] ){
            const int nodeID = trigger.synthID;

            switch ( trigger.cmd ){

            case Command::TRIGGER_UPDATE: {
                mWaves[i]->setCursorPos( nodeID, mWaves[i]->getSelection().getStart(), *mDrawInfos[i] );
            };
                break;

            case Command::TRIGGER_END: {
                mWaves[i]->removeCursor( nodeID );
            };
                break;

            }
            
        }
        mCursorTriggerMessagesBuffers[i].clear();
    }

    // update cursors 
    for ( size_t i = 0; i < NUM_WAVES; i++ ){
        mWaves[i]->update( mSecondsPerChunk, *mDrawInfos[i] );
    }
    
    // update oscilloscope 

    for ( size_t i = 0; i < NUM_WAVES; i++ ){
        const audio::Buffer &audioOutBuffer = mAudioEngine.getAudioOutputBuffer( i );
        // one oscilloscope sample 

        for ( size_t j = 0; j < mOscilloscopes[i]->getNumPoints(); j++ ){
            mOscilloscopes[i]->setPoint( j, audioOutBuffer.getData()[j], *mDrawInfos[i] );
        }
    }

    
    
}

void CollidoscopeApp::draw()
{
    gl::clear( Color( 0, 0, 0 ) );

    for ( int i = 0; i < NUM_WAVES; i++ ){
        if ( i == 1 ){
            /* for the upper wave flip the x over the center of the screen which is
            the composition of rotate on the y-axis and translate by -screenwidth*/
            gl::pushModelMatrix();
            gl::rotate( float(M_PI), ci::vec3( 0, 1, 0 ) );
            gl::translate( float( -getWindowWidth() ), 0.0f );
            mOscilloscopes[i]->draw();
            mWaves[i]->draw( *mDrawInfos[i] );
            gl::popModelMatrix();
        }
        else{

            mOscilloscopes[i]->draw();
            mWaves[i]->draw( *mDrawInfos[i] );
        }
    }
}

void CollidoscopeApp::resize()
{
    App::resize();
    
    for ( int i = 0; i < NUM_WAVES; i++ ){
        // reset the drawing information with the new windows size and same shrink factor  
        mDrawInfos[i]->reset( getWindow()->getBounds(), 3.0f / 5.0f );

        /* reset the oscilloscope points to zero */
        for ( int j = 0; j < mOscilloscopes[i]->getNumPoints(); j++ ){
            mOscilloscopes[i]->setPoint(j, 0.0f, *mDrawInfos[i] );
        }
    }
}



void CollidoscopeApp::receiveCommands()
{
    // check new midi messages 
    static std::vector<collidoscope::MIDIMessage> midiMessages;
    mMIDI.checkMessages( midiMessages );


    for ( auto &m : midiMessages ){
        
        const size_t waveIdx = mConfig.getWaveForMIDIChannel( m.getChannel() );
        if ( waveIdx >= NUM_WAVES )
            continue;

        if ( m.getVoice() == collidoscope::MIDIMessage::Voice::eNoteOn ){
            int midiNote = m.getData_1();
            mAudioEngine.noteOn( waveIdx, midiNote );
        }
        else if ( m.getVoice() == collidoscope::MIDIMessage::Voice::eNoteOff ){
            int midiNote = m.getData_1();
            mAudioEngine.noteOff( waveIdx, midiNote );
        } 
        else if ( m.getVoice() == collidoscope::MIDIMessage::Voice::ePitchBend ){
            const uint16_t MSB = m.getData_2() << 7;
            uint16_t value = m.getData_1(); // LSB 

            value |= MSB;
            

            // value ranges from 0 to 149. check boundaries in case sensor gives bad values 
            if ( value > 149 ){ // FIXME can use wave.size() 
                continue;
            }

            size_t startChunk = value;

            const size_t selectionSizeBeforeStartUpdate = mWaves[waveIdx]->getSelection().getSize();
            mWaves[waveIdx]->getSelection().setStart( startChunk );

            mAudioEngine.setSelectionStart( waveIdx, startChunk * (mConfig.getWaveLen() * mAudioEngine.getSampleRate() / mConfig.getNumChunks()) );
            
            const size_t newSelectionSize = mWaves[waveIdx]->getSelection().getSize();
            if ( selectionSizeBeforeStartUpdate != newSelectionSize ){
                mAudioEngine.setSelectionSize( waveIdx, newSelectionSize * (mConfig.getWaveLen() * mAudioEngine.getSampleRate() / mConfig.getNumChunks()) );
            }


        }
        else if ( m.getVoice() == collidoscope::MIDIMessage::Voice::eControlChange ){

            switch ( m.getData_1() ){ //controller number 
            case 1: { // selection size 
                const size_t midiVal = m.getData_2();
                size_t numSelectionChunks = ci::lmap<size_t>( midiVal, 0, 127, 1, mConfig.getMaxSelectionNumChunks() );

                mWaves[waveIdx]->getSelection().setSize( numSelectionChunks );

                // how many samples in one selection ?
                size_t selectionSize = mWaves[waveIdx]->getSelection().getSize() * (mConfig.getWaveLen() * mAudioEngine.getSampleRate() / mConfig.getNumChunks());
                mAudioEngine.setSelectionSize( waveIdx, selectionSize );

            };
                break;

            case 4: { // loop on off
                unsigned char midiVal = m.getData_2();

                if ( midiVal > 0 )
                    mAudioEngine.loopOn( waveIdx );
                else
                    mAudioEngine.loopOff( waveIdx );
            };
                break;

            case 5: // trigger record
                mAudioEngine.record( waveIdx );
                break;

            case 2: { // duration 
                const double midiVal = m.getData_2(); // 0-127
                const double coeff = ci::lmap<double>( midiVal, 0.0, 127, 1.0, mConfig.getMaxGrainDurationCoeff() );
                mAudioEngine.setGrainDurationCoeff( waveIdx, coeff );
                mWaves[waveIdx]->getSelection().setParticleSpread( float( coeff ) );
            };
                break;

            case 7: { // filter 
                const double midiVal = m.getData_2(); // 0-127
                const double minCutoff = mConfig.getMinFilterCutoffFreq();
                const double maxCutoff = mConfig.getMaxFilterCutoffFreq();
                const double cutoff = pow( maxCutoff / 200., midiVal / 127.0 ) * minCutoff;
                mAudioEngine.setFilterCutoff( waveIdx, cutoff );
                const float alpha = ci::lmap<double>( midiVal, 0.0f, 127.0f, 0.f, 1.f );
                mWaves[waveIdx]->setselectionAlpha( alpha );
            };
                break;


                
            }
        }
    }

    midiMessages.clear();
}



CollidoscopeApp::~CollidoscopeApp()
{
    for ( int chan = 0; chan < NUM_WAVES; chan++ ){
        /* delete the array for wave messages from audio thread */
        delete[] mRecordWaveMessageBuffers[chan];
    }
}


CINDER_APP( CollidoscopeApp, RendererGl, [] ( App::Settings *settings) {

    const std::vector< string > args = settings->getCommandLineArgs();

    int width = 0;
    int height = 0;

    try {
        if( args.size() != 3 )
            throw std::invalid_argument("");

        width  = std::stoi( args[1] );
        height = std::stoi( args[2] );

    }
    catch( std::invalid_argument & e ){
        console() << "Error: invalid arguments" << std::endl;
        console() << "Usage: ./CollidoscopeApp window_width window_height" << std::endl;  
        console() << "For example: ./CollidoscopeApp 1024 768 " << std::endl;  

        settings->setShouldQuit( true );
        return;
    }

    settings->setWindowSize( width, height );
    settings->setMultiTouchEnabled( false );
    settings->disableFrameRate();

} )
