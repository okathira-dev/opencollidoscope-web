import { Alert, Box, Button, Slider, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  useAudioError,
  useInitializeAudio,
  useIsAudioInitialized,
  useIsRecording,
  useRecordedBuffer,
  useStartRecording,
  useStopRecording,
} from "../../stores/audio-store.ts";
import { useConfig, useConfigAudio } from "../../stores/config-store.ts";
import {
  useGrainDurationCoeff,
  useInitializeSynth,
  useIsSynthInitialized,
  useSetGrainDurationCoeff,
  useSyncSynthBuffer,
  useSyncSynthSelection,
} from "../../stores/synth-store.ts";
import { useSetWaveSelection, useWaveSelection } from "../../stores/wave-store.ts";
import { ConfigPanel } from "./components/ConfigPanel.tsx";
import { PianoKeyboard } from "./components/PianoKeyboard.tsx";
import { WaveDisplay } from "./components/WaveDisplay.tsx";
import { useSelectionWheel } from "./hooks/useSelectionWheel.ts";

export interface SynthEngineProps {
  engineId: number;
  color: string;
}

export function SynthEngine({ engineId, color }: SynthEngineProps) {
  const isInitialized = useIsAudioInitialized();
  const isSynthInitialized = useIsSynthInitialized();
  const isRecording = useIsRecording();
  const audioError = useAudioError();
  const recordedBuffer = useRecordedBuffer();
  const initializeAudio = useInitializeAudio();
  const initializeSynth = useInitializeSynth();
  const startRecording = useStartRecording();
  const stopRecording = useStopRecording();
  const audioConfig = useConfigAudio();
  const config = useConfig();
  const selection = useWaveSelection();
  const setSelection = useSetWaveSelection();
  const grainDurationCoeff = useGrainDurationCoeff();
  const setGrainDurationCoeff = useSetGrainDurationCoeff();
  const syncSynthBuffer = useSyncSynthBuffer();
  const syncSynthSelection = useSyncSynthSelection();

  const [initError, setInitError] = useState<string | null>(null);
  const selectionSliderRef = useRef<HTMLDivElement>(null);

  useSelectionWheel(selectionSliderRef, selection, setSelection, !selection.isNull);

  const handleInitialize = useCallback(async () => {
    setInitError(null);
    try {
      await initializeAudio();
      await initializeSynth();
    } catch (error) {
      setInitError(error instanceof Error ? error.message : String(error));
    }
  }, [initializeAudio, initializeSynth]);

  const handleRecord = useCallback(async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    await startRecording();
  }, [isRecording, startRecording, stopRecording]);

  useEffect(() => {
    if (!isSynthInitialized || !recordedBuffer) {
      return;
    }
    syncSynthBuffer(recordedBuffer);
    syncSynthSelection();
  }, [isSynthInitialized, recordedBuffer, syncSynthBuffer, syncSynthSelection]);

  const handleSelectionStartChange = useCallback(
    (_: Event, value: number | number[]) => {
      const start = Array.isArray(value) ? (value[0] ?? selection.start) : value;
      setSelection(Math.round(start), selection.size);
    },
    [selection.start, selection.size, setSelection],
  );

  const handleGrainDurationChange = useCallback(
    (_: Event, value: number | number[]) => {
      const coeff = Array.isArray(value) ? (value[0] ?? grainDurationCoeff) : value;
      setGrainDurationCoeff(coeff);
    },
    [grainDurationCoeff, setGrainDurationCoeff],
  );

  const maxSelectionStart = Math.max(0, config.audio.chunkCount - 1);
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

          <Stack spacing={1} sx={{ px: 1 }}>
            <Typography variant="body2" color="text.secondary">
              選択: 開始 {selection.start} / サイズ {selection.size}{" "}
              チャンク（ドラッグで位置、ホイールでサイズ、横スクロールで位置）
            </Typography>
            <Box ref={selectionSliderRef}>
              <Slider
                value={selection.start}
                min={0}
                max={maxSelectionStart}
                step={1}
                disabled={selection.isNull}
                onChange={handleSelectionStartChange}
                aria-label="選択開始位置"
              />
            </Box>
          </Stack>

          <Stack spacing={1} sx={{ px: 1, maxWidth: 400 }}>
            <Typography variant="body2" color="text.secondary">
              グレイン持続係数: {grainDurationCoeff.toFixed(1)}
            </Typography>
            <Slider
              value={grainDurationCoeff}
              min={config.granular.grainDurationRange.min}
              max={config.granular.grainDurationRange.max}
              step={0.1}
              onChange={handleGrainDurationChange}
              aria-label="グレイン持続係数"
            />
          </Stack>

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
                : hasRecordedBuffer
                  ? "録音済み。鍵盤で演奏できます"
                  : "マイクから録音して波形を表示します"}
            </Typography>
          </Stack>

          <PianoKeyboard disabled={!hasRecordedBuffer || !isSynthInitialized} />
        </Stack>
      )}

      <ConfigPanel />
    </Box>
  );
}
