import { Box, Slider, Typography } from "@mui/material";
import type { ReactNode } from "react";

export interface HorizontalSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  label?: ReactNode;
  valueLabel?: string;
  color?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  "aria-label": string;
}

export function HorizontalSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  label,
  valueLabel,
  color = "#ffffff",
  startIcon,
  endIcon,
  "aria-label": ariaLabel,
}: HorizontalSliderProps) {
  const handleChange = (_: Event, newValue: number | number[]) => {
    const next = Array.isArray(newValue) ? (newValue[0] ?? value) : newValue;
    onChange(next);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 0.5,
        width: "100%",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {label !== undefined && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "center", lineHeight: 1.2 }}
        >
          {label}
        </Typography>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 0.5 }}>
        {startIcon}
        <Slider
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={handleChange}
          aria-label={ariaLabel}
          sx={{
            flex: 1,
            color,
            "& .MuiSlider-thumb": { width: 14, height: 14 },
            "& .MuiSlider-rail": { opacity: 0.3 },
          }}
        />
        {endIcon}
      </Box>
      {valueLabel !== undefined && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "center", fontSize: "0.65rem" }}
        >
          {valueLabel}
        </Typography>
      )}
    </Box>
  );
}
