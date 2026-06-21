import { Box, Typography } from "@mui/material";
import { useCallback, useEffect, useRef } from "react";

import { useActiveNotes, useNoteOff, useNoteOn } from "../../../stores/synth-store.ts";

const WHITE_KEYS = [
  { midiNote: 60, label: "C", pcKey: "a" },
  { midiNote: 62, label: "D", pcKey: "s" },
  { midiNote: 64, label: "E", pcKey: "d" },
  { midiNote: 65, label: "F", pcKey: "f" },
  { midiNote: 67, label: "G", pcKey: "g" },
  { midiNote: 69, label: "A", pcKey: "h" },
  { midiNote: 71, label: "B", pcKey: "j" },
  { midiNote: 72, label: "C", pcKey: "k" },
] as const;

const BLACK_KEYS = [
  { midiNote: 61, label: "C#", pcKey: "w", offset: 0.7 },
  { midiNote: 63, label: "D#", pcKey: "e", offset: 1.7 },
  { midiNote: 66, label: "F#", pcKey: "t", offset: 3.7 },
  { midiNote: 68, label: "G#", pcKey: "y", offset: 4.7 },
  { midiNote: 70, label: "A#", pcKey: "u", offset: 5.7 },
] as const;

const PC_KEY_TO_MIDI: Record<string, number> = {};
for (const key of WHITE_KEYS) {
  PC_KEY_TO_MIDI[key.pcKey] = key.midiNote;
}
for (const key of BLACK_KEYS) {
  PC_KEY_TO_MIDI[key.pcKey] = key.midiNote;
}

const WHITE_KEY_WIDTH = 48;
const KEY_HEIGHT = 140;
const BLACK_KEY_WIDTH = 30;
const BLACK_KEY_HEIGHT = 90;

interface PianoKeyboardProps {
  disabled?: boolean;
}

export function PianoKeyboard({ disabled = false }: PianoKeyboardProps) {
  const noteOn = useNoteOn();
  const noteOff = useNoteOff();
  const activeNotes = useActiveNotes();
  const pressedPcKeysRef = useRef<Set<string>>(new Set());

  const handleNoteOn = useCallback(
    (midiNote: number) => {
      if (disabled) {
        return;
      }
      noteOn(midiNote);
    },
    [disabled, noteOn],
  );

  const handleNoteOff = useCallback(
    (midiNote: number) => {
      if (disabled) {
        return;
      }
      noteOff(midiNote);
    },
    [disabled, noteOff],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || disabled) {
        return;
      }

      const key = event.key.toLowerCase();
      const midiNote = PC_KEY_TO_MIDI[key];
      if (midiNote === undefined || pressedPcKeysRef.current.has(key)) {
        return;
      }

      event.preventDefault();
      pressedPcKeysRef.current.add(key);
      handleNoteOn(midiNote);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const midiNote = PC_KEY_TO_MIDI[key];
      if (midiNote === undefined) {
        return;
      }

      event.preventDefault();
      pressedPcKeysRef.current.delete(key);
      handleNoteOff(midiNote);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [disabled, handleNoteOn, handleNoteOff]);

  const isActive = (midiNote: number) => activeNotes.includes(midiNote);

  return (
    <Box sx={{ width: "100%", maxWidth: WHITE_KEYS.length * WHITE_KEY_WIDTH }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        鍵盤: A S D F G H J K（白鍵）/ W E T Y U（黒鍵）
      </Typography>

      <Box
        sx={{
          position: "relative",
          height: KEY_HEIGHT,
          userSelect: "none",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Box sx={{ display: "flex" }}>
          {WHITE_KEYS.map((key) => (
            <Box
              key={key.midiNote}
              component="button"
              type="button"
              aria-label={`${key.label} (${key.pcKey.toUpperCase()})`}
              onMouseDown={() => handleNoteOn(key.midiNote)}
              onMouseUp={() => handleNoteOff(key.midiNote)}
              onMouseLeave={() => {
                if (isActive(key.midiNote)) {
                  handleNoteOff(key.midiNote);
                }
              }}
              onTouchStart={(event) => {
                event.preventDefault();
                handleNoteOn(key.midiNote);
              }}
              onTouchEnd={(event) => {
                event.preventDefault();
                handleNoteOff(key.midiNote);
              }}
              sx={{
                width: WHITE_KEY_WIDTH,
                height: KEY_HEIGHT,
                border: "1px solid #333",
                borderRadius: "0 0 4px 4px",
                bgcolor: isActive(key.midiNote) ? "#f3063e" : "#f5f5f5",
                color: isActive(key.midiNote) ? "#fff" : "#000",
                cursor: disabled ? "not-allowed" : "pointer",
                p: 0,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                pb: 1,
                fontSize: "0.7rem",
              }}
            >
              {key.pcKey.toUpperCase()}
            </Box>
          ))}
        </Box>

        {BLACK_KEYS.map((key) => (
          <Box
            key={key.midiNote}
            component="button"
            type="button"
            aria-label={`${key.label} (${key.pcKey.toUpperCase()})`}
            onMouseDown={() => handleNoteOn(key.midiNote)}
            onMouseUp={() => handleNoteOff(key.midiNote)}
            onMouseLeave={() => {
              if (isActive(key.midiNote)) {
                handleNoteOff(key.midiNote);
              }
            }}
            onTouchStart={(event) => {
              event.preventDefault();
              handleNoteOn(key.midiNote);
            }}
            onTouchEnd={(event) => {
              event.preventDefault();
              handleNoteOff(key.midiNote);
            }}
            sx={{
              position: "absolute",
              left: key.offset * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2,
              top: 0,
              width: BLACK_KEY_WIDTH,
              height: BLACK_KEY_HEIGHT,
              border: "1px solid #111",
              borderRadius: "0 0 4px 4px",
              bgcolor: isActive(key.midiNote) ? "#c00430" : "#222",
              color: "#fff",
              cursor: disabled ? "not-allowed" : "pointer",
              p: 0,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              pb: 0.5,
              fontSize: "0.6rem",
              zIndex: 1,
            }}
          >
            {key.pcKey.toUpperCase()}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
