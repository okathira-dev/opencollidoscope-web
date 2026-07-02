import { Box, Slider, Typography } from "@mui/material";
import { useCallback, useRef } from "react";

import { useConfig } from "../../../stores/config-store.ts";
import { useSetWaveSelection, useWaveSelection } from "../../../stores/wave-store.ts";
import { useSelectionWheel } from "../hooks/useSelectionWheel.ts";

export interface SelectionRailProps {
  disabled?: boolean;
}

export function SelectionRail({ disabled = false }: SelectionRailProps) {
  const config = useConfig();
  const selection = useWaveSelection();
  const setSelection = useSetWaveSelection();
  const railRef = useRef<HTMLDivElement>(null);

  const isEnabled = !disabled && !selection.isNull;
  useSelectionWheel(railRef, selection, setSelection, isEnabled);

  const maxSelectionStart = Math.max(0, config.audio.chunkCount - 1);

  const handleStartChange = useCallback(
    (_: Event, value: number | number[]) => {
      const start = Array.isArray(value) ? (value[0] ?? selection.start) : value;
      setSelection(Math.round(start), selection.size);
    },
    [selection.start, selection.size, setSelection],
  );

  return (
    <Box sx={{ px: 1, width: "100%" }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Wavejet: 開始 {selection.start} / サイズ {selection.size} チャンク
      </Typography>
      <Box ref={railRef}>
        <Slider
          value={selection.start}
          min={0}
          max={maxSelectionStart}
          step={1}
          disabled={!isEnabled}
          onChange={handleStartChange}
          aria-label="選択開始位置"
          sx={{
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
              height: 6,
              borderRadius: 3,
              bgcolor: "#333",
              opacity: 1,
            },
            "& .MuiSlider-track": {
              height: 6,
              borderRadius: 3,
              bgcolor: "#555",
            },
          }}
        />
      </Box>
    </Box>
  );
}
