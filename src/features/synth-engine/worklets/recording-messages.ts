export interface RecordingStartMessage {
  type: "start";
  totalSamples: number;
  chunkCount: number;
  fadeSamples: number;
  sharedBuffer?: SharedArrayBuffer;
}

export interface RecordingStopMessage {
  type: "stop";
}

export type RecordingWorkletInputMessage = RecordingStartMessage | RecordingStopMessage;

export interface RecordingChunkMessage {
  type: "chunk";
  index: number;
  min: number;
  max: number;
}

export interface RecordingCompleteMessage {
  type: "complete";
  buffer?: Float32Array;
}

export type RecordingWorkletOutputMessage = RecordingChunkMessage | RecordingCompleteMessage;
