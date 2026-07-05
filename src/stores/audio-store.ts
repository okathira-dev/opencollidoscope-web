import { create } from "zustand";

import {
  applyCompressorSettings,
  buildMicMediaConstraints,
  computeBufferLength,
  computeChunkMinMax,
  computeFadeSamples,
  detectMicConstraintSupport,
  type MicConstraintSupport,
  type MicInputConfig,
  normalizePeakBuffer,
} from "../domain/audio/index.ts";
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
  micConstraintSupport: MicConstraintSupport;
  micConstraintError: string | null;
  error: string | null;
  initializeAudio: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  applyMicInputConfig: (config: MicInputConfig) => Promise<void>;
  setInputGain: (gain: number) => void;
  updateMicConstraints: (
    constraints: Pick<MicInputConfig, "autoGainControl" | "noiseSuppression" | "echoCancellation">,
  ) => Promise<void>;
}

let workletNode: AudioWorkletNode | null = null;
let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
let inputGainNode: GainNode | null = null;
let compressorNode: DynamicsCompressorNode | null = null;
let inputAnalyserNode: AnalyserNode | null = null;
let silentOutputNode: GainNode | null = null;
let sharedBuffer: SharedArrayBuffer | null = null;
let compressorEnabled = false;

const DEFAULT_MIC_CONSTRAINT_SUPPORT: MicConstraintSupport = {
  autoGainControl: false,
  noiseSuppression: false,
  echoCancellation: false,
};

function isSharedArrayBufferAvailable(): boolean {
  try {
    return typeof SharedArrayBuffer !== "undefined" && new SharedArrayBuffer(1).byteLength === 1;
  } catch {
    return false;
  }
}

function ensureInputNodes(audioContext: AudioContext): void {
  if (inputGainNode && inputGainNode.context === audioContext) {
    return;
  }

  inputGainNode = audioContext.createGain();
  compressorNode = audioContext.createDynamicsCompressor();
  inputAnalyserNode = audioContext.createAnalyser();
  inputAnalyserNode.fftSize = 256;
  silentOutputNode = audioContext.createGain();
  silentOutputNode.gain.value = 0;
  silentOutputNode.connect(audioContext.destination);
}

function wireInputChain(enabled: boolean): void {
  if (!inputGainNode || !compressorNode || !inputAnalyserNode || !silentOutputNode) {
    return;
  }

  inputGainNode.disconnect();
  compressorNode.disconnect();
  inputAnalyserNode.disconnect();

  if (enabled) {
    inputGainNode.connect(compressorNode);
    compressorNode.connect(inputAnalyserNode);
  } else {
    inputGainNode.connect(inputAnalyserNode);
  }

  inputAnalyserNode.connect(silentOutputNode);

  compressorEnabled = enabled;
}

function connectMonitoringChain(): void {
  if (!mediaStreamSource || !inputGainNode) {
    return;
  }

  mediaStreamSource.connect(inputGainNode);
}

function connectRecordingChain(): void {
  if (!inputAnalyserNode || !workletNode || !silentOutputNode) {
    return;
  }

  inputAnalyserNode.disconnect(silentOutputNode);
  inputAnalyserNode.connect(workletNode);
}

function disconnectRecordingChain(): void {
  if (!inputAnalyserNode || !workletNode || !silentOutputNode) {
    return;
  }

  inputAnalyserNode.disconnect(workletNode);
  inputAnalyserNode.connect(silentOutputNode);
}

// 録音完了・正規化後に全チャンクを再計算。worklet 逐次報告で漏れた端数もここで補完する。
function refreshChunksFromBuffer(buffer: Float32Array, chunkCount: number): void {
  const samplesPerChunk = Math.round(buffer.length / chunkCount);
  const waveStore = getWaveStoreState();

  for (let index = 0; index < chunkCount; index++) {
    const { min, max } = computeChunkMinMax(buffer, index, samplesPerChunk);
    waveStore.setChunk(index, min, max);
  }
}

function finalizeRecordedBuffer(buffer: Float32Array | null): Float32Array | null {
  if (!buffer) {
    return null;
  }

  const output = new Float32Array(buffer);
  const micConfig = getConfigState().config.micInput;

  if (micConfig.normalizeRecording) {
    normalizePeakBuffer(output, micConfig.normalizeTargetPeak);
    refreshChunksFromBuffer(output, getConfigState().config.audio.chunkCount);
  }

  return output;
}

function handleWorkletMessage(event: MessageEvent<RecordingWorkletOutputMessage>): void {
  const message = event.data;

  if (message.type === "chunk") {
    getWaveStoreState().setChunk(message.index, message.min, message.max);
    return;
  }

  if (message.type === "complete") {
    const audioState = useAudioStoreInternal.getState();
    const rawBuffer =
      message.buffer ?? (sharedBuffer ? new Float32Array(sharedBuffer) : audioState.recordedBuffer);

    disconnectRecordingChain();

    useAudioStoreInternal.setState({
      isRecording: false,
      recordedBuffer: finalizeRecordedBuffer(rawBuffer),
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

async function requestMicStream(config: MicInputConfig): Promise<MediaStream> {
  const constraints = buildMicMediaConstraints(config);

  try {
    return await navigator.mediaDevices.getUserMedia({ audio: constraints });
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "OverconstrainedError" || error.name === "ConstraintNotSatisfiedError")
    ) {
      return navigator.mediaDevices.getUserMedia({ audio: true });
    }
    throw error;
  }
}

function applyInputGain(audioContext: AudioContext, gain: number): void {
  if (!inputGainNode) {
    return;
  }

  inputGainNode.gain.setTargetAtTime(gain, audioContext.currentTime, 0.05);
}

const useAudioStoreInternal = create<AudioState>((set, get) => ({
  audioContext: null,
  sampleRate: 44100,
  isRecording: false,
  isInitialized: false,
  recordedBuffer: null,
  micStream: null,
  micConstraintSupport: DEFAULT_MIC_CONSTRAINT_SUPPORT,
  micConstraintError: null,
  error: null,

  initializeAudio: async () => {
    if (get().isInitialized) {
      return;
    }

    let audioContext: AudioContext | null = null;

    try {
      if (!window.isSecureContext) {
        throw new Error("音声機能には HTTPS または localhost が必要です");
      }

      if (typeof AudioWorkletNode === "undefined") {
        throw new Error("このブラウザは AudioWorklet に対応していません");
      }

      const micConfig = getConfigState().config.micInput;
      audioContext = new AudioContext();
      await audioContext.resume();
      await audioContext.audioWorklet.addModule(recordingProcessorUrl);

      const micStream = await requestMicStream(micConfig);
      const audioTrack = micStream.getAudioTracks()[0];
      const micConstraintSupport = audioTrack
        ? detectMicConstraintSupport(audioTrack)
        : DEFAULT_MIC_CONSTRAINT_SUPPORT;

      mediaStreamSource = audioContext.createMediaStreamSource(micStream);
      ensureInputNodes(audioContext);
      if (!compressorNode) {
        throw new Error("マイク入力ノードの初期化に失敗しました");
      }
      applyCompressorSettings(compressorNode, micConfig);
      wireInputChain(micConfig.compressorEnabled);
      applyInputGain(audioContext, micConfig.inputGain);
      ensureWorkletNode(audioContext);
      connectMonitoringChain();

      set({
        audioContext,
        sampleRate: audioContext.sampleRate,
        micStream,
        micConstraintSupport,
        isInitialized: true,
        micConstraintError: null,
        error: null,
      });
    } catch (error) {
      await audioContext?.close();
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

    connectRecordingChain();

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

  applyMicInputConfig: async (config) => {
    const { audioContext, isRecording } = get();
    if (!audioContext || !compressorNode) {
      return;
    }

    applyInputGain(audioContext, config.inputGain);
    applyCompressorSettings(compressorNode, config);

    if (config.compressorEnabled !== compressorEnabled) {
      if (isRecording) {
        disconnectRecordingChain();
      }
      wireInputChain(config.compressorEnabled);
      if (isRecording) {
        connectRecordingChain();
      }
    }
  },

  setInputGain: (gain) => {
    const { audioContext } = get();
    if (!audioContext) {
      return;
    }
    applyInputGain(audioContext, gain);
  },

  updateMicConstraints: async (constraints) => {
    const { micStream } = get();
    const track = micStream?.getAudioTracks()[0];
    if (!track) {
      return;
    }

    try {
      await track.applyConstraints(buildMicMediaConstraints(constraints));
      set({ micConstraintError: null });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "このブラウザでは選択したマイク処理を変更できませんでした";
      set({ micConstraintError: message });
      throw error;
    }
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

export function useMicConstraintSupport(): MicConstraintSupport {
  return useAudioStoreInternal((state) => state.micConstraintSupport);
}

export function useMicConstraintError(): string | null {
  return useAudioStoreInternal((state) => state.micConstraintError);
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

export function useApplyMicInputConfig() {
  return useAudioStoreInternal((state) => state.applyMicInputConfig);
}

export function useSetInputGain() {
  return useAudioStoreInternal((state) => state.setInputGain);
}

export function useUpdateMicConstraints() {
  return useAudioStoreInternal((state) => state.updateMicConstraints);
}

export function getAudioStoreState(): AudioState {
  return useAudioStoreInternal.getState();
}

export function getInputAnalyserNode(): AnalyserNode | null {
  return inputAnalyserNode;
}
