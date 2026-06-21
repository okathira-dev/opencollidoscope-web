import { create } from "zustand";

import { computeBufferLength, computeFadeSamples } from "../domain/audio/index.ts";
import type { RecordingWorkletOutputMessage } from "../features/synth-engine/worklets/recording-messages.ts";
import recordingProcessorUrl from "../features/synth-engine/worklets/recording-processor.ts?worker&url";
import { getConfigState } from "./config-store.ts";
import { getWaveStoreState } from "./wave-store.ts";

interface AudioState {
  audioContext: AudioContext | null;
  sampleRate: number;
  isRecording: boolean;
  isInitialized: boolean;
  recordedBuffer: Float32Array | null;
  micStream: MediaStream | null;
  error: string | null;
  initializeAudio: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

let workletNode: AudioWorkletNode | null = null;
let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
let sharedBuffer: SharedArrayBuffer | null = null;

function isSharedArrayBufferAvailable(): boolean {
  try {
    return typeof SharedArrayBuffer !== "undefined" && new SharedArrayBuffer(1).byteLength === 1;
  } catch {
    return false;
  }
}

function handleWorkletMessage(event: MessageEvent<RecordingWorkletOutputMessage>): void {
  const message = event.data;

  if (message.type === "chunk") {
    getWaveStoreState().setChunk(message.index, message.min, message.max);
    return;
  }

  if (message.type === "complete") {
    const audioState = useAudioStoreInternal.getState();
    const buffer =
      message.buffer ?? (sharedBuffer ? new Float32Array(sharedBuffer) : audioState.recordedBuffer);

    if (mediaStreamSource && workletNode) {
      mediaStreamSource.disconnect(workletNode);
    }

    useAudioStoreInternal.setState({
      isRecording: false,
      recordedBuffer: buffer ? new Float32Array(buffer) : null,
    });
  }
}

function ensureWorkletNode(audioContext: AudioContext): AudioWorkletNode {
  if (workletNode && workletNode.context === audioContext) {
    return workletNode;
  }

  workletNode = new AudioWorkletNode(audioContext, "recording-processor", {
    numberOfInputs: 1,
    numberOfOutputs: 0,
  });
  workletNode.port.onmessage = handleWorkletMessage;
  return workletNode;
}

const useAudioStoreInternal = create<AudioState>((set, get) => ({
  audioContext: null,
  sampleRate: 44100,
  isRecording: false,
  isInitialized: false,
  recordedBuffer: null,
  micStream: null,
  error: null,

  initializeAudio: async () => {
    if (get().isInitialized) {
      return;
    }

    try {
      if (!window.isSecureContext) {
        throw new Error("音声機能には HTTPS または localhost が必要です");
      }

      if (typeof AudioWorkletNode === "undefined") {
        throw new Error("このブラウザは AudioWorklet に対応していません");
      }

      const audioContext = new AudioContext();
      await audioContext.resume();
      await audioContext.audioWorklet.addModule(recordingProcessorUrl);

      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamSource = audioContext.createMediaStreamSource(micStream);
      ensureWorkletNode(audioContext);

      set({
        audioContext,
        sampleRate: audioContext.sampleRate,
        micStream,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        isInitialized: false,
      });
      throw error;
    }
  },

  startRecording: async () => {
    const { audioContext, isRecording, isInitialized } = get();
    if (!audioContext || !isInitialized || isRecording) {
      return;
    }

    await audioContext.resume();

    const config = getConfigState().config.audio;
    const totalSamples = computeBufferLength(audioContext.sampleRate, config.waveLength);
    const fadeSamples = computeFadeSamples(audioContext.sampleRate);

    getWaveStoreState().initChunks(config.chunkCount);
    sharedBuffer = null;

    let bufferForStore: Float32Array | null = null;
    if (isSharedArrayBufferAvailable()) {
      sharedBuffer = new SharedArrayBuffer(totalSamples * Float32Array.BYTES_PER_ELEMENT);
      bufferForStore = new Float32Array(sharedBuffer);
    }

    const node = ensureWorkletNode(audioContext);
    const startMessage = {
      type: "start" as const,
      totalSamples,
      chunkCount: config.chunkCount,
      fadeSamples,
      ...(sharedBuffer ? { sharedBuffer } : {}),
    };
    node.port.postMessage(startMessage);

    if (mediaStreamSource) {
      mediaStreamSource.connect(node);
    }

    set({
      isRecording: true,
      recordedBuffer: bufferForStore,
      error: null,
    });
  },

  stopRecording: () => {
    const { audioContext, isRecording } = get();
    if (!audioContext || !isRecording || !workletNode) {
      return;
    }

    workletNode.port.postMessage({ type: "stop" });
  },
}));

export function useAudioContext(): AudioContext | null {
  return useAudioStoreInternal((state) => state.audioContext);
}

export function useSampleRate(): number {
  return useAudioStoreInternal((state) => state.sampleRate);
}

export function useIsRecording(): boolean {
  return useAudioStoreInternal((state) => state.isRecording);
}

export function useIsAudioInitialized(): boolean {
  return useAudioStoreInternal((state) => state.isInitialized);
}

export function useRecordedBuffer(): Float32Array | null {
  return useAudioStoreInternal((state) => state.recordedBuffer);
}

export function useAudioError(): string | null {
  return useAudioStoreInternal((state) => state.error);
}

export function useInitializeAudio() {
  return useAudioStoreInternal((state) => state.initializeAudio);
}

export function useStartRecording() {
  return useAudioStoreInternal((state) => state.startRecording);
}

export function useStopRecording() {
  return useAudioStoreInternal((state) => state.stopRecording);
}
