import { useCallback, useRef, useState } from "react";

import type { AudioProcessingResult, AudioError } from "../utils/types";

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export function usePlayback(audioContext: AudioContext | null) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 再生開始
  const startPlayback = useCallback(
    (
      audioBuffer: AudioBuffer,
      gain: number = 1.0,
    ): AudioProcessingResult<void> => {
      try {
        if (!audioContext) {
          throw new Error("Audio context not initialized");
        }

        if (playbackState.isPlaying) {
          return {
            success: false,
            error: {
              code: "PLAYBACK_ALREADY_IN_PROGRESS",
              message: "Playback is already in progress",
            },
          };
        }

        // AudioBufferSourceNodeの作成
        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;

        // GainNodeの作成
        const gainNode = audioContext.createGain();
        gainNode.gain.value = gain;

        // ノードの接続
        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // 再生終了時の処理
        sourceNode.onended = () => {
          console.log(`🔚 AudioNode終了イベント`);

          // アニメーションフレームをキャンセル
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }

          setPlaybackState((prev) => ({
            ...prev,
            isPlaying: false,
            currentTime: prev.duration, // 最終時間を設定
          }));

          // 少し遅延してから0にリセット（プログレスバーが100%表示される時間を確保）
          setTimeout(() => {
            setPlaybackState((prev) => ({
              ...prev,
              currentTime: 0,
            }));
          }, 100);

          // ノードの参照をクリア
          sourceNodeRef.current = null;
          gainNodeRef.current = null;
        };

        // 参照を保存
        sourceNodeRef.current = sourceNode;
        gainNodeRef.current = gainNode;

        // 再生開始
        sourceNode.start();

        // 再生時間の更新（requestAnimationFrameを使用）
        const startTime = Date.now();
        const duration = audioBuffer.duration;

        console.log(`▶️ 再生開始:`, {
          audioBufferDuration: duration,
          sampleRate: audioBuffer.sampleRate,
          numberOfChannels: audioBuffer.numberOfChannels,
        });

        // requestAnimationFrameを使用したプログレス更新
        // TODO: プログレスバーの進行が遅れている可能性がある
        // - Date.now()とAudioContextの時間同期の問題
        // - requestAnimationFrameの実行タイミングのズレ
        // - 音声再生とプログレス表示の同期精度の改善が必要
        const updateProgress = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          const currentTime = Math.min(elapsed, duration);

          setPlaybackState((prev) => ({
            ...prev,
            currentTime,
          }));

          // フェイルセーフとしての停止処理（onendedが発火しない場合のバックアップ）
          if (elapsed >= duration * 1.2) {
            // 20%の余裕を追加（フェイルセーフのため）
            console.log(`⚠️ requestAnimationFrame強制停止:`, {
              elapsed,
              duration,
              ratio: elapsed / duration,
            });

            // アニメーションフレームをキャンセル
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }

            // SourceNodeを停止
            if (sourceNodeRef.current) {
              sourceNodeRef.current.stop();
              sourceNodeRef.current = null;
            }

            // GainNodeの参照をクリア
            gainNodeRef.current = null;

            setPlaybackState((prev) => ({
              ...prev,
              isPlaying: false,
              currentTime: 0,
            }));
          } else {
            // 次のフレームで再度実行
            animationFrameRef.current = requestAnimationFrame(updateProgress);
          }
        };

        // 初回実行
        animationFrameRef.current = requestAnimationFrame(updateProgress);

        setPlaybackState({
          isPlaying: true,
          currentTime: 0,
          duration: audioBuffer.duration,
        });

        return {
          success: true,
        };
      } catch (error) {
        const audioError: AudioError = {
          code: "PLAYBACK_START_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to start playback",
          details: { error },
        };

        return {
          success: false,
          error: audioError,
        };
      }
    },

    [audioContext, playbackState.isPlaying],
  );

  // 再生停止
  const stopPlayback = useCallback((): AudioProcessingResult<void> => {
    try {
      if (!playbackState.isPlaying) {
        return {
          success: false,
          error: {
            code: "PLAYBACK_NOT_IN_PROGRESS",
            message: "Playback is not in progress",
          },
        };
      }

      // アニメーションフレームをキャンセル
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // SourceNodeを停止
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }

      // GainNodeの参照をクリア
      gainNodeRef.current = null;

      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));

      return {
        success: true,
      };
    } catch (error) {
      const audioError: AudioError = {
        code: "PLAYBACK_STOP_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to stop playback",
        details: { error },
      };

      return {
        success: false,
        error: audioError,
      };
    }
  }, [playbackState.isPlaying]);

  // ボリューム調整
  const setVolume = useCallback((volume: number): void => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // クリーンアップ
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }

    gainNodeRef.current = null;
  }, []);

  return {
    ...playbackState,
    startPlayback,
    stopPlayback,
    setVolume,
    cleanup,
  };
}
