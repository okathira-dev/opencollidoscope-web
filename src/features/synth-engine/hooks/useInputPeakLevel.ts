import { useEffect, useRef, useState } from "react";

import { computeInputPeakLevel } from "../../../domain/audio/index.ts";
import { getInputAnalyserNode, useIsAudioInitialized } from "../../../stores/audio-store.ts";

/** rAF メーター表示用: ピーク値の減衰係数 */
export const INPUT_PEAK_DECAY_FACTOR = 0.92;

/** クリッピング警告しきい値 (0–1) */
export const INPUT_PEAK_CLIP_THRESHOLD = 0.95;

/** 高レベル警告しきい値 (0–1) */
export const INPUT_PEAK_WARN_THRESHOLD = 0.7;

export type InputPeakBarColor = "error" | "warning" | "primary";

export function getInputPeakBarColor(peakLevel: number): InputPeakBarColor {
  if (peakLevel > INPUT_PEAK_CLIP_THRESHOLD) {
    return "error";
  }
  if (peakLevel > INPUT_PEAK_WARN_THRESHOLD) {
    return "warning";
  }
  return "primary";
}

/** マイク入力アナライザのピークレベルを rAF でポーリングする */
export function useInputPeakLevel(): number {
  const isInitialized = useIsAudioInitialized();
  const [peakLevel, setPeakLevel] = useState(0);
  const bufferRef = useRef<Float32Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      setPeakLevel(0);
      return;
    }

    let frameId: number | null = null;

    const tick = () => {
      const analyser = getInputAnalyserNode();
      if (analyser) {
        if (!bufferRef.current || bufferRef.current.length !== analyser.fftSize) {
          bufferRef.current = new Float32Array(analyser.fftSize);
        }
        const peak = computeInputPeakLevel(analyser, bufferRef.current);
        setPeakLevel((previous) => Math.max(peak, previous * INPUT_PEAK_DECAY_FACTOR));
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isInitialized]);

  return peakLevel;
}
