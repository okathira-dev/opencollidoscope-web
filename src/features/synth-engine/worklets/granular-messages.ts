export interface GranularSetBufferMessage {
  type: "setBuffer";
  buffer: Float32Array | SharedArrayBuffer;
}

export interface GranularSetSelectionMessage {
  type: "setSelection";
  startSample: number;
  sizeSamples: number;
}

export interface GranularNoteOnMessage {
  type: "noteOn";
  midiNote: number;
  rate: number;
}

export interface GranularNoteOffMessage {
  type: "noteOff";
  midiNote: number;
}

export interface GranularSetLoopingMessage {
  type: "setLooping";
  enabled: boolean;
}

export interface GranularSetGrainDurationCoeffMessage {
  type: "setGrainDurationCoeff";
  coeff: number;
}

export interface GranularSetAttenuationMessage {
  type: "setAttenuation";
  value: number;
}

export interface GranularUpdateConfigMessage {
  type: "updateConfig";
  maxGrains: number;
  minGrainDuration: number;
  maxVoices: number;
  attackTime: number;
  releaseTime: number;
  sustainLevel: number;
}

export type GranularWorkletInputMessage =
  | GranularSetBufferMessage
  | GranularSetSelectionMessage
  | GranularNoteOnMessage
  | GranularNoteOffMessage
  | GranularSetLoopingMessage
  | GranularSetGrainDurationCoeffMessage
  | GranularSetAttenuationMessage
  | GranularUpdateConfigMessage;

export interface GranularCursorTriggerMessage {
  type: "cursorTrigger";
  voiceId: number;
}

export interface GranularCursorEndMessage {
  type: "cursorEnd";
  voiceId: number;
}

export type GranularWorkletOutputMessage = GranularCursorTriggerMessage | GranularCursorEndMessage;
