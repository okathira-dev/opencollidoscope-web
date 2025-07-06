import { useCallback, useEffect, useRef, useState } from "react";

import type {
  AudioContextState,
  AudioError,
  AudioProcessingResult,
} from "../utils/types";

export function useAudioContext() {
  const [audioContextState, setAudioContextState] = useState<AudioContextState>(
    {
      audioContext: null,
      isInitialized: false,
      isSupported: false,
      error: null,
    },
  );

  const audioContextRef = useRef<AudioContext | null>(null);

  // ブラウザ対応チェック
  const checkAudioSupport = (): boolean => {
    if (!window.AudioContext && !window.webkitAudioContext) {
      return false;
    }
    return true;
  };

  // セキュアコンテキストチェック
  const checkSecureContext = (): boolean => {
    return window.isSecureContext;
  };

  // AudioContextの初期化
  const initializeAudioContext = useCallback(async (): Promise<
    AudioProcessingResult<AudioContext>
  > => {
    try {
      if (!checkAudioSupport()) {
        throw new Error("Web Audio API is not supported in this browser");
      }

      if (!checkSecureContext()) {
        throw new Error(
          "Secure context (HTTPS) is required for audio features",
        );
      }

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();

      // AudioContextの状態を確認
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      audioContextRef.current = audioContext;

      setAudioContextState({
        audioContext,
        isInitialized: true,
        isSupported: true,
        error: null,
      });

      return {
        success: true,
        data: audioContext,
      };
    } catch (error) {
      const audioError: AudioError = {
        code: "AUDIO_CONTEXT_INIT_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: { error },
      };

      setAudioContextState({
        audioContext: null,
        isInitialized: false,
        isSupported: checkAudioSupport(),
        error: audioError.message,
      });

      return {
        success: false,
        error: audioError,
      };
    }
  }, []);

  // AudioContextの破棄
  const destroyAudioContext = useCallback(async (): Promise<void> => {
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setAudioContextState({
      audioContext: null,
      isInitialized: false,
      isSupported: checkAudioSupport(),
      error: null,
    });
  }, []);

  // 初期化時にブラウザ対応チェックを実行
  useEffect(() => {
    setAudioContextState((prev) => ({
      ...prev,
      isSupported: checkAudioSupport(),
    }));
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  return {
    ...audioContextState,
    initializeAudioContext,
    destroyAudioContext,
  };
}

// AudioContextの型拡張（WebKit対応）
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
