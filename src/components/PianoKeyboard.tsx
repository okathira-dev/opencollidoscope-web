import { Box, Button } from "@mui/material";
import { useEffect } from "react";

interface Props {
  onNote: (midi: number) => void;
}

// Map computer keyboard keys to MIDI note numbers (two octaves starting at C4)
const KEY_TO_MIDI: Record<string, number> = {
  z: 60,
  s: 61,
  x: 62,
  d: 63,
  c: 64,
  v: 65,
  g: 66,
  b: 67,
  h: 68,
  n: 69,
  j: 70,
  m: 71,
  ",": 72,
  l: 73,
  ".": 74,
  ";": 75,
  "/": 76,
};

const WHITE_KEYS = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76];

export function PianoKeyboard({ onNote }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const midi = KEY_TO_MIDI[e.key];
      if (midi !== undefined) {
        onNote(midi);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNote]);

  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      {Object.entries(KEY_TO_MIDI).map(([key, midi]) => (
        <Button
          key={midi}
          variant={WHITE_KEYS.includes(midi) ? "outlined" : "contained"}
          sx={{ minWidth: 32, padding: 0.5, textTransform: "none" }}
          onMouseDown={() => onNote(midi)}
        >
          {key.toUpperCase()}
        </Button>
      ))}
    </Box>
  );
}
