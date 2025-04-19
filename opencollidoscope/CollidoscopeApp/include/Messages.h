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

/**
 * Enumeration of all the possible commands exchanged between audio thread and graphic thread.
 *
 */ 
enum class Command {
    // message carrying info about one chunk of recorder audio. 
    WAVE_CHUNK,
    // message sent when a new recording starts. The gui resets the wave upon receiving it. 
    WAVE_START,

    // new grain created 
    TRIGGER_UPDATE,
    // synth became idle
    TRIGGER_END,

    NOTE_ON,
    NOTE_OFF,

    LOOP_ON,
    LOOP_OFF
};

/** Message sent from the audio thread to the graphic wave when a new wave is recorded. 
 *  
 *  The graphic thread sets the chunks of the wave to reflect the level of the recorded audio. 
 *  The algorithm takes the maximum and minimum value of a group of samples and this becomes the top and bottom of the chunk.
 *  The message carries also the index of the chunk it refers to 
 */
struct RecordWaveMsg
{
    Command cmd; // WAVE_CHUNK or WAVE_START
    std::size_t index;
    float arg1;
    float arg2;
};

/**
 * Utility function to create a new RecordWaveMsg.
 */ 
inline RecordWaveMsg makeRecordWaveMsg( Command cmd, std::size_t index, float arg1, float arg2 )
{
    RecordWaveMsg msg;
    msg.cmd = cmd;
    msg.index = index;
    msg.arg1 = arg1;
    msg.arg2 = arg2;

    return msg;
}

/**
 * Message sent from the audio thread to the graphic thread when a new grain is triggered in the granular synthesizer. 
 * This creates a new cursor that travels from the beginning to the end of the selection to graphically represent the evolution of the grain in time. 
 *
 */ 
struct CursorTriggerMsg
{
    Command cmd; // TRIGGER_UPDATE or TRIGGER_END
    int synthID;
};

/**
 * Utility function to create a new CursorTriggerMsg.
 */ 
inline CursorTriggerMsg makeCursorTriggerMsg( Command cmd, std::uint8_t synthID )
{
    CursorTriggerMsg msg;

    msg.cmd = cmd;
    msg.synthID = synthID;

    return msg;
}

/**
 * Message sent from the graphic (main) thread to the audio thread to start a new voice of the granular synthesizer.
 */ 
struct NoteMsg
{
    Command cmd; // NOTE_ON/OFF ot LOOP_ON/OFF 
    int midiNote;
    double rate;
};

/**
 * Utility function to create a new NoteMsg.
 */ 
inline NoteMsg makeNoteMsg( Command cmd, int midiNote, double rate )
{
    NoteMsg msg;

    msg.cmd = cmd;
    msg.midiNote = midiNote;
    msg.rate = rate;

    return msg;
}
