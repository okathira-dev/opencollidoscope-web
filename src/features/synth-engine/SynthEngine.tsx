import {
  Alert,
  Box,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

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
import {
  type PlayerBOrientation,
  PlayerControlSurface,
} from "./components/PlayerControlSurface.tsx";

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
  const [playerBOrientation, setPlayerBOrientation] = useState<PlayerBOrientation>("facing");

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
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <ToggleButtonGroup
              value={playerBOrientation}
              exclusive
              size="small"
              aria-label="プレイヤー B の向き"
              onChange={(_, value: PlayerBOrientation | null) => {
                if (value !== null) {
                  setPlayerBOrientation(value);
                }
              }}
            >
              <ToggleButton value="facing" aria-label="向き合いモード">
                向き合い
              </ToggleButton>
              <ToggleButton value="stacked" aria-label="二段モード">
                二段
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <PlayerControlSurface
            disabled={!isInitialized}
            hasRecordedBuffer={hasRecordedBuffer}
            isSynthInitialized={isSynthInitialized}
            color={color}
            playerBOrientation={playerBOrientation}
          />
        </Stack>
      )}

      <ConfigPanel />
    </Box>
  );
}
