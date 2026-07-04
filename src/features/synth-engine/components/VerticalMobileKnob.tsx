import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Box, Slider, Typography } from "@mui/material";
import { useCallback, useRef } from "react";

import { useKnobWheel } from "../hooks/useKnobWheel.ts";

const RAIL_SX = {
  color: "#888",
  "& .MuiSlider-thumb": {
    width: 20,
    height: 20,
    borderRadius: "50%",
    bgcolor: "#c0c0c0",
    border: "2px solid #666",
    boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  "& .MuiSlider-rail": {
    width: 6,
    borderRadius: 3,
    bgcolor: "#333",
    opacity: 1,
  },
  "& .MuiSlider-track": {
    width: 6,
    borderRadius: 3,
    bgcolor: "#555",
  },
} as const;

export interface VerticalMobileKnobProps {
  filterValue: number;
  onFilterChange: (value: number) => void;
  filterMin: number;
  filterMax: number;
  durationValue: number;
  onDurationChange: (value: number) => void;
  durationMin: number;
  durationMax: number;
  durationStep?: number;
  disabled?: boolean;
  filterDisabled?: boolean;
  durationDisabled?: boolean;
  color?: string;
  zoneLabel: string;
}

export function VerticalMobileKnob({
  filterValue,
  onFilterChange,
  filterMin,
  filterMax,
  durationValue,
  onDurationChange,
  durationMin,
  durationMax,
  durationStep = 0.1,
  disabled = false,
  filterDisabled = false,
  durationDisabled = false,
  color = "#888",
  zoneLabel,
}: VerticalMobileKnobProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const filterReadOnly = disabled || filterDisabled;
  const durationReadOnly = disabled || durationDisabled;
  const wheelEnabled = !durationReadOnly;

  useKnobWheel(
    railRef,
    durationValue,
    onDurationChange,
    durationMin,
    durationMax,
    durationStep,
    wheelEnabled,
  );

  const handleFilterChange = useCallback(
    (_: Event, value: number | number[]) => {
      const next = Array.isArray(value) ? (value[0] ?? filterValue) : value;
      onFilterChange(next);
    },
    [filterValue, onFilterChange],
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        width: "100%",
        height: "100%",
        px: 0.5,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: "center", lineHeight: 1.2 }}
      >
        Knob
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
        Duration {durationValue.toFixed(1)}
      </Typography>

      <LightModeIcon sx={{ fontSize: 14, color: "text.secondary" }} aria-hidden />

      <Box
        ref={railRef}
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 80,
          py: 0.5,
        }}
      >
        <Slider
          orientation="vertical"
          value={filterValue}
          min={filterMin}
          max={filterMax}
          disabled={filterReadOnly}
          onChange={handleFilterChange}
          aria-label={`フィルター Player ${zoneLabel}`}
          sx={{
            ...RAIL_SX,
            height: "100%",
            maxHeight: 140,
            color,
          }}
        />
      </Box>

      <DarkModeIcon sx={{ fontSize: 14, color: "text.secondary" }} aria-hidden />

      <Box sx={{ textAlign: "center", lineHeight: 1.2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", fontSize: "0.6rem" }}
        >
          上下=Filter
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", fontSize: "0.6rem" }}
        >
          ホイール=Duration
        </Typography>
      </Box>
    </Box>
  );
}
