import { useCallback, useRef, useState } from "react";

import type {
  RecordingState,
  AudioProcessingResult,
  AudioError,
} from "../utils/types";

export function useRecording(audioContext: AudioContext | null) {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPlaying: false,
    audioBuffer: null,
    recordingTime: 0,
    maxRecordingTime: 2.0, // 2秒間の録音
  });

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingDataRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // マイクへのアクセス許可を取得
  const requestMicrophoneAccess = async (): Promise<
    AudioProcessingResult<MediaStream>
  > => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
        },
      });

      mediaStreamRef.current = stream;

      return {
        success: true,
        data: stream,
      };
    } catch (error) {
      const audioError: AudioError = {
        code: "MICROPHONE_ACCESS_ERROR",
        message:
          error instanceof Error ? error.message : "Microphone access denied",
        details: { error },
      };

      return {
        success: false,
        error: audioError,
      };
    }
  };

  // 録音開始
  const startRecording = useCallback(async (): Promise<
    AudioProcessingResult<void>
  > => {
    try {
      if (!audioContext) {
        throw new Error("Audio context not initialized");
      }

      if (recordingState.isRecording) {
        return {
          success: false,
          error: {
            code: "RECORDING_ALREADY_IN_PROGRESS",
            message: "Recording is already in progress",
          },
        };
      }

      // マイクアクセス
      const micResult = await requestMicrophoneAccess();
      if (!micResult.success || !micResult.data) {
        return {
          success: false,
          error: micResult.error,
        };
      }

      const stream = micResult.data;

      // MediaRecorderの設定
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      recordingDataRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingDataRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordingDataRef.current, { type: "audio/webm" });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        console.log(`📊 録音データ:`, {
          blobSize: blob.size,
          audioBufferDuration: audioBuffer.duration,
          audioBufferLength: audioBuffer.length,
          sampleRate: audioBuffer.sampleRate,
          expectedDuration: recordingState.maxRecordingTime,
        });

        setRecordingState((prev) => ({
          ...prev,
          isRecording: false,
          audioBuffer,
          recordingTime: 0,
        }));

        // ストリームを停止
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;

      // 録音開始
      mediaRecorder.start();

      // 録音時間の更新
      const startTime = Date.now();
      const maxTime = recordingState.maxRecordingTime;

      recordingTimerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const recordingTime = Math.min(elapsed, maxTime);

        setRecordingState((prev) => ({
          ...prev,
          recordingTime,
        }));

        // 最大録音時間に達したら停止
        if (elapsed >= maxTime) {
          // タイマーをクリア
          if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
          }

          // 直接MediaRecorderを停止
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
          ) {
            mediaRecorderRef.current.stop();
          }
        }
      }, 50); // 50msに変更してより滑らかに

      setRecordingState((prev) => ({
        ...prev,
        isRecording: true,
        recordingTime: 0,
      }));

      return {
        success: true,
      };
    } catch (error) {
      const audioError: AudioError = {
        code: "RECORDING_START_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to start recording",
        details: { error },
      };

      return {
        success: false,
        error: audioError,
      };
    }
  }, [
    audioContext,
    recordingState.isRecording,
    recordingState.maxRecordingTime,
  ]);

  // 録音停止
  const stopRecording = useCallback((): Promise<
    AudioProcessingResult<void>
  > => {
    try {
      if (!recordingState.isRecording) {
        return Promise.resolve({
          success: false,
          error: {
            code: "RECORDING_NOT_IN_PROGRESS",
            message: "Recording is not in progress",
          },
        });
      }

      // タイマーをクリア
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // MediaRecorderを停止
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      return Promise.resolve({
        success: true,
      });
    } catch (error) {
      const audioError: AudioError = {
        code: "RECORDING_STOP_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to stop recording",
        details: { error },
      };

      return Promise.resolve({
        success: false,
        error: audioError,
      });
    }
  }, [recordingState.isRecording]);

  // クリーンアップ
  const cleanup = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    ...recordingState,
    startRecording,
    stopRecording,
    cleanup,
  };
}
