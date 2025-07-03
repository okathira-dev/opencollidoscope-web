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
  type: "noteOn" | "noteOff" | "controlChange" | "pitchBend";
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
  ATTACK_TIME: 0.01, // 10ms
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
  KeyA: 60, // C4
  KeyW: 61, // C#4
  KeyS: 62, // D4
  KeyE: 63, // D#4
  KeyD: 64, // E4
  KeyF: 65, // F4
  KeyT: 66, // F#4
  KeyG: 67, // G4
  KeyY: 68, // G#4
  KeyH: 69, // A4
  KeyU: 70, // A#4
  KeyJ: 71, // B4
  KeyK: 72, // C5
  KeyO: 73, // C#5
  KeyL: 74, // D5
  KeyP: 75, // D#5
};

// Audio-related type definitions for OpenCollidoscope

export interface AudioBufferData {
  buffer: AudioBuffer;
  chunks: Float32Array[];
  duration: number;
  sampleRate: number;
}

export interface GranularSettings {
  selectionStart: number;
  selectionSize: number;
  grainDuration: number;
  loop: boolean;
  record: boolean;
  filter: number;
  volume: number;
  pitch: number;
}

export interface MIDIMapping {
  CC1: "selectionSize";
  CC2: "grainDuration";
  CC4: "loop";
  CC5: "record";
  CC7: "filter";
}

export interface PianoKeyMapping {
  [key: string]: number; // key -> MIDI note number
}

export const PIANO_KEY_MAPPING: PianoKeyMapping = {
  a: 60,
  s: 61,
  d: 62,
  f: 63,
  g: 64,
  h: 65,
  j: 66,
  k: 67,
  l: 68,
  w: 61,
  e: 63,
  r: 64,
  t: 66,
  y: 67,
  u: 69,
  i: 70,
  o: 72,
  p: 73,
};

export const MIDI_NOTE_60 = 60; // Middle C
export const MAX_GRAINS = 32;
export const DEFAULT_CHUNKS = 150;
export const SAMPLE_RATE = 44100;

// Canvas drawing types
export interface CanvasDrawingContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
}

export interface WaveformDisplayProps {
  audioBuffer?: AudioBuffer;
  selectionStart: number;
  selectionSize: number;
  onSelectionChange: (start: number, size: number) => void;
}

export interface PianoKeyboardProps {
  onNoteOn: (note: number, velocity: number) => void;
  onNoteOff: (note: number) => void;
  activeNotes: Set<number>;
}

export interface OscilloscopeProps {
  analyser?: AnalyserNode;
  isActive: boolean;
}
