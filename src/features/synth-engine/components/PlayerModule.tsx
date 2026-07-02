import BlurOnIcon from "@mui/icons-material/BlurOn";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import GrainIcon from "@mui/icons-material/Grain";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Box, Switch, Typography } from "@mui/material";
import type { ReactNode } from "react";

import {
  type OriginalLayoutZone,
  PLAYER_MODULE_GRID_COLUMNS,
  PLAYER_MODULE_GRID_ROWS,
  playerModuleTemplate,
} from "../original-layout.ts";
import { HorizontalSlider } from "./HorizontalSlider.tsx";
import { OctaveButton } from "./OctaveButton.tsx";
import { PianoKeyboard } from "./PianoKeyboard.tsx";
import { RecordButton } from "./RecordButton.tsx";
import { SelectionRail } from "./SelectionRail.tsx";

export interface PlayerModuleProps {
  zone: OriginalLayoutZone;
  displayColor: "red" | "yellow";
  color: string;
  interactive: boolean;
  displayContent: ReactNode;
  pianoDisabled: boolean;
  selectionDisabled: boolean;
  grainDurationCoeff: number;
  onDurationChange: (value: number) => void;
  durationMin: number;
  durationMax: number;
  loopEnabled: boolean;
  onLoopChange: (enabled: boolean) => void;
  isRecording: boolean;
  onRecordToggle: () => void;
  recordDisabled: boolean;
  recordStatusText: string;
}

function slotSx(gridArea: string) {
  return {
    gridArea,
    minWidth: 0,
    minHeight: 0,
    border: "1px solid #333",
    borderRadius: 1,
    bgcolor: "rgba(255,255,255,0.03)",
    p: 0.75,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  } as const;
}

const iconSx = { fontSize: 18, color: "text.secondary" } as const;

export function PlayerModule({
  zone,
  displayColor,
  color,
  interactive,
  displayContent,
  pianoDisabled,
  selectionDisabled,
  grainDurationCoeff,
  onDurationChange,
  durationMin,
  durationMax,
  loopEnabled,
  onLoopChange,
  isRecording,
  onRecordToggle,
  recordDisabled,
  recordStatusText,
}: PlayerModuleProps) {
  const template = playerModuleTemplate(zone, displayColor);
  const s = (area: string) => `${area}-${zone}`;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: PLAYER_MODULE_GRID_COLUMNS,
        gridTemplateRows: PLAYER_MODULE_GRID_ROWS,
        gridTemplateAreas: template,
        gap: 1,
        width: "100%",
        height: "100%",
        p: 1,
        border: "2px solid #333",
        borderRadius: 1,
        bgcolor: "#101010",
        boxSizing: "border-box",
      }}
    >
      {/* ---- Display ---- */}
      <Box
        sx={{
          ...slotSx(`display-${displayColor}`),
          p: 0,
          overflow: "hidden",
        }}
      >
        {displayContent}
      </Box>

      {/* ---- Record / Mic ---- */}
      <Box sx={{ ...slotSx(s("record-button")), opacity: interactive ? 1 : 0.4 }}>
        <RecordButton
          isRecording={isRecording}
          onToggle={onRecordToggle}
          disabled={recordDisabled}
          statusText={recordStatusText}
        />
      </Box>

      <Box
        sx={{
          ...slotSx(s("mic")),
          flexDirection: "column",
          gap: 0.5,
          opacity: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Mic
        </Typography>
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "2px solid #aaa",
          }}
        />
      </Box>

      {/* ---- Wavejet ---- */}
      <Box
        sx={{
          ...slotSx(s("wavejet")),
          p: 0.5,
          alignItems: "stretch",
          opacity: interactive ? 1 : 0.4,
        }}
      >
        <SelectionRail disabled={interactive ? selectionDisabled : true} />
      </Box>

      {/* ---- Controls ---- */}
      <Box
        sx={{
          ...slotSx(s("toggle-switch")),
          opacity: interactive ? 1 : 0.4,
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Loop
        </Typography>
        <Switch
          checked={loopEnabled}
          onChange={(_, checked) => onLoopChange(checked)}
          disabled
          aria-label={`ループ（Player ${zone.toUpperCase()}・M3で実装）`}
          sx={{ transform: "rotate(90deg)" }}
        />
      </Box>

      <Box
        sx={{
          ...slotSx(s("keyboards")),
          minHeight: "auto",
          alignItems: "stretch",
          justifyContent: "flex-start",
        }}
      >
        <PianoKeyboard disabled={interactive ? pianoDisabled : true} />
      </Box>

      <Box sx={{ ...slotSx(s("minus-button")), opacity: interactive ? 1 : 0.4 }}>
        <OctaveButton direction="down" disabled={interactive ? pianoDisabled : true} />
      </Box>

      <Box sx={{ ...slotSx(s("plus-button")), opacity: interactive ? 1 : 0.4 }}>
        <OctaveButton direction="up" disabled={interactive ? pianoDisabled : true} />
      </Box>

      <Box sx={{ ...slotSx(s("slider-moon-sun")), opacity: interactive ? 1 : 0.4 }}>
        <HorizontalSlider
          value={50}
          onChange={() => {}}
          min={0}
          max={100}
          disabled={!interactive}
          label="Filter"
          startIcon={<DarkModeIcon sx={iconSx} />}
          endIcon={<LightModeIcon sx={iconSx} />}
          aria-label={`フィルター Player ${zone.toUpperCase()}（M3で実装）`}
        />
      </Box>

      <Box sx={{ ...slotSx(s("slider-small-big")), opacity: interactive ? 1 : 0.4 }}>
        <HorizontalSlider
          value={grainDurationCoeff}
          onChange={onDurationChange}
          min={durationMin}
          max={durationMax}
          step={0.1}
          disabled={!interactive}
          label="Duration"
          valueLabel={grainDurationCoeff.toFixed(1)}
          color={color}
          startIcon={<GrainIcon sx={iconSx} />}
          endIcon={<BlurOnIcon sx={iconSx} />}
          aria-label={`グレイン持続係数 Player ${zone.toUpperCase()}`}
        />
      </Box>
    </Box>
  );
}
