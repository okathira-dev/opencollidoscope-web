import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import {
  useAudioError,
  useInitializeAudio,
  useIsAudioInitialized,
  useRecordedBuffer,
} from "../../stores/audio-store.ts";
import {
  useInitializeSynth,
  useIsSynthInitialized,
  useSyncSynthBuffer,
  useSyncSynthSelection,
} from "../../stores/synth-store.ts";
import { useWaveSelection } from "../../stores/wave-store.ts";
import { ConfigPanel } from "./components/ConfigPanel.tsx";
import { ControlPanel } from "./components/ControlPanel.tsx";
import { SelectionRail } from "./components/SelectionRail.tsx";
import { WaveDisplay } from "./components/WaveDisplay.tsx";

export interface SynthEngineProps {
  engineId: number;
  color: string;
}

export function SynthEngine({ engineId, color }: SynthEngineProps) {
  const isInitialized = useIsAudioInitialized();
  const isSynthInitialized = useIsSynthInitialized();
  const audioError = useAudioError();
  const recordedBuffer = useRecordedBuffer();
  const initializeAudio = useInitializeAudio();
  const initializeSynth = useInitializeSynth();
  const syncSynthBuffer = useSyncSynthBuffer();
  const syncSynthSelection = useSyncSynthSelection();
  const selection = useWaveSelection();

  const [initError, setInitError] = useState<string | null>(null);

  const handleInitialize = useCallback(async () => {
    setInitError(null);
    try {
      await initializeAudio();
      await initializeSynth();
    } catch (error) {
      setInitError(error instanceof Error ? error.message : String(error));
    }
  }, [initializeAudio, initializeSynth]);

  useEffect(() => {
    if (!isSynthInitialized || !recordedBuffer) {
      return;
    }
    syncSynthBuffer(recordedBuffer);
    syncSynthSelection();
  }, [isSynthInitialized, recordedBuffer, syncSynthBuffer, syncSynthSelection]);

  const hasRecordedBuffer = recordedBuffer !== null && !selection.isNull;

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
          <SelectionRail disabled={selection.isNull} />
          <ControlPanel
            disabled={!isInitialized}
            hasRecordedBuffer={hasRecordedBuffer}
            isSynthInitialized={isSynthInitialized}
            color={color}
          />
        </Stack>
      )}

      <ConfigPanel />
    </Box>
  );
}
