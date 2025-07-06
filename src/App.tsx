import { Container, Typography, Alert, Box } from "@mui/material";
import { useEffect } from "react";

import { AudioControls } from "./components/AudioControls";
import { WaveformDisplay } from "./components/WaveformDisplay";
import { useAudioContext } from "./hooks/useAudioContext";
import { useWorkletState } from "./store/audioStore";

function App() {
  const { initializeAudioContext, error } = useAudioContext();
  const workletState = useWorkletState();

  // デバッグ: workletStateの変更を追跡（一時的に無効化）
  // useEffect(() => {
  //   console.log("🔍 App.tsx - workletState updated:", {
  //     isRecording: workletState.isRecording,
  //     chunks: workletState.chunks.length,
  //     totalChunks: workletState.totalChunks,
  //     recordedFrames: workletState.recordedFrames,
  //   });
  // }, [workletState]);

  useEffect(() => {
    void initializeAudioContext();
  }, [initializeAudioContext]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Collidoscope Web
      </Typography>

      <Typography
        variant="h6"
        component="h2"
        gutterBottom
        align="center"
        color="text.secondary"
      >
        グラニュラーシンセサイザー
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* 基本的なオーディオコントロール */}
        <AudioControls />

        {/* 波形表示 */}
        <WaveformDisplay
          chunks={workletState.chunks}
          width={800}
          height={200}
          title="チャンク波形表示（150分割）"
          showChunks={true}
        />

        {/* AudioWorkletステータス */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>AudioWorkletステータス:</strong>
            <br />
            録音中: {workletState.isRecording ? "Yes" : "No"}
            <br />
            チャンク数: {workletState.chunks.length} /{" "}
            {workletState.totalChunks}
            <br />
            録音フレーム数: {workletState.recordedFrames}
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
}

export default App;
