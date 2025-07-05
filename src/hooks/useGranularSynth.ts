import { useRef, useEffect, useCallback } from "react";

import { useAudioContext } from "./useAudioContext";
import {
  SELECTION_SCALE_FACTOR,
  MIDDLE_C_MIDI_NOTE,
  CANVAS_WIDTH,
} from "../constants/config";
import { useSynthStore } from "../store/synthStore";

interface GranularSynthControls {
  play: (midiNote: number) => void;
  setMasterVolume: (volume: number) => void;
}

export const useGranularSynth = (
  audioBuffer: AudioBuffer | null,
  particleTriggerRef?: React.MutableRefObject<
    ((x: number, y: number) => void) | undefined
  >,
): GranularSynthControls => {
  const { selectionStart, selectionSize, grainDuration, filterCutoff, loop } =
    useSynthStore();
  const { audioContext } = useAudioContext(); // 共有AudioContextを使用
  const loopIntervalId = useRef<number | null>(null); // setIntervalのIDを保持
  const masterGainNode = useRef<GainNode | null>(null);

  // AudioContextとマスターゲインノードの初期化
  useEffect(() => {
    if (!audioContext) return; // AudioContextがnullの場合は何もしない

    if (!masterGainNode.current) {
      masterGainNode.current = audioContext.createGain();
      masterGainNode.current.connect(audioContext.destination);
    }
    return () => {
      if (loopIntervalId.current) {
        clearInterval(loopIntervalId.current);
        loopIntervalId.current = null;
      }
      if (masterGainNode.current) {
        masterGainNode.current.disconnect();
        masterGainNode.current = null;
      }
    };
  }, [audioContext]);

  // マスターボリュームの更新
  const setMasterVolume = useCallback(
    (volume: number) => {
      if (masterGainNode.current && audioContext) {
        masterGainNode.current.gain.setValueAtTime(
          volume,
          audioContext.currentTime,
        );
      }
    },
    [audioContext],
  );

  const playGrain = useCallback(
    (midiNote: number) => {
      if (!audioBuffer || !audioContext || !masterGainNode.current) {
        console.warn("AudioBufferまたはAudioContextが準備できていません。", {
          audioBuffer,
          audioContext,
          masterGainNode: masterGainNode.current,
        });
        return;
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      const baseMidiNote = MIDDLE_C_MIDI_NOTE; // 中央C
      const playbackRate = Math.pow(2, (midiNote - baseMidiNote) / 12);
      source.playbackRate.value = playbackRate;

      const filter = audioContext.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = filterCutoff;
      filter.Q.value = 0.707;

      const gainNode = audioContext.createGain();
      const now = audioContext.currentTime;
      const attackTime = 0.01;
      const releaseTime = 0.05;
      const sustainLevel = 0.7;

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime);

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(masterGainNode.current); // マスターゲインノードに接続

      const startOffset =
        (selectionStart / SELECTION_SCALE_FACTOR) * audioBuffer.duration;
      const baseDuration =
        (selectionSize / SELECTION_SCALE_FACTOR) * audioBuffer.duration;
      const actualGrainDuration = baseDuration * grainDuration;

      source.start(now, startOffset, actualGrainDuration);

      // ループしない場合、グレインが終了するタイミングでリリースフェーズをスケジュール
      if (!loop) {
        gainNode.gain.setValueAtTime(sustainLevel, now + actualGrainDuration);
        gainNode.gain.linearRampToValueAtTime(
          0,
          now + actualGrainDuration + releaseTime,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.0001,
          now + actualGrainDuration + releaseTime + 0.1,
        ); // 0への急激な変化を避ける
        source.stop(now + actualGrainDuration + releaseTime + 0.1);
      }

      source.onended = () => {
        source.disconnect();
        filter.disconnect();
        gainNode.disconnect();
      };

      // パーティクルをトリガー
      if (particleTriggerRef?.current) {
        // カーソル位置を特定するために、現在の再生時間から計算
        const currentPlayTime =
          (startOffset + (audioContext.currentTime - now)) %
          audioBuffer.duration;
        const cursorX = (currentPlayTime / audioBuffer.duration) * CANVAS_WIDTH; // Canvasの幅に合わせて調整
        particleTriggerRef.current(cursorX, 100); // Y座標は中央に固定
      }
    },
    [
      audioBuffer,
      selectionStart,
      selectionSize,
      grainDuration,
      filterCutoff,
      loop,
      particleTriggerRef,
      audioContext,
    ],
  );

  // グレインのオーバーラップ再生ロジック
  const play = useCallback(
    (midiNote: number) => {
      if (!audioBuffer || !audioContext) {
        console.warn("AudioBufferまたはAudioContextが準備できていません。", {
          audioBuffer,
          audioContext,
        });
        return;
      }

      const baseDuration =
        (selectionSize / SELECTION_SCALE_FACTOR) * audioBuffer.duration;
      const triggerRate = baseDuration; // オリジナルではselectionSizeがtriggerRateに相当

      // オーバーラップするグレインの数を計算
      const numOverlaps = Math.ceil(grainDuration);

      for (let i = 0; i < numOverlaps; i++) {
        // 各グレインをtriggerRate間隔で開始
        const grainStartTimeOffset = triggerRate * i;
        // playGrainを直接呼び出すのではなく、setTimeoutでスケジュール
        setTimeout(() => {
          playGrain(midiNote);
        }, grainStartTimeOffset * 1000); // ミリ秒に変換
      }
    },
    [audioBuffer, selectionSize, grainDuration, playGrain, audioContext],
  );

  // ループ状態の監視とsetIntervalの管理
  useEffect(() => {
    if (loop) {
      // 既にループがアクティブな場合は何もしない
      if (loopIntervalId.current) return;

      const context = audioContext;
      if (!audioBuffer || !context) {
        console.warn(
          "AudioBufferまたはAudioContextが準備できていません。ループを開始できません。",
          { audioBuffer, audioContext },
        );
        return;
      }

      const baseDuration =
        (selectionSize / SELECTION_SCALE_FACTOR) * audioBuffer.duration;
      const loopInterval = baseDuration * 1000; // ミリ秒に変換

      // ループ開始時に最初のグレインを再生
      play(MIDDLE_C_MIDI_NOTE); // デフォルトのMIDIノート (中央C)

      loopIntervalId.current = window.setInterval(() => {
        play(MIDDLE_C_MIDI_NOTE); // デフォルトのMIDIノート (中央C)
      }, loopInterval);
    } else {
      // ループがfalseになったらインターバルをクリア
      if (loopIntervalId.current) {
        clearInterval(loopIntervalId.current);
        loopIntervalId.current = null;
      }
    }

    // クリーンアップ関数
    return () => {
      if (loopIntervalId.current) {
        clearInterval(loopIntervalId.current);
        loopIntervalId.current = null;
      }
    };
  }, [loop, audioBuffer, selectionSize, play, audioContext]);

  return { play, setMasterVolume };
};
