/**
 * Type definitions for Open Collidoscope Web
 * Based on the original C++ implementation
 */

// Core types from Messages.h
export enum Command {
  WAVE_CHUNK = "WAVE_CHUNK",
  WAVE_START = "WAVE_START",
  TRIGGER_UPDATE = "TRIGGER_UPDATE",
  TRIGGER_END = "TRIGGER_END",
  NOTE_ON = "NOTE_ON",
  NOTE_OFF = "NOTE_OFF",
  LOOP_ON = "LOOP_ON",
  LOOP_OFF = "LOOP_OFF",
}

export interface RecordWaveMessage {
  readonly cmd: Command;
  readonly index: number;
  readonly arg1: number;
  readonly arg2: number;
}

export interface CursorTriggerMessage {
  readonly cmd: Command;
  readonly synthID: number;
}

export interface NoteMessage {
  readonly cmd: Command;
  readonly midiNote: number;
  readonly rate: number;
}

// Wave types from Wave.h
export interface ChunkData {
  top: number;
  bottom: number;
  isEmpty: boolean;
}

export interface SelectionData {
  start: number;
  size: number;
  particleSpread: number;
  isNull: boolean;
}

export interface CursorData {
  id: number;
  position: number;
  lastUpdate: number;
}

export interface WaveData {
  chunks: ChunkData[];
  selection: SelectionData;
  cursors: CursorData[];
  filterCoeff: number;
}

// Audio types
export interface AudioEngineState {
  sampleRate: number;
  isRecording: boolean;
  audioBuffer: AudioBuffer | null;
}

export interface GranularParams {
  selectionStart: number;
  selectionSize: number;
  grainDurationCoeff: number;
  filterCutoff: number;
  loop: boolean;
}

// UI types
export interface DrawInfo {
  readonly windowWidth: number;
  readonly windowHeight: number;
  readonly waveIndex: number;
}

// Particle system types
export interface ParticleData {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly radius: number;
  readonly alpha: number;
  readonly color: string;
}

// Application state
export interface CollidoscopeState {
  waves: WaveData[];
  audioEngine: AudioEngineState;
  granularParams: GranularParams;
  isFullScreen: boolean;
  activeWaveIndex: number;
}

// Event types
export interface KeyboardEvent {
  readonly key: string;
  readonly shiftKey: boolean;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
}

export interface MIDIEvent {
  readonly note: number;
  readonly velocity: number;
  readonly channel: number;
}

// Utility types
export type SynthID = number;
export type WaveIndex = number;
export type ChunkIndex = number;

// Function types
export type MessageHandler<T> = (message: T) => void;
export type StateUpdater<T> = (updater: (prevState: T) => T) => void;

// Immutable update helpers
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type PartialUpdate<T> = {
  readonly [P in keyof T]?: T[P] extends object ? PartialUpdate<T[P]> : T[P];
};
