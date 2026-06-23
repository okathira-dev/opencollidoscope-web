import { Box, Slider, Typography } from "@mui/material";
import type { ReactNode } from "react";

export interface VerticalSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  label?: ReactNode;
  valueLabel?: string;
  color?: string;
  height?: number;
  "aria-label": string;
}

export function VerticalSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  label,
  valueLabel,
  color = "#ffffff",
  height = 140,
  "aria-label": ariaLabel,
}: VerticalSliderProps) {
  const handleChange = (_: Event, newValue: number | number[]) => {
    const next = Array.isArray(newValue) ? (newValue[0] ?? value) : newValue;
    onChange(next);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        minWidth: 48,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {label !== undefined && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "center", lineHeight: 1.2, maxWidth: 56 }}
        >
          {label}
        </Typography>
      )}
      <Slider
        orientation="vertical"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={handleChange}
        aria-label={ariaLabel}
        sx={{
          height,
          color,
          "& .MuiSlider-thumb": {
            width: 16,
            height: 16,
          },
          "& .MuiSlider-rail": {
            opacity: 0.3,
          },
        }}
      />
      {valueLabel !== undefined && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
          {valueLabel}
        </Typography>
      )}
    </Box>
  );
}
