import { useRef, useState } from "react";

let audioContextInstance: AudioContext | null = null;

export const useAudioContext = (): {
  audioContext: AudioContext | null;
  error: string | null;
} => {
  const isInitialized = useRef(false);
  const [error, setError] = useState<string | null>(null);

  if (!isInitialized.current) {
    try {
      if (!audioContextInstance) {
        audioContextInstance = new (window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext)();
      }
      isInitialized.current = true;
    } catch (e) {
      console.error("AudioContextの初期化に失敗しました。", e);
      setError(
        "オーディオ機能を利用できません。ブラウザが対応しているか、または設定を確認してください。",
      );
    }
  }

  return { audioContext: audioContextInstance, error };
};
