import { Box, Typography } from "@mui/material";
import { memo, useCallback } from "react";

import {
  useIsRecording,
  useStartRecording,
  useStopRecording,
} from "../../../stores/audio-store.ts";
import { useConfigAudio, useConfigGranularDurationRange } from "../../../stores/config-store.ts";
import {
  useFilterCutoff,
  useGrainDurationCoeff,
  useLoopEnabled,
  useSetFilterCutoff,
  useSetGrainDurationCoeff,
  useSetLoopEnabled,
} from "../../../stores/synth-store.ts";
import type { HardwareVariant, PlayerLayout } from "../../../stores/ui-store.ts";
import { useWaveSelectionIsNull } from "../../../stores/wave-store.ts";
import { PLAYER_A_COLOR, PLAYER_B_COLOR } from "../original-layout.ts";
import { NewPlayerModule } from "./NewPlayerModule.tsx";
import { PlayerModule } from "./PlayerModule.tsx";
import { WaveDisplay } from "./WaveDisplay.tsx";
import { WaveDisplayPlaceholder } from "./WaveDisplayPlaceholder.tsx";

export interface PlayerControlSurfaceProps {
  disabled?: boolean;
  hasRecordedBuffer?: boolean;
  isSynthInitialized?: boolean;
  color?: string;
  playerLayout?: PlayerLayout;
  variant?: HardwareVariant;
}

function shouldRotatePlayerB(playerLayout: PlayerLayout): boolean {
  return playerLayout === "facing" || playerLayout === "solo";
}

function PlayerControlSurfaceComponent({
  disabled = false,
  hasRecordedBuffer = false,
  isSynthInitialized = false,
  color = PLAYER_A_COLOR,
  playerLayout = "facing",
  variant = "original",
}: PlayerControlSurfaceProps) {
  const durationRange = useConfigGranularDurationRange();
  const audioConfig = useConfigAudio();
  const isRecording = useIsRecording();
  const startRecording = useStartRecording();
  const stopRecording = useStopRecording();
  const selectionIsNull = useWaveSelectionIsNull();
  const grainDurationCoeff = useGrainDurationCoeff();
  const setGrainDurationCoeff = useSetGrainDurationCoeff();
  const filterCutoff = useFilterCutoff();
  const setFilterCutoff = useSetFilterCutoff();
  const loopEnabled = useLoopEnabled();
  const setLoopEnabled = useSetLoopEnabled();

  const selectionDisabled = disabled || selectionIsNull;
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
      durationMin={durationRange.min}
      durationMax={durationRange.max}
      filterValue={0}
      onFilterChange={() => {}}
      filterDisabled
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
        {playerLayout !== "solo" && (
          <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
            <Box
              sx={{
                height: "100%",
                ...(shouldRotatePlayerB(playerLayout)
                  ? { transform: "rotate(180deg)" }
                  : undefined),
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
                配置のみ — 機能配線は Phase 2 以降
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ModuleComponent
            zone="a"
            displayColor="red"
            color={color}
            interactive={!disabled}
            displayContent={
              <WaveDisplay color={color} filterCutoff={filterCutoff} height="100%" minHeight={0} />
            }
            pianoDisabled={pianoDisabled}
            selectionDisabled={selectionDisabled}
            grainDurationCoeff={grainDurationCoeff}
            onDurationChange={handleDurationChange}
            durationMin={durationRange.min}
            durationMax={durationRange.max}
            filterValue={filterCutoff}
            onFilterChange={setFilterCutoff}
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

export const PlayerControlSurface = memo(PlayerControlSurfaceComponent);
