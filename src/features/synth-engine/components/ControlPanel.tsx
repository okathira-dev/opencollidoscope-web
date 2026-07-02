import { Box, Divider, Switch, Typography } from "@mui/material";
import { useCallback } from "react";

import {
  useIsRecording,
  useStartRecording,
  useStopRecording,
} from "../../../stores/audio-store.ts";
import { useConfig, useConfigAudio } from "../../../stores/config-store.ts";
import {
  useGrainDurationCoeff,
  useLoopEnabled,
  useSetGrainDurationCoeff,
  useSetLoopEnabled,
} from "../../../stores/synth-store.ts";
import { useSetWaveSelection, useWaveSelection } from "../../../stores/wave-store.ts";
import { KeyboardCluster } from "./KeyboardCluster.tsx";
import { RecordButton } from "./RecordButton.tsx";
import { SpeakerGrille } from "./SpeakerGrille.tsx";
import { VerticalSlider } from "./VerticalSlider.tsx";

export interface ControlPanelProps {
  disabled?: boolean;
  hasRecordedBuffer?: boolean;
  isSynthInitialized?: boolean;
  color?: string;
}

export function ControlPanel({
  disabled = false,
  hasRecordedBuffer = false,
  isSynthInitialized = false,
  color = "#f3063e",
}: ControlPanelProps) {
  const config = useConfig();
  const audioConfig = useConfigAudio();
  const isRecording = useIsRecording();
  const startRecording = useStartRecording();
  const stopRecording = useStopRecording();
  const selection = useWaveSelection();
  const setSelection = useSetWaveSelection();
  const grainDurationCoeff = useGrainDurationCoeff();
  const setGrainDurationCoeff = useSetGrainDurationCoeff();
  const loopEnabled = useLoopEnabled();
  const setLoopEnabled = useSetLoopEnabled();

  const maxSelectionSize = Math.min(config.audio.maxSelectionSize, config.audio.chunkCount);
  const selectionDisabled = disabled || selection.isNull;
  const pianoDisabled = !hasRecordedBuffer || !isSynthInitialized;

  const handleRecordToggle = useCallback(async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    await startRecording();
  }, [isRecording, startRecording, stopRecording]);

  const handleDurationChange = useCallback(
    (value: number) => {
      setGrainDurationCoeff(value);
    },
    [setGrainDurationCoeff],
  );

  const handleSelectionSizeChange = useCallback(
    (value: number) => {
      setSelection(selection.start, Math.round(value));
    },
    [selection.start, setSelection],
  );

  const recordStatusText = isRecording
    ? `録音中 (${audioConfig.waveLength.toFixed(1)}秒)`
    : hasRecordedBuffer
      ? "録音済み"
      : "録音";

  return (
    <Box
      sx={{
        width: "100%",
        mt: 2,
        pt: 2,
        borderTop: "1px solid #333",
        overflowX: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 2,
          minWidth: "min-content",
          px: 1,
          pb: 1,
        }}
      >
        <VerticalSlider
          value={50}
          onChange={() => {}}
          min={0}
          max={100}
          disabled
          label="Filter"
          aria-label="フィルター（M3で実装）"
          height={140}
        />

        <Divider orientation="vertical" flexItem sx={{ borderColor: "#333" }} />

        <VerticalSlider
          value={grainDurationCoeff}
          onChange={handleDurationChange}
          min={config.granular.grainDurationRange.min}
          max={config.granular.grainDurationRange.max}
          step={0.1}
          disabled={disabled}
          label="Duration"
          valueLabel={grainDurationCoeff.toFixed(1)}
          color={color}
          aria-label="グレイン持続係数"
          height={140}
        />

        <VerticalSlider
          value={selection.size}
          onChange={handleSelectionSizeChange}
          min={1}
          max={Math.max(1, maxSelectionSize)}
          step={1}
          disabled={selectionDisabled}
          label="サイズ"
          valueLabel={`${selection.size}`}
          color={color}
          aria-label="選択サイズ"
          height={140}
        />

        <Divider orientation="vertical" flexItem sx={{ borderColor: "#333" }} />

        <RecordButton
          isRecording={isRecording}
          onToggle={handleRecordToggle}
          disabled={disabled}
          statusText={recordStatusText}
        />

        <Divider orientation="vertical" flexItem sx={{ borderColor: "#333" }} />

        <SpeakerGrille size={56} />

        <Divider orientation="vertical" flexItem sx={{ borderColor: "#333" }} />

        <KeyboardCluster disabled={pianoDisabled} />

        <Divider orientation="vertical" flexItem sx={{ borderColor: "#333" }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
            minWidth: 56,
            opacity: 0.4,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Loop
          </Typography>
          <Switch
            checked={loopEnabled}
            onChange={(_, checked) => setLoopEnabled(checked)}
            disabled
            aria-label="ループ（M3で実装）"
            sx={{
              "& .MuiSwitch-switchBase.Mui-disabled": {
                color: "#666",
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
