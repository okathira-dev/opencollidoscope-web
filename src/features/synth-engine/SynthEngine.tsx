import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useCallback, useState } from "react";

import {
  useAudioError,
  useInitializeAudio,
  useIsAudioInitialized,
  useIsRecording,
  useStartRecording,
  useStopRecording,
} from "../../stores/audio-store.ts";
import { useConfigAudio } from "../../stores/config-store.ts";
import { ConfigPanel } from "./components/ConfigPanel.tsx";
import { WaveDisplay } from "./components/WaveDisplay.tsx";

export interface SynthEngineProps {
  engineId: number;
  color: string;
}

export function SynthEngine({ engineId, color }: SynthEngineProps) {
  const isInitialized = useIsAudioInitialized();
  const isRecording = useIsRecording();
  const audioError = useAudioError();
  const initializeAudio = useInitializeAudio();
  const startRecording = useStartRecording();
  const stopRecording = useStopRecording();
  const audioConfig = useConfigAudio();

  const [initError, setInitError] = useState<string | null>(null);

  const handleInitialize = useCallback(async () => {
    setInitError(null);
    try {
      await initializeAudio();
    } catch (error) {
      setInitError(error instanceof Error ? error.message : String(error));
    }
  }, [initializeAudio]);

  const handleRecord = useCallback(async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    await startRecording();
  }, [isRecording, startRecording, stopRecording]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#000000",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 3,
        px: 2,
      }}
      data-engine-id={engineId}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>
        Open Collidoscope
      </Typography>

      {(audioError || initError) && (
        <Alert severity="error" sx={{ mb: 2, width: "100%", maxWidth: 800 }}>
          {audioError ?? initError}
        </Alert>
      )}

      {!isInitialized ? (
        <Button variant="contained" size="large" onClick={handleInitialize}>
          音声を開始
        </Button>
      ) : (
        <Stack spacing={2} sx={{ width: "100%", maxWidth: 1400 }}>
          <WaveDisplay color={color} />

          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Button
              variant="contained"
              color={isRecording ? "warning" : "primary"}
              onClick={handleRecord}
              disabled={!isInitialized}
            >
              {isRecording ? "録音停止" : "録音"}
            </Button>
            <Typography variant="body2" color="text.secondary">
              {isRecording
                ? `録音中... (${audioConfig.waveLength.toFixed(1)}秒)`
                : "マイクから録音して波形を表示します"}
            </Typography>
          </Stack>
        </Stack>
      )}

      <ConfigPanel />
    </Box>
  );
}
