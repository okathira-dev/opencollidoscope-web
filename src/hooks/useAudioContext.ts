import { useState, useCallback, useRef, useEffect } from "react";

interface UseAudioContextReturn {
  audioContext: AudioContext | null;
  isStarted: boolean;
  error: string | null;
  startAudio: () => void;
  stopAudio: () => void;
}

export const useAudioContext = (): UseAudioContextReturn => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startAudio = useCallback(() => {
    try {
      setError(null);

      // Create new AudioContext if not exists
      if (!audioContextRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;

      // Resume context if suspended
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      setAudioContext(ctx);
      setIsStarted(true);

      console.log("Audio context started successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown audio error";
      setError(errorMessage);
      console.error("Failed to start audio context:", err);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setAudioContext(null);
    setIsStarted(false);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  // Handle audio context state changes
  useEffect(() => {
    if (audioContext) {
      const handleStateChange = () => {
        if (
          audioContext.state === "closed" ||
          audioContext.state === "suspended"
        ) {
          setIsStarted(false);
        }
      };

      audioContext.addEventListener("statechange", handleStateChange);

      return () => {
        audioContext.removeEventListener("statechange", handleStateChange);
      };
    }
  }, [audioContext]);

  return {
    audioContext,
    isStarted,
    error,
    startAudio,
    stopAudio,
  };
};
