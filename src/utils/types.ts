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

// AudioWorklet関連の型定義
export interface WorkletMessagePayloads {
  start: { duration: number };
  stop: undefined;
  chunk: {
    chunkIndex: number;
    audioData: Float32Array;
    minValue: number;
    maxValue: number;
    timestamp: number;
  };
  "recording-started": {
    message: string;
  };
  "recording-stopped": {
    totalFrames: number;
  };
  config: {
    sampleRate: number;
    chunkSize: number;
    totalChunks: number;
  };
  selection: {
    start: number;
    size: number;
  };
}

export type WorkletMessageType = keyof WorkletMessagePayloads;

// Mapped Typeを使用して、各メッセージタイプに対応するpayloadを持つ型を生成
export type WorkletMessage<T extends WorkletMessageType = WorkletMessageType> =
  {
    type: T;
    payload: WorkletMessagePayloads[T];
  };

// 特定のメッセージタイプのペイロードを取得するためのユーティリティ型
export type WorkletMessagePayload<T extends WorkletMessageType> =
  WorkletMessagePayloads[T];

export interface ChunkMessage {
  type: "chunk";
  payload: {
    chunkIndex: number;
    audioData: Float32Array;
    minValue: number;
    maxValue: number;
    timestamp: number;
  };
}

export interface RecordingProcessorOptions {
  numberOfInputs: number;
  numberOfOutputs: number;
  outputChannelCount: number[];
  chunkSize: number;
  totalChunks: number;
}

export interface GranularProcessorOptions {
  numberOfInputs: number;
  numberOfOutputs: number;
  outputChannelCount: number[];
  maxGrains: number;
  grainDuration: number;
}

export interface GrainData {
  id: number;
  startTime: number;
  duration: number;
  playbackRate: number;
  alive: boolean;
  position: number;
  envelope: number;
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

// AudioWorkletNodeの型定義
export interface RecordingWorkletNode extends AudioWorkletNode {
  onChunk?: (chunkData: ChunkMessage["payload"]) => void;
  startRecording: () => void;
  stopRecording: () => void;
}

export interface GranularWorkletNode extends AudioWorkletNode {
  setAudioBuffer: (buffer: AudioBuffer) => void;
  setSelection: (start: number, size: number) => void;
  triggerGrain: (note: number, velocity: number) => void;
  stopGrain: (note: number) => void;
}
