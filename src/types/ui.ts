// UI Types for OpenCollidoscope React
import type { ReactNode } from "react";
export interface PianoKeyProps {
  note: number;
  isBlack: boolean;
  isPressed: boolean;
  onMouseDown: (note: number) => void;
  onMouseUp: (note: number) => void;
  onMouseEnter: (note: number) => void;
  onMouseLeave: (note: number) => void;
}

// Note: PianoKeyboardProps, WaveformDisplayProps, and OscilloscopeProps
// are now defined in types/audio.ts to avoid duplication

export interface ControlSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
}

export interface ToggleButtonProps {
  id: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: string;
  className?: string;
}

export interface StatusPanelProps {
  isAudioStarted: boolean;
  isRecording: boolean;
  isLooping: boolean;
  bufferDuration: number;
  selectionInfo: string;
}

export interface InfoModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export interface FileUploadProps {
  accept: string;
  multiple?: boolean;
  onFilesSelected: (files: FileList) => void;
  children: ReactNode;
}

// Canvas drawing utilities
export interface CanvasRenderContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  devicePixelRatio: number;
}

export interface WaveformPeaks {
  positive: Float32Array;
  negative: Float32Array;
  length: number;
}

export interface SelectionRegion {
  startX: number;
  endX: number;
  startSample: number;
  endSample: number;
  isDragging: boolean;
}

// Component state interfaces
export interface AppState {
  isAudioStarted: boolean;
  isRecording: boolean;
  isLooping: boolean;
  audioContext: AudioContext | null;
  recordedBuffer: AudioBuffer | null;
  granularParams: {
    selectionStart: number;
    selectionSize: number;
    grainDurationCoeff: number;
    filterCutoff: number;
    masterVolume: number;
  };
  pressedKeys: Set<number>;
  error: string | null;
}

export type ThemeMode = "dark" | "light";

export interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    warning: string;
    error: string;
    success: string;
  };
}
