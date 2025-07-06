import { useCallback, useRef } from "react";

import { useWorkletActions, useWorkletState } from "../store/audioStore";

import type {
  AudioError,
  AudioProcessingResult,
  ChunkData,
  WorkletMessage,
  WorkletMessagePayload,
} from "../utils/types";

export function useAudioWorkletZustand(audioContext: AudioContext | null) {
  const workletState = useWorkletState();
  const {
    setWorkletInitialized,
    setWorkletRecording,
    addChunk,
    clearChunks,
    setWorkletFrames,
    setWorkletTotalChunks,
  } = useWorkletActions();

  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // AudioWorkletからのメッセージ処理
  const handleWorkletMessage = useCallback(
    (message: WorkletMessage) => {
      switch (message.type) {
        case "recording-started":
          console.log("📡 Recording started:", message.payload);
          break;

        case "chunk": {
          const payload = message.payload as WorkletMessagePayload<"chunk">;
          if (!audioContext) return;

          const chunkData: ChunkData = {
            id: payload.chunkIndex,
            startTime: payload.timestamp,
            endTime:
              payload.timestamp +
              payload.audioData.length / audioContext.sampleRate,
            data: payload.audioData,
            isSelected: false,
          };

          addChunk(chunkData);
          console.log(`🔄 Chunk added to store: ${payload.chunkIndex}`);

          console.log(`📦 Chunk ${payload.chunkIndex} received:`, {
            size: payload.audioData.length,
            min: payload.minValue,
            max: payload.maxValue,
          });
          break;
        }

        case "recording-stopped": {
          const payload =
            message.payload as WorkletMessagePayload<"recording-stopped">;
          console.log("📡 Recording stopped:", payload);
          setWorkletFrames(payload.totalFrames);
          break;
        }

        default:
          console.warn("Unknown worklet message:", message.type);
      }
    },
    [audioContext, addChunk, setWorkletFrames],
  );

  // AudioWorkletProcessorを初期化
  const initializeWorklet = useCallback(async (): Promise<
    AudioProcessingResult<void>
  > => {
    try {
      if (!audioContext) {
        throw new Error("Audio context not initialized");
      }

      // AudioWorkletProcessorを読み込み
      const workletPath = new URL(
        "../worklets/recording-processor.js",
        import.meta.url,
      );
      await audioContext.audioWorklet.addModule(workletPath);

      setWorkletInitialized(true);
      console.log("✅ AudioWorkletProcessor loaded successfully");

      return { success: true };
    } catch (error) {
      const audioError: AudioError = {
        code: "WORKLET_INITIALIZATION_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to initialize AudioWorklet",
        details: { error },
      };

      return { success: false, error: audioError };
    }
  }, [audioContext, setWorkletInitialized]);

  // 録音開始（AudioWorkletを使用）
  const startWorkletRecording = useCallback(
    async (duration: number = 2.0): Promise<AudioProcessingResult<void>> => {
      try {
        if (!audioContext) {
          throw new Error("Audio context not initialized");
        }

        if (workletState.isRecording) {
          return {
            success: false,
            error: {
              code: "RECORDING_ALREADY_IN_PROGRESS",
              message: "Recording is already in progress",
            },
          };
        }

        // マイクアクセスを取得
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: audioContext.sampleRate,
          },
        });

        // AudioWorkletNode作成
        const workletNode = new AudioWorkletNode(
          audioContext,
          "recording-processor",
          {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            channelCount: 1,
            channelCountMode: "explicit",
            channelInterpretation: "speakers",
          },
        );

        // MediaStreamAudioSourceNode作成
        const sourceNode = audioContext.createMediaStreamSource(stream);

        // メッセージハンドラー設定
        workletNode.port.onmessage = (event: MessageEvent<WorkletMessage>) => {
          handleWorkletMessage(event.data);
        };

        // ノード接続
        sourceNode.connect(workletNode);

        // 参照を保存
        workletNodeRef.current = workletNode;
        sourceNodeRef.current = sourceNode;
        mediaStreamRef.current = stream;

        // 録音開始
        workletNode.port.postMessage({
          type: "start",
          payload: { duration },
        });

        // 状態を更新
        setWorkletRecording(true);
        clearChunks();
        setWorkletTotalChunks(150);
        setWorkletFrames(0);

        console.log("🎤 AudioWorklet recording started:", { duration });

        return { success: true };
      } catch (error) {
        const audioError: AudioError = {
          code: "WORKLET_RECORDING_START_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to start worklet recording",
          details: { error },
        };

        return { success: false, error: audioError };
      }
    },
    [
      audioContext,
      workletState.isRecording,
      setWorkletRecording,
      clearChunks,
      setWorkletTotalChunks,
      setWorkletFrames,
      handleWorkletMessage,
    ],
  );

  // 録音停止
  const stopWorkletRecording = useCallback((): AudioProcessingResult<void> => {
    try {
      if (!workletState.isRecording) {
        return {
          success: false,
          error: {
            code: "RECORDING_NOT_IN_PROGRESS",
            message: "Recording is not in progress",
          },
        };
      }

      // 録音停止
      if (workletNodeRef.current) {
        workletNodeRef.current.port.postMessage({ type: "stop" });
      }

      // ノード切断
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }

      if (workletNodeRef.current) {
        workletNodeRef.current.disconnect();
      }

      // MediaStreamを停止
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // 参照をクリア
      workletNodeRef.current = null;
      sourceNodeRef.current = null;
      mediaStreamRef.current = null;

      setWorkletRecording(false);

      console.log("🛑 AudioWorklet recording stopped");

      return { success: true };
    } catch (error) {
      const audioError: AudioError = {
        code: "WORKLET_RECORDING_STOP_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to stop worklet recording",
        details: { error },
      };

      return { success: false, error: audioError };
    }
  }, [workletState.isRecording, setWorkletRecording]);

  // チャンクからAudioBufferを作成
  const createAudioBufferFromChunks = useCallback((): AudioBuffer | null => {
    if (!audioContext || workletState.chunks.length === 0) {
      return null;
    }

    try {
      // 全チャンクのサンプル数を計算
      const totalSamples = workletState.chunks.reduce(
        (sum, chunk) => sum + chunk.data.length,
        0,
      );

      // AudioBufferを作成
      const audioBuffer = audioContext.createBuffer(
        1, // モノラル
        totalSamples,
        audioContext.sampleRate,
      );

      // チャンクデータを結合
      const channelData = audioBuffer.getChannelData(0);
      let offset = 0;

      for (const chunk of workletState.chunks) {
        channelData.set(chunk.data, offset);
        offset += chunk.data.length;
      }

      console.log("🔊 AudioBuffer created from chunks:", {
        totalSamples,
        duration: audioBuffer.duration,
        chunkCount: workletState.chunks.length,
      });

      return audioBuffer;
    } catch (error) {
      console.error("❌ Failed to create AudioBuffer from chunks:", error);
      return null;
    }
  }, [audioContext, workletState.chunks]);

  // クリーンアップ
  const cleanup = useCallback(() => {
    if (workletState.isRecording) {
      stopWorkletRecording();
    }
  }, [workletState.isRecording, stopWorkletRecording]);

  return {
    workletState,
    initializeWorklet,
    startWorkletRecording,
    stopWorkletRecording,
    createAudioBufferFromChunks,
    cleanup,
  };
}
