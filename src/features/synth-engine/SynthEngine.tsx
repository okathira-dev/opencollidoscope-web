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
import type { PlayerLayout } from "../../stores/ui-store.ts";
import { useHardwareVariant, usePlayerLayout, useSetPlayerLayout } from "../../stores/ui-store.ts";
import { useWaveSelection } from "../../stores/wave-store.ts";
import { ConfigPanel } from "./components/ConfigPanel.tsx";
import { PlayerControlSurface } from "./components/PlayerControlSurface.tsx";
import { VariantSwitcher } from "./components/VariantSwitcher.tsx";

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
  const hardwareVariant = useHardwareVariant();
  const playerLayout = usePlayerLayout();
  const setPlayerLayout = useSetPlayerLayout();

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
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>
            <VariantSwitcher />
            <ToggleButtonGroup
              value={playerLayout}
              exclusive
              size="small"
              aria-label="プレイヤー配置モード"
              onChange={(_, value: PlayerLayout | null) => {
                if (value !== null) {
                  setPlayerLayout(value);
                }
              }}
            >
              <ToggleButton value="facing" aria-label="向き合いモード">
                向き合い
              </ToggleButton>
              <ToggleButton value="stacked" aria-label="二段モード">
                二段
              </ToggleButton>
              <ToggleButton value="solo" aria-label="ソロモード">
                ソロ
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <PlayerControlSurface
            disabled={!isInitialized}
            hasRecordedBuffer={hasRecordedBuffer}
            isSynthInitialized={isSynthInitialized}
            color={color}
            playerLayout={playerLayout}
            variant={hardwareVariant}
          />
        </Stack>
      )}

      <ConfigPanel />
    </Box>
  );
}
