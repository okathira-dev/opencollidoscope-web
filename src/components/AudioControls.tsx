import {
  Mic,
  PlayArrow,
  Stop,
  VolumeUp,
  GraphicEq,
  Science,
} from "@mui/icons-material";
import {
  Button,
  LinearProgress,
  Typography,
  Box,
  Alert,
  Paper,
  Divider,
  Grid,
  Slider,
} from "@mui/material";
import { useCallback, useState } from "react";

import { useAudioContext } from "../hooks/useAudioContext";
import { useAudioWorkletZustand } from "../hooks/useAudioWorkletZustand";
import { usePlayback } from "../hooks/usePlayback";
import { useRecording } from "../hooks/useRecording";
import { useAudioStore } from "../store/audioStore";

export const AudioControls = () => {
  const [volume, setVolume] = useState(0.5);

  // AudioContextの管理
  const {
    audioContext,
    isInitialized,
    isSupported,
    initializeAudioContext,
    error,
  } = useAudioContext();

  // 録音・再生の管理
  const recording = useRecording(audioContext);
  const playback = usePlayback(audioContext);

  // ストアの状態（エラー表示用）
  const audioStore = useAudioStore();

  // AudioWorkletの管理
  const {
    workletState,
    initializeWorklet,
    startWorkletRecording,
    stopWorkletRecording,
    createAudioBufferFromChunks,
  } = useAudioWorkletZustand(audioContext);

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
    (event: Event, newValue: number | number[]) => {
      setVolume(newValue as number);
      playback.setVolume(newValue as number);
    },
    [playback],
  );

  // AudioWorklet関連のハンドラー
  const handleInitializeWorklet = () => {
    void initializeWorklet();
  };

  const handleStartWorkletRecording = () => {
    void startWorkletRecording(2.0); // 2秒間録音
  };

  const handleStopWorkletRecording = () => {
    stopWorkletRecording();
  };

  const handlePlayWorkletBuffer = () => {
    if (playback.isPlaying) {
      handleStopPlayback();
    } else {
      const buffer = createAudioBufferFromChunks();
      if (buffer) {
        playback.startPlayback(buffer, volume);
      }
    }
  };

  // 進捗計算
  const progress =
    playback.duration > 0
      ? (playback.currentTime / playback.duration) * 100
      : 0;
  const workletProgress =
    workletState.totalChunks > 0
      ? (workletState.chunks.length / workletState.totalChunks) * 100
      : 0;

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
    <Paper elevation={3} sx={{ p: 3, m: 1 }}>
      <Typography variant="h5" gutterBottom>
        🎛️ オーディオコントロール
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 基本的な録音・再生コントロール */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            <Mic sx={{ mr: 1 }} />
            基本録音・再生
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                void handleInitializeAudio();
              }}
              disabled={!!audioContext}
              sx={{ mr: 1 }}
            >
              初期化
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                void handleStartRecording();
              }}
              disabled={!audioContext || recording.isRecording}
              startIcon={<Mic />}
              sx={{ mr: 1 }}
            >
              録音開始
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={() => {
                void handleStopRecording();
              }}
              disabled={!recording.isRecording}
              startIcon={<Stop />}
              sx={{ mr: 1 }}
            >
              録音停止
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={() => {
                if (playback.isPlaying) {
                  handleStopPlayback();
                } else {
                  handleStartPlayback();
                }
              }}
              disabled={!recording.audioBuffer || recording.isRecording}
              startIcon={playback.isPlaying ? <Stop /> : <PlayArrow />}
            >
              {playback.isPlaying ? "停止" : "再生"}
            </Button>
          </Box>

          {/* 録音状態表示 */}
          <Alert severity="info" sx={{ mb: 2 }}>
            録音中: {recording.isRecording ? "Yes" : "No"}
            <br />
            再生中: {playback.isPlaying ? "Yes" : "No"}
            <br />
            録音時間: {recording.recordingTime.toFixed(1)}秒<br />
            再生時間: {playback.currentTime.toFixed(1)}秒 /{" "}
            {playback.duration.toFixed(1)}秒
          </Alert>

          {/* 再生進捗 */}
          {playback.isPlaying && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">再生進捗</Typography>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption">{progress.toFixed(1)}%</Typography>
            </Box>
          )}
        </Grid>

        {/* AudioWorkletコントロール */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            <Science sx={{ mr: 1 }} />
            AudioWorklet（チャンク分割録音）
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleInitializeWorklet}
              disabled={!audioContext}
              sx={{ mr: 1 }}
            >
              Worklet初期化
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={handleStartWorkletRecording}
              disabled={!audioContext || workletState.isRecording}
              startIcon={<GraphicEq />}
              sx={{ mr: 1 }}
            >
              チャンク録音
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={handleStopWorkletRecording}
              disabled={!workletState.isRecording}
              startIcon={<Stop />}
              sx={{ mr: 1 }}
            >
              停止
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={handlePlayWorkletBuffer}
              disabled={
                workletState.chunks.length === 0 || workletState.isRecording
              }
              startIcon={<PlayArrow />}
            >
              チャンク再生
            </Button>
          </Box>

          {/* AudioWorklet状態表示 */}
          <Alert severity="info" sx={{ mb: 2 }}>
            録音中: {workletState.isRecording ? "Yes" : "No"}
            <br />
            チャンク数: {workletState.chunks.length} /{" "}
            {workletState.totalChunks}
            <br />
            録音フレーム数: {workletState.recordedFrames}
          </Alert>

          {/* チャンク録音進捗 */}
          {workletState.isRecording && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">チャンク録音進捗</Typography>
              <LinearProgress variant="determinate" value={workletProgress} />
              <Typography variant="caption">
                {workletProgress.toFixed(1)}% ({workletState.chunks.length}/
                {workletState.totalChunks})
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* ボリューム調整 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          <VolumeUp sx={{ mr: 1 }} />
          ボリューム
        </Typography>

        <Slider
          value={volume}
          onChange={handleVolumeChange}
          min={0}
          max={1}
          step={0.1}
          marks
          valueLabelDisplay="auto"
          sx={{ width: "100%" }}
        />

        <Typography variant="caption" color="text.secondary">
          現在のボリューム: {(volume * 100).toFixed(0)}%
        </Typography>
      </Box>
    </Paper>
  );
};
