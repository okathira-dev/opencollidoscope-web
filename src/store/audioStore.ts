import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

import type {
  AudioContextState,
  RecordingState,
  AudioError,
  ChunkData,
} from "../utils/types";

interface AudioWorkletState {
  isInitialized: boolean;
  isRecording: boolean;
  chunks: ChunkData[];
  totalChunks: number;
  recordedFrames: number;
}

interface AudioStore {
  // AudioContext状態
  audioContext: AudioContextState;

  // 録音状態
  recording: RecordingState;

  // AudioWorklet状態
  worklet: AudioWorkletState;

  // エラー状態
  error: AudioError | null;

  // アクション
  setAudioContext: (audioContext: AudioContextState) => void;
  setRecording: (recording: RecordingState) => void;
  setError: (error: AudioError | null) => void;

  // AudioWorkletアクション
  setWorkletInitialized: (initialized: boolean) => void;
  setWorkletRecording: (recording: boolean) => void;
  addChunk: (chunk: ChunkData) => void;
  clearChunks: () => void;
  setWorkletFrames: (frames: number) => void;
  setWorkletTotalChunks: (total: number) => void;

  // 便利なセレクタ
  isAudioReady: () => boolean;
  canRecord: () => boolean;
  canPlay: () => boolean;

  // リセット
  reset: () => void;
}

const initialState = {
  audioContext: {
    audioContext: null,
    isInitialized: false,
    isSupported: false,
    error: null,
  },
  recording: {
    isRecording: false,
    isPlaying: false,
    audioBuffer: null,
    recordingTime: 0,
    maxRecordingTime: 2.0,
  },
  worklet: {
    isInitialized: false,
    isRecording: false,
    chunks: [],
    totalChunks: 0,
    recordedFrames: 0,
  },
  error: null,
};

export const useAudioStore = create<AudioStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // アクション
      setAudioContext: (audioContext) => {
        set({ audioContext }, false, "setAudioContext");
      },

      setRecording: (recording) => {
        set({ recording }, false, "setRecording");
      },

      setError: (error) => {
        set({ error }, false, "setError");
      },

      // AudioWorkletアクション
      setWorkletInitialized: (initialized) => {
        set(
          (state) => ({
            worklet: { ...state.worklet, isInitialized: initialized },
          }),
          false,
          "setWorkletInitialized",
        );
      },

      setWorkletRecording: (recording) => {
        set(
          (state) => ({
            worklet: { ...state.worklet, isRecording: recording },
          }),
          false,
          "setWorkletRecording",
        );
      },

      addChunk: (chunk) => {
        set(
          (state) => ({
            worklet: {
              ...state.worklet,
              chunks: [...state.worklet.chunks, chunk],
            },
          }),
          false,
          "addChunk",
        );
      },

      clearChunks: () => {
        set(
          (state) => ({
            worklet: { ...state.worklet, chunks: [] },
          }),
          false,
          "clearChunks",
        );
      },

      setWorkletFrames: (frames) => {
        set(
          (state) => ({
            worklet: { ...state.worklet, recordedFrames: frames },
          }),
          false,
          "setWorkletFrames",
        );
      },

      setWorkletTotalChunks: (total) => {
        set(
          (state) => ({
            worklet: { ...state.worklet, totalChunks: total },
          }),
          false,
          "setWorkletTotalChunks",
        );
      },

      // 便利なセレクタ
      isAudioReady: () => {
        const state = get();
        return (
          state.audioContext.isInitialized &&
          state.audioContext.audioContext !== null
        );
      },

      canRecord: () => {
        const state = get();
        return (
          state.audioContext.isInitialized &&
          !state.recording.isRecording &&
          !state.recording.isPlaying
        );
      },

      canPlay: () => {
        const state = get();
        return (
          state.audioContext.isInitialized &&
          state.recording.audioBuffer !== null &&
          !state.recording.isRecording &&
          !state.recording.isPlaying
        );
      },

      // リセット
      reset: () => {
        set(initialState, false, "reset");
      },
    })),
    {
      name: "audio-store",
    },
  ),
);

// 便利なセレクタフック
export const useAudioContext = () =>
  useAudioStore((state) => state.audioContext);
export const useRecordingState = () =>
  useAudioStore((state) => state.recording);
export const useAudioError = () => useAudioStore((state) => state.error);

// AudioWorkletセレクタフック
export const useWorkletState = () => useAudioStore((state) => state.worklet);
export const useWorkletChunks = () =>
  useAudioStore((state) => state.worklet.chunks);
export const useWorkletRecording = () =>
  useAudioStore((state) => state.worklet.isRecording);

export const useAudioActions = () =>
  useAudioStore((state) => ({
    setAudioContext: state.setAudioContext,
    setRecording: state.setRecording,
    setError: state.setError,
    isAudioReady: state.isAudioReady,
    canRecord: state.canRecord,
    canPlay: state.canPlay,
    reset: state.reset,
  }));

export const useWorkletActions = () =>
  useAudioStore((state) => ({
    setWorkletInitialized: state.setWorkletInitialized,
    setWorkletRecording: state.setWorkletRecording,
    addChunk: state.addChunk,
    clearChunks: state.clearChunks,
    setWorkletFrames: state.setWorkletFrames,
    setWorkletTotalChunks: state.setWorkletTotalChunks,
  }));
