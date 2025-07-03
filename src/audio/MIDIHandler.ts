/**
 * MIDIHandler.ts - Web MIDI API implementation
 * Based on the original OpenCollidoscope MIDI functionality
 */

import { MIDIEvent, MIDI_CC } from '../types/audio';

type MIDIEventCallback = (note: number, velocity: number, channel: number) => void;
type ControlChangeCallback = (controller: number, value: number, channel: number) => void;
type PitchBendCallback = (value: number, channel: number) => void;

export class MIDIHandler {
  private midiAccess: WebMidi.MIDIAccess | null = null;
  private connectedInputs: Set<WebMidi.MIDIInput> = new Set();

  // Event callbacks
  public onNoteOn: MIDIEventCallback | null = null;
  public onNoteOff: MIDIEventCallback | null = null;
  public onControlChange: ControlChangeCallback | null = null;
  public onPitchBend: PitchBendCallback | null = null;

  constructor() {
    this.initializeMIDI();
  }

  private async initializeMIDI(): Promise<void> {
    try {
      if (!navigator.requestMIDIAccess) {
        console.warn('Web MIDI API not supported');
        return;
      }

      this.midiAccess = await navigator.requestMIDIAccess();
      this.setupMIDIInputs();
      
      // Listen for device connection changes
      this.midiAccess.onstatechange = () => {
        this.setupMIDIInputs();
      };

      console.log('MIDI system initialized');
    } catch (error) {
      console.error('Failed to initialize MIDI:', error);
    }
  }

  private setupMIDIInputs(): void {
    if (!this.midiAccess) return;

    // Clear existing connections
    this.connectedInputs.clear();

    // Connect to all available inputs
    for (const input of this.midiAccess.inputs.values()) {
      if (input.state === 'connected') {
        input.onmidimessage = (message) => this.handleMIDIMessage(message);
        this.connectedInputs.add(input);
        console.log(`Connected to MIDI input: ${input.name}`);
      }
    }
  }

  private handleMIDIMessage(message: WebMidi.MIDIMessageEvent): void {
    const [status, data1, data2] = message.data;
    const messageType = status & 0xF0;
    const channel = status & 0x0F;

    switch (messageType) {
      case 0x80: // Note Off
        this.handleNoteOff(data1, data2, channel);
        break;
      case 0x90: // Note On
        if (data2 === 0) {
          // Velocity 0 is equivalent to Note Off
          this.handleNoteOff(data1, data2, channel);
        } else {
          this.handleNoteOn(data1, data2, channel);
        }
        break;
      case 0xB0: // Control Change
        this.handleControlChange(data1, data2, channel);
        break;
      case 0xE0: // Pitch Bend
        this.handlePitchBend(data1, data2, channel);
        break;
    }
  }

  private handleNoteOn(note: number, velocity: number, channel: number): void {
    const normalizedVelocity = velocity / 127;
    this.onNoteOn?.(note, normalizedVelocity, channel);
  }

  private handleNoteOff(note: number, velocity: number, channel: number): void {
    const normalizedVelocity = velocity / 127;
    this.onNoteOff?.(note, normalizedVelocity, channel);
  }

  private handleControlChange(controller: number, value: number, channel: number): void {
    this.onControlChange?.(controller, value, channel);
    
    // Log specific OpenCollidoscope control changes
    switch (controller) {
      case MIDI_CC.SELECTION_SIZE:
        console.log(`MIDI CC${controller}: Selection Size = ${value}`);
        break;
      case MIDI_CC.GRAIN_DURATION:
        console.log(`MIDI CC${controller}: Grain Duration = ${value}`);
        break;
      case MIDI_CC.LOOP_TOGGLE:
        console.log(`MIDI CC${controller}: Loop = ${value > 0 ? 'ON' : 'OFF'}`);
        break;
      case MIDI_CC.RECORD_TRIGGER:
        console.log(`MIDI CC${controller}: Record Trigger = ${value}`);
        break;
      case MIDI_CC.FILTER_CUTOFF:
        console.log(`MIDI CC${controller}: Filter Cutoff = ${value}`);
        break;
    }
  }

  private handlePitchBend(lsb: number, msb: number, channel: number): void {
    // Convert 14-bit pitch bend value
    const pitchBendValue = (msb << 7) | lsb;
    this.onPitchBend?.(pitchBendValue, channel);
  }

  // Send MIDI messages (if outputs are available)
  sendNoteOn(note: number, velocity: number, channel: number = 0): void {
    this.sendMIDIMessage([0x90 | channel, note, Math.floor(velocity * 127)]);
  }

  sendNoteOff(note: number, velocity: number = 0, channel: number = 0): void {
    this.sendMIDIMessage([0x80 | channel, note, Math.floor(velocity * 127)]);
  }

  sendControlChange(controller: number, value: number, channel: number = 0): void {
    this.sendMIDIMessage([0xB0 | channel, controller, value]);
  }

  private sendMIDIMessage(data: number[]): void {
    if (!this.midiAccess) return;

    for (const output of this.midiAccess.outputs.values()) {
      if (output.state === 'connected') {
        output.send(data);
      }
    }
  }

  getConnectedDevices(): { inputs: string[], outputs: string[] } {
    if (!this.midiAccess) {
      return { inputs: [], outputs: [] };
    }

    const inputs = Array.from(this.midiAccess.inputs.values())
      .filter(input => input.state === 'connected')
      .map(input => input.name || 'Unknown Input');

    const outputs = Array.from(this.midiAccess.outputs.values())
      .filter(output => output.state === 'connected')
      .map(output => output.name || 'Unknown Output');

    return { inputs, outputs };
  }

  destroy(): void {
    if (this.midiAccess) {
      for (const input of this.connectedInputs) {
        input.onmidimessage = null;
      }
    }
    this.connectedInputs.clear();
    this.midiAccess = null;
  }
}