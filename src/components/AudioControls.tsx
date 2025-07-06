import { Mic, MicOff, PlayArrow, Stop, VolumeUp } from "@mui/icons-material";
import {
  Card,
  CardContent,
  Button,
  LinearProgress,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { useCallback, useState } from "react";

import { useAudioContext } from "../hooks/useAudioContext";
import { usePlayback } from "../hooks/usePlayback";
import { useRecording } from "../hooks/useRecording";
import { useAudioStore } from "../store/audioStore";

export const AudioControls = () => {
  const [volume, setVolume] = useState(0.5);

  // AudioContextの管理
  const { audioContext, isInitialized, isSupported, initializeAudioContext } =
    useAudioContext();

  // 録音・再生の管理
  const recording = useRecording(audioContext);
  const playback = usePlayback(audioContext);

  // ストアの状態（エラー表示用）
  const audioStore = useAudioStore();

  // AudioContextを初期化
  const handleInitializeAudio = useCallback(async () => {
    try {
      await initializeAudioContext();
    } catch (error) {
      console.error("AudioContext初期化エラー:", error);
    }
  }, [initializeAudioContext]);

  // 録音開始
  const handleStartRecording = useCallback(async () => {
    try {
      await recording.startRecording();
    } catch (error) {
      console.error("録音開始エラー:", error);
    }
  }, [recording]);

  // 録音停止
  const handleStopRecording = useCallback(async () => {
    try {
      await recording.stopRecording();
    } catch (error) {
      console.error("録音停止エラー:", error);
    }
  }, [recording]);

  // 再生開始
  const handleStartPlayback = useCallback(() => {
    if (!recording.audioBuffer) return;

    try {
      playback.startPlayback(recording.audioBuffer, volume);
    } catch (error) {
      console.error("再生開始エラー:", error);
    }
  }, [recording.audioBuffer, playback, volume]);

  // 再生停止
  const handleStopPlayback = useCallback(() => {
    try {
      playback.stopPlayback();
    } catch (error) {
      console.error("再生停止エラー:", error);
    }
  }, [playback]);

  // ボリューム変更
  const handleVolumeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(event.target.value);
      setVolume(newVolume);
      playback.setVolume(newVolume);
    },
    [playback],
  );

  // エラー表示
  if (audioStore.error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="body2">{audioStore.error.message}</Typography>
      </Alert>
    );
  }

  // ブラウザ非対応の表示
  if (!isSupported) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          このブラウザはWeb Audio APIをサポートしていません。
        </Typography>
      </Alert>
    );
  }

  // AudioContext未初期化の表示
  if (!isInitialized) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body1">
          音声機能を有効にするには、下のボタンをクリックしてください。
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            void handleInitializeAudio();
          }}
          startIcon={<VolumeUp />}
        >
          音声機能を有効にする
        </Button>
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom>
          Opencollidoscope Web
        </Typography>

        {/* 録音コントロール */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Button
            variant={recording.isRecording ? "contained" : "outlined"}
            color={recording.isRecording ? "error" : "primary"}
            onClick={() => {
              if (recording.isRecording) {
                void handleStopRecording();
              } else {
                void handleStartRecording();
              }
            }}
            disabled={playback.isPlaying}
            startIcon={recording.isRecording ? <MicOff /> : <Mic />}
          >
            {recording.isRecording ? "録音停止" : "録音開始"}
          </Button>

          {recording.isRecording && (
            <Typography variant="body2">
              {recording.recordingTime.toFixed(1)}秒
            </Typography>
          )}
        </Box>

        {/* 録音時間のプログレスバー */}
        {recording.isRecording && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={
                Math.min(
                  100,
                  Math.max(
                    0,
                    (recording.recordingTime / recording.maxRecordingTime) *
                      100,
                  ),
                ) || 0
              }
              sx={{ height: 8, borderRadius: 4 }}
            />
            {/* デバッグ用表示 */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              録音進捗:{" "}
              {(
                (recording.recordingTime / recording.maxRecordingTime) *
                100
              ).toFixed(1)}
              % ({recording.recordingTime.toFixed(2)}s /{" "}
              {recording.maxRecordingTime.toFixed(2)}s)
            </Typography>
          </Box>
        )}

        {/* 再生コントロール */}
        {recording.audioBuffer && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Button
              variant={playback.isPlaying ? "contained" : "outlined"}
              color={playback.isPlaying ? "error" : "success"}
              onClick={() => {
                if (playback.isPlaying) {
                  handleStopPlayback();
                } else {
                  handleStartPlayback();
                }
              }}
              disabled={recording.isRecording}
              startIcon={playback.isPlaying ? <Stop /> : <PlayArrow />}
            >
              {playback.isPlaying ? "再生停止" : "再生開始"}
            </Button>

            {playback.isPlaying && (
              <Typography variant="body2">
                {playback.currentTime.toFixed(1)}秒 /{" "}
                {playback.duration.toFixed(1)}秒
              </Typography>
            )}
          </Box>
        )}

        {/* 再生時間のプログレスバー */}
        {playback.isPlaying && playback.duration > 0 && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={
                Math.min(
                  100,
                  Math.max(0, (playback.currentTime / playback.duration) * 100),
                ) || 0
              }
              sx={{ height: 8, borderRadius: 4 }}
            />
            {/* デバッグ用表示 */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              進捗:{" "}
              {((playback.currentTime / playback.duration) * 100).toFixed(1)}% (
              {playback.currentTime.toFixed(2)}s /{" "}
              {playback.duration.toFixed(2)}s)
            </Typography>
          </Box>
        )}

        {/* ボリューム調整 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <VolumeUp />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            style={{ flex: 1 }}
          />
          <Typography variant="body2" sx={{ minWidth: 40 }}>
            {Math.round(volume * 100)}%
          </Typography>
        </Box>

        {/* 状態表示 */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            状態:{" "}
            {recording.isRecording
              ? "録音中"
              : playback.isPlaying
                ? "再生中"
                : "待機中"}
          </Typography>
          {recording.audioBuffer && (
            <Typography variant="body2" color="text.secondary">
              録音データ: {recording.audioBuffer.duration.toFixed(1)}秒
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
