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

#pragma once

#include "cinder/Cinder.h"
#include "cinder/audio/Node.h"
#include "cinder/audio/dsp/RingBuffer.h"
#include "boost/optional.hpp"
#include "Messages.h"
#include "RingBufferPack.h"

#include <memory>

#include "PGranular.h"
#include "EnvASR.h"

typedef std::shared_ptr<class PGranularNode> PGranularNodeRef;
typedef ci::audio::dsp::RingBufferT<CursorTriggerMsg> CursorTriggerMsgRingBuffer;


struct RandomGenerator;

/*
A node in the Cinder audio graph that holds PGranulars for loop and keyboard playing  
*/
class PGranularNode : public ci::audio::Node
{
public:
    static const size_t kMaxVoices = 6;
    static const int kNoMidiNote = -50;

    explicit PGranularNode( ci::audio::Buffer *grainBuffer, CursorTriggerMsgRingBuffer &triggerRingBuffer );
    ~PGranularNode();

    /** Set selection size in samples */
    void setSelectionSize( size_t size )
    {
        mSelectionSize.set( size );
    }

    /** Set selection start in samples */
    void setSelectionStart( size_t start )
    {
        mSelectionStart.set( start );
    }

    void setGrainsDurationCoeff( double coeff )
    {
        mGrainDurationCoeff.set( coeff );
    }

    /* PGranularNode passes itself as trigger callback in PGranular */
    void operator()( char msgType, int ID );

    ci::audio::dsp::RingBufferT<NoteMsg>& getNoteRingBuffer() { return mNoteMsgRingBufferPack.getBuffer(); }

protected:
    
    void initialize()                           override;

    void process( ci::audio::Buffer *buffer )   override;

private:

    // Wraps a std::atomic but get() returns a boost::optional that is set to a real value only when the atomic has changed. 
    //  It is used to avoid calling PGranular setter methods with the same value at each audio callback.
    template< typename T>
    class LazyAtomic
    {
    public:
        LazyAtomic( T val ) :
            mAtomic( val ),
            mPreviousVal( val )
        {}

        void set( T val )
        {
            mAtomic = val;
        }

        boost::optional<T> get()
        {
            const T val = mAtomic;
            if ( val != mPreviousVal ){
                mPreviousVal = val;
                return val;
            }
            else{
                return boost::none;
            }
        }

    private:
        std::atomic<T> mAtomic;
        T mPreviousVal;
    };

    // creates or re-start a PGranular and sets the pitch according to the MIDI note passed as argument
    void handleNoteMsg( const NoteMsg &msg );

    // pointers to PGranular objects 
    std::unique_ptr < collidoscope::PGranular<float, RandomGenerator, PGranularNode > > mPGranularLoop;
    std::array<std::unique_ptr < collidoscope::PGranular<float, RandomGenerator, PGranularNode > >, kMaxVoices> mPGranularNotes;
    // maps midi notes to pgranulars. When a noteOff is received makes sure the right PGranular is turned off
    std::array<int, kMaxVoices> mMidiNotes;

    // pointer to the random generator struct passed over to PGranular 
    std::unique_ptr< RandomGenerator > mRandomOffset;
    
    // buffer containing the recorded audio, to pass to PGranular in initialize()
    ci::audio::Buffer *mGrainBuffer;

    ci::audio::BufferRef mTempBuffer;

    CursorTriggerMsgRingBuffer &mTriggerRingBuffer;
    RingBufferPack<NoteMsg> mNoteMsgRingBufferPack;

    LazyAtomic<size_t> mSelectionSize;
    
    LazyAtomic<size_t> mSelectionStart;
    
    LazyAtomic<double> mGrainDurationCoeff;


};

