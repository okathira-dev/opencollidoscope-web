// 基本的な型定義
export interface AudioConfig {
  sampleRate: number;
  chunkCount: number;
  waveLength: number;
  maxSelectionSize: number;
  attenuation: number;
}

export interface RecordingState {
  isRecording: boolean;
  isPlaying: boolean;
  audioBuffer: AudioBuffer | null;
  recordingTime: number;
  maxRecordingTime: number;
}

export interface AudioContextState {
  audioContext: AudioContext | null;
  isInitialized: boolean;
  isSupported: boolean;
  error: string | null;
}

export interface ChunkData {
  id: number;
  startTime: number;
  endTime: number;
  data: Float32Array;
  isSelected: boolean;
}

export interface SelectionData {
  startChunk: number;
  endChunk: number;
  size: number;
}

// エラー型
export interface AudioError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// 音声処理の結果型
export interface AudioProcessingResult<T> {
  success: boolean;
  data?: T;
  error?: AudioError;
}
