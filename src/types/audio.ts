// Audio Types for OpenCollidoscope React
export interface AudioGrain {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  startTime: number;
  duration: number;
  rate: number;
  position: number;
}

export interface GranularSynthParams {
  selectionStart: number;
  selectionSize: number;
  grainDurationCoeff: number;
  filterCutoff: number;
  masterVolume: number;
  numChunks: number;
  maxSelectionChunks: number;
  isLooping: boolean;
}

export interface MIDIEvent {
  type: 'noteOn' | 'noteOff' | 'controlChange' | 'pitchBend';
  note?: number;
  velocity?: number;
  controller?: number;
  value?: number;
  channel?: number;
}

export interface AudioSelection {
  start: number;
  size: number;
  startTime: number;
  endTime: number;
}

export interface KeyMapping {
  [key: string]: number;
}

export interface RecordingState {
  isRecording: boolean;
  duration: number;
  bufferLength: number;
}

export interface WaveformData {
  buffer: AudioBuffer | null;
  peaks: Float32Array | null;
  samplesPerPixel: number;
}

export interface OscilloscopeData {
  timeData: Uint8Array;
  frequencyData: Uint8Array;
  sampleRate: number;
}

// Constants matching original OpenCollidoscope
export const AUDIO_CONSTANTS = {
  MAX_GRAINS: 32,
  DEFAULT_CHUNKS: 150,
  MAX_SELECTION_CHUNKS: 127,
  HANN_WINDOW_SIZE: 512,
  SAMPLE_RATE: 44100,
  FILTER_MIN_FREQ: 100,
  FILTER_MAX_FREQ: 8000,
  ATTACK_TIME: 0.01,  // 10ms
  RELEASE_TIME: 0.05, // 50ms
  MIDI_NOTE_CENTER: 60, // C4
} as const;

// MIDI Control Change mappings (matching original)
export const MIDI_CC = {
  SELECTION_SIZE: 1,
  GRAIN_DURATION: 2,
  LOOP_TOGGLE: 4,
  RECORD_TRIGGER: 5,
  FILTER_CUTOFF: 7,
} as const;

// Keyboard mappings (matching original)
export const KEYBOARD_MAPPINGS: KeyMapping = {
  'KeyA': 60, // C4
  'KeyW': 61, // C#4
  'KeyS': 62, // D4
  'KeyE': 63, // D#4
  'KeyD': 64, // E4
  'KeyF': 65, // F4
  'KeyT': 66, // F#4
  'KeyG': 67, // G4
  'KeyY': 68, // G#4
  'KeyH': 69, // A4
  'KeyU': 70, // A#4
  'KeyJ': 71, // B4
  'KeyK': 72, // C5
  'KeyO': 73, // C#5
  'KeyL': 74, // D5
  'KeyP': 75  // D#5
};