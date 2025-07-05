import { useState, useRef, useCallback, useEffect } from "react";

import { useAudioContext } from "./useAudioContext";
import {
  DEFAULT_SAMPLE_RATE,
  DEFAULT_CHANNEL_COUNT,
  WAVE_LENGTH_SECONDS,
} from "../constants/config";

interface RecorderControls {
  isRecording: boolean;
  audioBuffer: AudioBuffer | null;
  error: string | null;
  startRecording: () => void;
}

// 仕様書に基づき、録音時間を引数で受け取れるようにする
export const useRecorder = (
  recordingTime: number = WAVE_LENGTH_SECONDS * 1000,
): RecorderControls => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const { audioContext } = useAudioContext(); // 共有AudioContextを使用
  const streamRef = useRef<MediaStream | null>(null);

  // AudioContextのクリーンアップはuseAudioContextで行うため、ここでは不要
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBuffer(null);

    if (isRecording) {
      return;
    }

    if (!audioContext) {
      setError("オーディオ機能が利用できません。");
      return;
    }

    let stream: MediaStream;
    try {
      // 音声処理をオフにして生の音声を録音
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // エコーキャンセレーションをオフ
          noiseSuppression: false, // ノイズ抑制をオフ
          autoGainControl: false, // 自動ゲイン制御はオン
          sampleRate: DEFAULT_SAMPLE_RATE, // 高いサンプリングレート
          channelCount: DEFAULT_CHANNEL_COUNT, // モノラル
        },
      });
      streamRef.current = stream;
    } catch (err) {
      console.error("マイクへのアクセスに失敗しました。", err);
      setError("マイクへのアクセス許可が必要です。");
      return;
    }

    setIsRecording(true);

    // 高品質録音のためのMediaRecorderオプション
    const options = {
      mimeType: "audio/webm;codecs=opus",
      audioBitsPerSecond: 128000, // 128kbps
    };

    // ブラウザがサポートしていない場合はフォールバック
    const mimeType = MediaRecorder.isTypeSupported(options.mimeType)
      ? options.mimeType
      : "audio/ogg; codecs=opus";

    mediaRecorder.current = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: options.audioBitsPerSecond,
    });

    const chunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });

      const processAudio = async () => {
        try {
          console.log("録音完了:", {
            blobSize: blob.size,
            blobType: blob.type,
          });

          const arrayBuffer = await blob.arrayBuffer();
          const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);

          console.log("音声デコード完了:", {
            duration: decodedAudio.duration,
            sampleRate: decodedAudio.sampleRate,
            numberOfChannels: decodedAudio.numberOfChannels,
            length: decodedAudio.length,
          });

          setAudioBuffer(decodedAudio);
        } catch (e) {
          console.error("音声データのデコードに失敗しました。", e);
          setError("録音された音声ファイルの形式に問題があります。");
        } finally {
          // 録音が正常/異常終了に関わらず、状態とリソースをクリーンアップ
          stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
          streamRef.current = null;
        }
      };

      void processAudio();
    };

    mediaRecorder.current.start();

    // 指定時間後に録音を停止
    setTimeout(() => {
      stopRecording();
    }, recordingTime);
  }, [isRecording, recordingTime, stopRecording, audioContext]);

  return { isRecording, audioBuffer, error, startRecording };
};
