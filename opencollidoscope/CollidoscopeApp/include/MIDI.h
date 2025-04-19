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

#include "RtMidi.h"
#include <memory>
#include <mutex>
#include <array>

class Config;


namespace collidoscope {

// Exception thrown by MIDI system
class MIDIException : public std::exception
{
public:

    MIDIException( std::string message ) : mMessage( message ) {}

    virtual const std::string& getMessage( void ) const { return mMessage; }

#ifdef _WINDOWS
    const char* what() const override { return mMessage.c_str(); }
#else
    const char* what() const noexcept override { return mMessage.c_str(); }
#endif

protected:
    std::string mMessage;
};

/**
 * A MIDI message 
 */ 
class MIDIMessage
{
    friend class MIDI;
public:

    enum class Voice { eNoteOn, eNoteOff, ePitchBend, eControlChange, eIgnore };

    Voice getVoice() { return mVoice; }

    unsigned char getChannel() { return mChannel; }

    /**
     * First byte of MIDI data 
     */ 
    unsigned char getData_1() { return mData1; }

    /**
     * Second byte of MIDI data 
     */ 
    unsigned char getData_2() { return mData2; }

private:

    Voice mVoice = Voice::eIgnore;
    unsigned char mChannel;
    unsigned char mData1;
    unsigned char mData2;

    
};

/**
 * Handles MIDI messages from the keyboards and Teensy. It uses RtMidi library.
 *
 */ 
class MIDI
{

public:

    MIDI();
    ~MIDI();

    void setup( const Config& );

    /**
     * Check new incoming messages and stores them into the vector passed as argument by reference.
     */ 
    void checkMessages( std::vector< MIDIMessage >&  );

private:

    // callback passed to RtMidi library 
    static void RtMidiInCallback( double deltatime, std::vector<unsigned char> *message, void *userData );

    // parse RtMidi messages and turns them into more readable collidoscope::MIDIMessages
    MIDIMessage parseRtMidiMessage( std::vector<unsigned char> *message );

    // messages to pass to checkMessages caller 
    std::vector< MIDIMessage > mMIDIMessages;
    // use specific variables for pitch bend messages. Pitch bend messages are coming 
    // from the strip sensors that are very jerky and send a lot of values. So instead 
    // of saving all the messages in mMIDIMessages just save the last received in mPitchBendMessages 
    // and optimize away redundant messages.
    std::array< MIDIMessage, NUM_WAVES > mPitchBendMessages;
    // Same principle as mPitchBendMessages
    std::array< MIDIMessage, NUM_WAVES > mFilterMessages;

    // vector containing all the MIDI input devices detected.
    std::vector< std::unique_ptr <RtMidiIn> > mInputs;
    // Used for mutual access to the MIDI messages by the MIDI thread and the graphic thread.  
    std::mutex mMutex;
};



}  // collidsocope } 
