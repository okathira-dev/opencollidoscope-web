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

#include "MIDI.h"
#include "Config.h"


collidoscope::MIDI::MIDI()
{
}


collidoscope::MIDI::~MIDI()
{
    // FIXME check cause destructor of RTInput might throw 
    for ( auto & input : mInputs )
        input->closePort();
}

void collidoscope::MIDI::RtMidiInCallback( double deltatime, std::vector<unsigned char> *message, void *userData )
{
    collidoscope::MIDI* midi = ((collidoscope::MIDI*)userData);
    std::lock_guard< std::mutex > lock( midi->mMutex );

    MIDIMessage msg = midi->parseRtMidiMessage( message );

    switch ( msg.getVoice() ){
    case MIDIMessage::Voice::ePitchBend:
        midi->mPitchBendMessages[msg.getChannel()] = msg;
        break;

    case MIDIMessage::Voice::eControlChange:
        if ( msg.getChannel() == 7 ) // FIXME no harcoded 
            midi->mFilterMessages[msg.getChannel()] = msg;
        else
            midi->mMIDIMessages.push_back( msg );
        break;

    default:
        midi->mMIDIMessages.push_back( msg );
        break;
    }
}

void collidoscope::MIDI::setup( const Config& config )
{
    unsigned int numPorts = 0; 

    try {
        RtMidiIn in;
        numPorts = in.getPortCount();
    }
    catch ( RtMidiError &error ) {
        throw MIDIException( error.getMessage() );
    }

    if ( numPorts == 0 ){
        throw MIDIException(" no MIDI input found ");
    }

    for ( unsigned int portNum = 0; portNum < numPorts; portNum++ ) {
        try {
            std::unique_ptr< RtMidiIn > input ( new RtMidiIn() );
            input->openPort( portNum, "Collidoscope Input" );
            input->setCallback( &RtMidiInCallback, this );
            mInputs.push_back( std::move(input) );

        }
        catch ( RtMidiError &error ) {
            throw MIDIException( error.getMessage() );
        }
    }
}


void collidoscope::MIDI::checkMessages( std::vector<MIDIMessage> & midiMessages )
{
    std::lock_guard<std::mutex> lock( mMutex );
    midiMessages.swap( mMIDIMessages );
    
    for ( int i = 0; i < NUM_WAVES; i++ ){
        if ( mPitchBendMessages[i].mVoice != MIDIMessage::Voice::eIgnore ){
            midiMessages.push_back( mPitchBendMessages[i] );
            mPitchBendMessages[i].mVoice = MIDIMessage::Voice::eIgnore;
        }

        if ( mFilterMessages[i].mVoice != MIDIMessage::Voice::eIgnore ){
            midiMessages.push_back( mFilterMessages[i] );
            mFilterMessages[i].mVoice = MIDIMessage::Voice::eIgnore;
        }
    }
}

// only call this function when the size of mRtMidiMessage != 0
collidoscope::MIDIMessage collidoscope::MIDI::parseRtMidiMessage( std::vector<unsigned char> *rtMidiMessage )
{
    collidoscope::MIDIMessage msg;

    size_t numBytes = rtMidiMessage->size();
    
    // voice is the 4 most significant bits
    unsigned char voice = (*rtMidiMessage)[0] >> 4;

    switch ( voice ){
    case 0x9 :
        msg.mVoice = MIDIMessage::Voice::eNoteOn;
        break;

    case 0x8:
        msg.mVoice = MIDIMessage::Voice::eNoteOff;
        break;

    case 0xB:
        msg.mVoice = MIDIMessage::Voice::eControlChange;
        break;

    case 0xE:
        msg.mVoice = MIDIMessage::Voice::ePitchBend;
        break;

    default:
        msg.mVoice = MIDIMessage::Voice::eIgnore;
        return msg;
    }

    // channel is 4 less significant bits
    unsigned char channel = (*rtMidiMessage)[0] & 0x0f;
    msg.mChannel = channel;
    
    //data byte 1
    msg.mData1 = (*rtMidiMessage)[1];

    // data byte 2 if it exists 
    msg.mData2 = (numBytes == 3 ? (*rtMidiMessage)[2] : 0);

    return msg;
}
