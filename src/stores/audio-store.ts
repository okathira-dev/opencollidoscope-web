import { create } from "zustand";

import {
  DEFAULT_SAMPLE_RATE,
  GAIN_RAMP_TIME_CONSTANT,
  INPUT_ANALYSER_FFT_SIZE,
} from "../consts/audio.ts";
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

/** マイク入力グラフのノード群を一括管理する */
class AudioInputGraph {
  private gainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private silentOutputNode: GainNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private compressorEnabled = false;

  ensureNodes(audioContext: AudioContext): void {
    if (this.gainNode && this.gainNode.context === audioContext) {
      return;
    }

    this.gainNode = audioContext.createGain();
    this.compressorNode = audioContext.createDynamicsCompressor();
    this.analyserNode = audioContext.createAnalyser();
    this.analyserNode.fftSize = INPUT_ANALYSER_FFT_SIZE;
    this.silentOutputNode = audioContext.createGain();
    this.silentOutputNode.gain.value = 0;
    this.silentOutputNode.connect(audioContext.destination);
  }

  setMediaStreamSource(source: MediaStreamAudioSourceNode): void {
    this.mediaStreamSource = source;
  }

  getCompressorNode(): DynamicsCompressorNode | null {
    return this.compressorNode;
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  isCompressorEnabled(): boolean {
    return this.compressorEnabled;
  }

  rebuild(compressorEnabled: boolean): void {
    if (!this.gainNode || !this.compressorNode || !this.analyserNode || !this.silentOutputNode) {
      return;
    }

    this.gainNode.disconnect();
    this.compressorNode.disconnect();
    this.analyserNode.disconnect();

    if (compressorEnabled) {
      this.gainNode.connect(this.compressorNode);
      this.compressorNode.connect(this.analyserNode);
    } else {
      this.gainNode.connect(this.analyserNode);
    }

    this.analyserNode.connect(this.silentOutputNode);
    this.compressorEnabled = compressorEnabled;
  }

  connectMonitoringChain(): void {
    if (!this.mediaStreamSource || !this.gainNode) {
      return;
    }
    this.mediaStreamSource.connect(this.gainNode);
  }

  connectRecordingChain(workletNode: AudioWorkletNode): void {
    if (!this.analyserNode || !this.silentOutputNode) {
      return;
    }
    this.analyserNode.disconnect(this.silentOutputNode);
    this.analyserNode.connect(workletNode);
  }

  disconnectRecordingChain(workletNode: AudioWorkletNode): void {
    if (!this.analyserNode || !this.silentOutputNode) {
      return;
    }
    this.analyserNode.disconnect(workletNode);
    this.analyserNode.connect(this.silentOutputNode);
  }

  applyInputGain(audioContext: AudioContext, gain: number): void {
    if (!this.gainNode) {
      return;
    }
    this.gainNode.gain.setTargetAtTime(gain, audioContext.currentTime, GAIN_RAMP_TIME_CONSTANT);
  }
}

let workletNode: AudioWorkletNode | null = null;
let inputGraph: AudioInputGraph | null = null;
let sharedBuffer: SharedArrayBuffer | null = null;

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

function getInputGraph(): AudioInputGraph {
  if (!inputGraph) {
    inputGraph = new AudioInputGraph();
  }
  return inputGraph;
}

// 録音完了・正規化後に全チャンクを再計算。worklet 逐次報告で漏れた端数もここで補完する。
function refreshChunksFromBuffer(buffer: Float32Array, chunkCount: number): void {
  const samplesPerChunk = Math.round(buffer.length / chunkCount);
  const waveStore = getWaveStoreState();
  const chunks = Array.from({ length: chunkCount }, (_, index) => {
    const { min, max } = computeChunkMinMax(buffer, index, samplesPerChunk);
    return { min, max, updatedAt: performance.now() };
  });
  waveStore.setChunks(chunks);
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

    if (workletNode) {
      getInputGraph().disconnectRecordingChain(workletNode);
    }

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

const useAudioStoreInternal = create<AudioState>((set, get) => ({
  audioContext: null,
  sampleRate: DEFAULT_SAMPLE_RATE,
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

      const graph = getInputGraph();
      graph.ensureNodes(audioContext);
      const compressorNode = graph.getCompressorNode();
      if (!compressorNode) {
        throw new Error("マイク入力ノードの初期化に失敗しました");
      }
      applyCompressorSettings(compressorNode, micConfig);
      graph.rebuild(micConfig.compressorEnabled);
      graph.applyInputGain(audioContext, micConfig.inputGain);
      graph.setMediaStreamSource(audioContext.createMediaStreamSource(micStream));
      ensureWorkletNode(audioContext);
      graph.connectMonitoringChain();

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

    getInputGraph().connectRecordingChain(node);

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
    const graph = getInputGraph();
    const compressorNode = graph.getCompressorNode();
    if (!audioContext || !compressorNode) {
      return;
    }

    graph.applyInputGain(audioContext, config.inputGain);
    applyCompressorSettings(compressorNode, config);

    if (config.compressorEnabled !== graph.isCompressorEnabled()) {
      if (isRecording && workletNode) {
        graph.disconnectRecordingChain(workletNode);
      }
      graph.rebuild(config.compressorEnabled);
      if (isRecording && workletNode) {
        graph.connectRecordingChain(workletNode);
      }
    }
  },

  setInputGain: (gain) => {
    const { audioContext } = get();
    if (!audioContext) {
      return;
    }
    getInputGraph().applyInputGain(audioContext, gain);
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

export function subscribeRecordingStatus(listener: (isRecording: boolean) => void): () => void {
  return useAudioStoreInternal.subscribe((state, prev) => {
    if (state.isRecording !== prev.isRecording) {
      listener(state.isRecording);
    }
  });
}

export function getInputAnalyserNode(): AnalyserNode | null {
  return inputGraph?.getAnalyserNode() ?? null;
}
