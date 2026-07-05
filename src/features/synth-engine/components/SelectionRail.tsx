import { Box, Slider, Typography } from "@mui/material";
import { memo, useCallback, useRef } from "react";

import { useConfigChunkCount } from "../../../stores/config-store.ts";
import {
  isWaveSelectionEmpty,
  useSetWaveSelection,
  useWaveSelection,
} from "../../../stores/wave-store.ts";
import { unwrapSliderValue } from "../../../utils/slider.ts";
import { useSelectionWheel } from "../hooks/useSelectionWheel.ts";

export interface SelectionRailProps {
  disabled?: boolean;
}

function SelectionRailComponent({ disabled = false }: SelectionRailProps) {
  const chunkCount = useConfigChunkCount();
  const selection = useWaveSelection();
  const setSelection = useSetWaveSelection();
  const railRef = useRef<HTMLDivElement>(null);

  const isEnabled = !disabled && !isWaveSelectionEmpty(selection);
  useSelectionWheel(railRef, setSelection, isEnabled);

  const maxSelectionStart = Math.max(0, chunkCount - 1);
  const selectionStart = selection.kind === "active" ? selection.start : 0;
  const selectionSize = selection.kind === "active" ? selection.size : 1;

  const handleStartChange = useCallback(
    (_: Event, value: number | number[]) => {
      const start = unwrapSliderValue(value, selectionStart);
      setSelection(Math.round(start), selectionSize);
    },
    [selectionStart, selectionSize, setSelection],
  );

  return (
    <Box sx={{ px: 1, width: "100%" }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Wavejet: 開始 {selectionStart} / サイズ {selectionSize} チャンク
      </Typography>
      <Box ref={railRef}>
        <Slider
          value={selectionStart}
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

export const SelectionRail = memo(SelectionRailComponent);
