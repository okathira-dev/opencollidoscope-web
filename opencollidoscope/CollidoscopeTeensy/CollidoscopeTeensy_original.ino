/******************************************************************************
 *  Copyright (C) 2015  Ben Bengler (mail@benbengler.com)
 *  Copyright (C) 2016  Queen Mary University of London 
 *  Authors: Ben Bengler, Fiore Martin
 *
 *  This file is part of Collidoscope.
 *
 *  Collidoscope is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *  
 ****************************************************************************
 *
 *  Teensy 2 ++ pinout: https://www.pjrc.com/teensy/card4b.pdf
 *  
 *  ANALOG INPUTS:
 *  Wavejet   -> F0 (38) [Horizontal rail 1]
 *  Wavejet   -> F1 (39) [Horizontal rail 2]
 *  Filter 1  -> F2 (40) [Fader with moon/sun 1]
 *  Filter 2  -> F4 (42) [Fader with moon/sun 2] 
 *  Duration 1-> F3 (41) [Fader with grains 1]
 *  Duration 2-> F5 (43) [Fader with grains 2]
 *
 *  DIGITAL INPUTS [INTERRUPTS]:
 *  Sel. length 1  -> INT0/INT1 (0, 1)  [Encoder 1]
 *  Sel. length 2  -> INT2/INT3 (2, 3)  [Encoder 2] 
 *
 *  DIGITAL INPUTS:
 *  Play1 toggle  -> B0 (20)
 *  Record1       -> B1 (21)
 *  Play2 toggle  -> B3 (22)
 *  Record2       -> B4 (24)
 *  
 *  DIGITAL OUTPUTS:
 *  Record Button 1 Led -> D4 (4)
 *  Record Button 2 Led -> D5 (5)
 *
 ******************************************************************************/ 


#include <Encoder.h>
#include <Bounce.h>

///////////////////////////////////////////////////
//MIDI settings
const int midi_chan_inst1 = 1; // MIDI channel for Instrument 1
const int midi_chan_inst2 = 2; // MIDI channel for Instrument 2

const int cc_length = 1;    // MIDI cc controlling selection length
const int cc_duration = 2;  // MIDI cc controlling duration
const int cc_filter = 7;    // MIDI cc controlling LP filter
const int cc_play = 4;      // MIDI cc controlling PLAY
const int cc_record = 5;    // MIDI cc controlling RECORD


///////////////////////////////////////////////////
//Default Values:
const int  Enc_def = 64; //default selection length  
int MIDI_led_state = LOW;

///////////////////////////////////////////////////
// Interface Inputs

//Buttons:

const int Pin_play1 = 20;       //B0    
const int Pin_record1 = 21;     //B1
const int Pin_play2 = 23;       //B3
const int Pin_record2 = 24;     //B4
const int Pin_record1_led =  4; //D4
const int Pin_record2_led =  5; //D5
const int Pin_MIDIled =  6;

Bounce button1 = Bounce(Pin_play1, 5); 
Bounce button2 = Bounce(Pin_record1, 5); 
Bounce button3 = Bounce(Pin_play2, 5); 
Bounce button4 = Bounce(Pin_record2, 5); 

 
//Encoder
Encoder Enc1 (0, 1);  //Encoder for section length on Wavejet 1
Encoder Enc2 (2, 3);  //Encoder for section length on Wavejet 2


// Variables
const int jitter_thresh = 10; // threshold value for analog INs to suppress sending MIDI due to input jitter 

void setup() {  

pinMode(Pin_play1, INPUT_PULLUP); 
pinMode(Pin_record1, INPUT_PULLUP);
pinMode(Pin_play2, INPUT_PULLUP);
pinMode(Pin_record2, INPUT_PULLUP);


pinMode(Pin_MIDIled, OUTPUT); 
pinMode(Pin_record1_led, OUTPUT);
pinMode(Pin_record2_led, OUTPUT);
}

//Store recent values to detect parameter change
long Enc1_old = -999;
long Enc2_old = -999;

uint16_t Jet1_old = 0;
int16_t Jet1_old_MIDI = -1;
uint16_t Jet2_old = 0;
int16_t Jet2_old_MIDI = -1;

uint16_t filter1_old = 0;
int16_t filter1_old_MIDI = -1;
uint16_t filter2_old = 0;
int16_t filter2_old_MIDI = -1;

uint16_t dur1_old = 0;
int16_t dur1_old_MIDI = -1;
uint16_t dur2_old = 0;
int16_t dur2_old_MIDI = -1;

void loop() {

  digitalWrite(Pin_MIDIled, LOW);
  digitalWrite(Pin_record1_led, HIGH);
  digitalWrite(Pin_record2_led, HIGH);
  button1.update();
  button2.update();
  button3.update();
  button4.update();

  
  uint16_t Jet1_new = analogRead(0);      //read Wavejet/Rail 1; ADJUST INPUT RANGE ACCORDING TO SENSOR    
  uint16_t Jet2_new = analogRead(1);      //read Wavejet/Rail 2; ADJUST INPUT RANGE ACCORDING TO SENSOR    
  uint16_t filter1_new = analogRead(2);   //read filter Instrument 1;    
  uint16_t filter2_new = analogRead(4);   //read filter Instrument 2;
  uint16_t dur1_new = analogRead(3); 
  uint16_t dur2_new = analogRead(5);

  
  //Encoder 1 [Controls selection length of wave 1]
  long Enc1_new = Enc1.read();
  Enc1_new = constrain(Enc1_new, 0, 127); //constrain to 7-bit MIDI range
  
  //Dynamic reset of counter to MIDI range 
  if (Enc1_new <= 0){
    Enc1.write(0); 
  }
  else if (Enc1_new >= 127){
    Enc1.write(127); 
  }
     
  //Encoder 2 [Controls selection length of wave 2]
  long Enc2_new = Enc2.read();
  Enc2_new = constrain(Enc2_new, 0, 127); //constrain to 7-bit MIDI range
  
  //Dynamic reset of counter to MIDI range 
  if (Enc2_new <= 0){
    Enc2.write(0); 
  }
  else if (Enc2_new >= 127){
    Enc2.write(127); 
  }

 //Instrument 1 Controls//////////////////////////////////////  
 
 //Loop/Keymode Switch Instrument 1 
   
 if (button1.risingEdge()) {   
   usbMIDI.sendControlChange(cc_play, 1, midi_chan_inst1);
 }
   
 if (button1.fallingEdge()) {   
   usbMIDI.sendControlChange(cc_play, 0, midi_chan_inst1);
 }
     
   
 //Record Instrument 1
 if (button2.fallingEdge()) {   
   usbMIDI.sendControlChange(cc_record, 1, midi_chan_inst1);
 }

 //send MIDI Wavejet 1 [Position Instrument 1]
 //<calibrate>
 if (Jet1_new > Jet1_old+jitter_thresh || Jet1_new < Jet1_old-jitter_thresh) {
    int16_t midiVal = constrain( map(Jet1_new, 18, 800, 0, 149), 0, 149 );
    if( midiVal != Jet1_old_MIDI ){
      Jet1_old_MIDI = midiVal;
      usbMIDI.sendPitchBend( midiVal, midi_chan_inst1 );
    }

    Jet1_old = Jet1_new;
    digitalWrite(Pin_MIDIled, HIGH);
 }


 //send MIDI Filter 1 [Filter Instrument 1]
 if ( filter1_new != filter1_old ) {
    int16_t midiVal = constrain( map(filter1_new, 0, 1024, 0, 127), 0, 127 );
    if( midiVal != filter1_old_MIDI){
      //Serial.println( midiVal );
      filter1_old_MIDI = midiVal;
      usbMIDI.sendControlChange(cc_filter, midiVal, midi_chan_inst1);
    }
    
    filter1_old = filter1_new;
    digitalWrite(Pin_MIDIled, HIGH);
  }

  if ( dur1_new != dur1_old ) {
 
    int16_t midiVal = constrain( map(dur1_new, 0, 1024, 0, 127), 0, 127 );
    if( midiVal != dur1_old_MIDI){
      dur1_old_MIDI = midiVal;
      usbMIDI.sendControlChange(cc_duration, midiVal, midi_chan_inst1);
    }
    
    dur1_old = dur1_new;
    digitalWrite(Pin_MIDIled, HIGH);
  }

  //send MIDI Encoder 1 [Selection length Instrument 1]
  if (Enc1_new != Enc1_old) {
    Enc1_old = Enc1_new;
    usbMIDI.sendControlChange(cc_length, Enc1_new, midi_chan_inst1);
    digitalWrite(Pin_MIDIled, HIGH);
  }

  
  
  //Instrument 2 Controls//////////////////////////////////////  
  
  //Loop/Keymode Switch Instrument 2
   
  if (button3.risingEdge()) {   
    usbMIDI.sendControlChange(cc_play, 1, midi_chan_inst2);
  }
  
  if (button3.fallingEdge()) {   
    usbMIDI.sendControlChange(cc_play, 0, midi_chan_inst2);
  }
  
  //Record Instrument 2
  if (button4.fallingEdge()) {   
    usbMIDI.sendControlChange(cc_record, 1, midi_chan_inst2);
  }

  //send MIDI Wavejet 2 [Position Instrument 2]
  //<calibrate>
  if (Jet2_new > Jet2_old+jitter_thresh || Jet2_new < Jet2_old-jitter_thresh) {
    int16_t midiVal = constrain( map( Jet2_new, 15, 780, 0, 149 ), 0, 149 );
    if( midiVal != Jet2_old_MIDI ){
      Jet2_old_MIDI = midiVal;
      usbMIDI.sendPitchBend( midiVal, midi_chan_inst2 );
    }

    Jet2_old = Jet2_new;
    digitalWrite(Pin_MIDIled, HIGH);
  }
  
   if ( filter2_new != filter2_old ) {
    int16_t midiVal = constrain( map(filter2_new, 0, 1024, 0, 127), 0, 127 );
    if( midiVal != filter2_old_MIDI){
      //Serial.println( midiVal );
      filter2_old_MIDI = midiVal;
      usbMIDI.sendControlChange(cc_filter, midiVal, midi_chan_inst2);
    }
    
    filter2_old = filter2_new;
    digitalWrite(Pin_MIDIled, HIGH);
   }

   if ( dur2_new != dur2_old ) {
    int16_t midiVal = constrain( map(dur2_new, 0, 1024, 0, 127), 0, 127 );
    if( midiVal != dur2_old_MIDI){
      //Serial.println( midiVal );
      dur2_old_MIDI = midiVal;
      usbMIDI.sendControlChange(cc_duration, midiVal, midi_chan_inst2);
    }
    
    dur2_old = dur2_new;
    digitalWrite(Pin_MIDIled, HIGH);
   }
   
  
  //send MIDI Encoder 2 [Selection length Instrument 2]
  if (Enc2_new != Enc2_old) {
    Enc2_old = Enc2_new;
    usbMIDI.sendControlChange(cc_length, Enc2_new, midi_chan_inst2);
    digitalWrite(Pin_MIDIled, HIGH);
  }
    
}

