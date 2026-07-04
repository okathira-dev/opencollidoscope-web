export type MidiVoice = "noteOn" | "noteOff" | "controlChange" | "pitchBend" | "ignore";

export interface ParsedMidiMessage {
  voice: MidiVoice;
  channel: number;
  data1: number;
  data2: number;
}

export interface MidiDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
}
