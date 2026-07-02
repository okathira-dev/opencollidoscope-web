import { Box } from "@mui/material";

import {
  useCanShiftKeyboardOctaveDown,
  useCanShiftKeyboardOctaveUp,
  useShiftKeyboardOctave,
} from "../../../stores/synth-store.ts";

interface OctaveButtonProps {
  direction: "up" | "down";
  disabled?: boolean;
}

export function OctaveButton({ direction, disabled = false }: OctaveButtonProps) {
  const shiftKeyboardOctave = useShiftKeyboardOctave();
  const canShiftUp = useCanShiftKeyboardOctaveUp();
  const canShiftDown = useCanShiftKeyboardOctaveDown();

  const isUp = direction === "up";
  const canShift = isUp ? canShiftUp : canShiftDown;
  const label = isUp ? "+" : "-";
  const ariaLabel = isUp ? "オクターブ上" : "オクターブ下";

  return (
    <Box
      component="button"
      type="button"
      aria-label={ariaLabel}
      disabled={disabled || !canShift}
      onClick={() => shiftKeyboardOctave(isUp ? 1 : -1)}
      sx={{
        width: 36,
        height: 36,
        border: "1px solid #333",
        borderRadius: 1,
        bgcolor: "#e8e8e8",
        color: "#111",
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: 1,
        cursor: disabled || !canShift ? "not-allowed" : "pointer",
        opacity: disabled || !canShift ? 0.4 : 1,
        p: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {label}
    </Box>
  );
}
