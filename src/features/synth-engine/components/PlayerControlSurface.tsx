import { Box, Typography } from "@mui/material";
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
import { useWaveSelection } from "../../../stores/wave-store.ts";
import { PLAYER_A_COLOR, PLAYER_B_COLOR } from "../original-layout.ts";
import { NewPlayerModule } from "./NewPlayerModule.tsx";
import { PlayerModule } from "./PlayerModule.tsx";
import { WaveDisplay } from "./WaveDisplay.tsx";
import { WaveDisplayPlaceholder } from "./WaveDisplayPlaceholder.tsx";

export type PlayerBOrientation = "facing" | "stacked";
export type HardwareVariant = "original" | "new";

export interface PlayerControlSurfaceProps {
  disabled?: boolean;
  hasRecordedBuffer?: boolean;
  isSynthInitialized?: boolean;
  color?: string;
  playerBOrientation?: PlayerBOrientation;
  variant?: HardwareVariant;
}

export function PlayerControlSurface({
  disabled = false,
  hasRecordedBuffer = false,
  isSynthInitialized = false,
  color = PLAYER_A_COLOR,
  playerBOrientation = "facing",
  variant = "original",
}: PlayerControlSurfaceProps) {
  const config = useConfig();
  const audioConfig = useConfigAudio();
  const isRecording = useIsRecording();
  const startRecording = useStartRecording();
  const stopRecording = useStopRecording();
  const selection = useWaveSelection();
  const grainDurationCoeff = useGrainDurationCoeff();
  const setGrainDurationCoeff = useSetGrainDurationCoeff();
  const loopEnabled = useLoopEnabled();
  const setLoopEnabled = useSetLoopEnabled();

  const selectionDisabled = disabled || selection.isNull;
  const pianoDisabled = !hasRecordedBuffer || !isSynthInitialized;
  const ModuleComponent = variant === "new" ? NewPlayerModule : PlayerModule;

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

  const recordStatusText = isRecording
    ? `録音中 (${audioConfig.waveLength.toFixed(1)}秒)`
    : hasRecordedBuffer
      ? "録音済み"
      : "録音";

  const playerBModule = (
    <ModuleComponent
      zone="b"
      displayColor="yellow"
      color={PLAYER_B_COLOR}
      interactive={false}
      displayContent={<WaveDisplayPlaceholder accentColor={PLAYER_B_COLOR} />}
      pianoDisabled
      selectionDisabled
      grainDurationCoeff={grainDurationCoeff}
      onDurationChange={() => {}}
      durationMin={config.granular.grainDurationRange.min}
      durationMax={config.granular.grainDurationRange.max}
      loopEnabled={false}
      onLoopChange={() => {}}
      isRecording={false}
      onRecordToggle={() => {}}
      recordDisabled
      recordStatusText="録音"
    />
  );

  return (
    <Box
      sx={{
        width: "100%",
        mt: 2,
        pt: 2,
        borderTop: "1px solid #333",
      }}
    >
      <Box
        sx={{
          overflowX: "auto",
          pb: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minWidth: 960,
          maxWidth: 1280,
          minHeight: "clamp(700px, 85vh, 960px)",
        }}
      >
        <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
          <Box
            sx={{
              height: "100%",
              ...(playerBOrientation === "facing" ? { transform: "rotate(180deg)" } : undefined),
            }}
          >
            {playerBModule}
          </Box>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0, 0, 0, 0.5)",
              borderRadius: 1,
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", px: 2, lineHeight: 1.5 }}
            >
              Player B（Wave 1）
              <br />
              配置のみ — 機能配線は M3 以降
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ModuleComponent
            zone="a"
            displayColor="red"
            color={color}
            interactive={!disabled}
            displayContent={<WaveDisplay color={color} height="100%" minHeight={0} />}
            pianoDisabled={pianoDisabled}
            selectionDisabled={selectionDisabled}
            grainDurationCoeff={grainDurationCoeff}
            onDurationChange={handleDurationChange}
            durationMin={config.granular.grainDurationRange.min}
            durationMax={config.granular.grainDurationRange.max}
            loopEnabled={loopEnabled}
            onLoopChange={setLoopEnabled}
            isRecording={isRecording}
            onRecordToggle={handleRecordToggle}
            recordDisabled={disabled}
            recordStatusText={recordStatusText}
          />
        </Box>
      </Box>
    </Box>
  );
}
