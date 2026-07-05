import { Box, Typography } from "@mui/material";
import { memo, type ReactNode } from "react";
import { MIDI_CC_MAX } from "../../../consts/midi.ts";

import {
  NEW_PLAYER_MODULE_GRID_COLUMNS,
  NEW_PLAYER_MODULE_GRID_ROWS,
  type NewLayoutZone,
  playerModuleTemplate,
} from "../new-layout.ts";
import { LoopPushButton } from "./LoopPushButton.tsx";
import { OctaveButton } from "./OctaveButton.tsx";
import { PianoKeyboard } from "./PianoKeyboard.tsx";
import { RecordButton } from "./RecordButton.tsx";
import { SelectionRail } from "./SelectionRail.tsx";
import { VerticalMobileKnob } from "./VerticalMobileKnob.tsx";

export interface NewPlayerModuleProps {
  zone: NewLayoutZone;
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
  filterValue: number;
  onFilterChange: (value: number) => void;
  filterDisabled?: boolean;
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

function NewPlayerModuleComponent({
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
  filterValue,
  onFilterChange,
  filterDisabled = false,
  loopEnabled,
  onLoopChange,
  isRecording,
  onRecordToggle,
  recordDisabled,
  recordStatusText,
}: NewPlayerModuleProps) {
  const template = playerModuleTemplate(zone, displayColor);
  const s = (area: string) => `${area}-${zone}`;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: NEW_PLAYER_MODULE_GRID_COLUMNS,
        gridTemplateRows: NEW_PLAYER_MODULE_GRID_ROWS,
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
      <Box
        sx={{
          ...slotSx(`display-${displayColor}`),
          p: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {displayContent}
      </Box>

      <Box
        sx={{
          ...slotSx(s("record-button")),
          opacity: interactive ? 1 : 0.4,
          minHeight: 108,
          alignItems: "center",
        }}
      >
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

      <Box sx={{ ...slotSx(s("loop-button")), opacity: interactive ? 1 : 0.4 }}>
        <LoopPushButton enabled={loopEnabled} onToggle={onLoopChange} disabled={!interactive} />
      </Box>

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

      <Box
        sx={{
          ...slotSx(s("vertical-mobile-knob")),
          alignItems: "stretch",
          justifyContent: "stretch",
          opacity: interactive ? 1 : 0.4,
        }}
      >
        <VerticalMobileKnob
          filterValue={filterValue}
          onFilterChange={onFilterChange}
          filterMin={0}
          filterMax={MIDI_CC_MAX}
          durationValue={grainDurationCoeff}
          onDurationChange={onDurationChange}
          durationMin={durationMin}
          durationMax={durationMax}
          disabled={!interactive}
          filterDisabled={filterDisabled}
          durationDisabled={!interactive}
          color={color}
          zoneLabel={zone.toUpperCase()}
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
        <PianoKeyboard disabled={interactive ? pianoDisabled : true} octaveCount={3} />
      </Box>

      <Box sx={{ ...slotSx(s("minus-button")), opacity: interactive ? 1 : 0.4 }}>
        <OctaveButton direction="down" disabled={interactive ? pianoDisabled : true} />
      </Box>

      <Box sx={{ ...slotSx(s("plus-button")), opacity: interactive ? 1 : 0.4 }}>
        <OctaveButton direction="up" disabled={interactive ? pianoDisabled : true} />
      </Box>
    </Box>
  );
}

export const NewPlayerModule = memo(NewPlayerModuleComponent);
