import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

import type {
  AudioContextState,
  RecordingState,
  AudioError,
} from "../utils/types";

interface AudioStore {
  // AudioContext状態
  audioContext: AudioContextState;

  // 録音状態
  recording: RecordingState;

  // エラー状態
  error: AudioError | null;

  // アクション
  setAudioContext: (audioContext: AudioContextState) => void;
  setRecording: (recording: RecordingState) => void;
  setError: (error: AudioError | null) => void;

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
