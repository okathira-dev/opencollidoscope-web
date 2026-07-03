import { Box, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  useActiveNotes,
  useKeyboardOctaveOffset,
  useNoteOff,
  useNoteOn,
} from "../../../stores/synth-store.ts";
import { buildKeyboardLayout, keyboardTopMidi, relativeToMidiNote } from "../keyboard-layout.ts";

const KEY_HEIGHT = 140;
const BLACK_KEY_WIDTH = 18;
const BLACK_KEY_HEIGHT = 90;

function keyboardRangeLabel(octaveCount: number): string {
  const { whiteKeys, blackKeys } = buildKeyboardLayout(octaveCount);
  const topNote = keyboardTopMidi(octaveCount);
  const topOctave = Math.floor(topNote / 12) - 1;
  return `C3-C${topOctave}（${whiteKeys.length + blackKeys.length} 鍵・中央 C4 = 原音）`;
}

interface PianoKeyboardProps {
  disabled?: boolean;
  octaveCount?: number;
}

export function PianoKeyboard({ disabled = false, octaveCount = 2 }: PianoKeyboardProps) {
  const noteOn = useNoteOn();
  const noteOff = useNoteOff();
  const activeNotes = useActiveNotes();
  const octaveOffset = useKeyboardOctaveOffset();
  const pressedPcKeysRef = useRef<Set<string>>(new Set());

  const { whiteKeys, blackKeys } = useMemo(() => buildKeyboardLayout(octaveCount), [octaveCount]);

  const whiteKeyCount = whiteKeys.length;
  const whiteKeyWidthPercent = 100 / whiteKeyCount;
  const blackKeyWidthPercent = whiteKeyWidthPercent * (BLACK_KEY_WIDTH / 28);
  const blackKeyHeightRatio = BLACK_KEY_HEIGHT / KEY_HEIGHT;

  const pcKeyToRelative = useMemo(() => {
    const map: Record<string, number> = {};
    for (const key of whiteKeys) {
      if (key.pcKey) {
        map[key.pcKey] = key.relativeSemitone;
      }
    }
    for (const key of blackKeys) {
      if (key.pcKey) {
        map[key.pcKey] = key.relativeSemitone;
      }
    }
    return map;
  }, [whiteKeys, blackKeys]);

  const blackKeyLeftPercent = useCallback(
    (whiteOffset: number) => {
      const centerPercent = (whiteOffset / whiteKeyCount) * 100;
      return `calc(${centerPercent}% - ${blackKeyWidthPercent / 2}%)`;
    },
    [whiteKeyCount, blackKeyWidthPercent],
  );

  const resolveMidiNote = useCallback(
    (relativeSemitone: number) => relativeToMidiNote(relativeSemitone, octaveOffset),
    [octaveOffset],
  );

  const handleNoteOn = useCallback(
    (relativeSemitone: number) => {
      if (disabled) {
        return;
      }
      noteOn(resolveMidiNote(relativeSemitone));
    },
    [disabled, noteOn, resolveMidiNote],
  );

  const handleNoteOff = useCallback(
    (relativeSemitone: number) => {
      if (disabled) {
        return;
      }
      noteOff(resolveMidiNote(relativeSemitone));
    },
    [disabled, noteOff, resolveMidiNote],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || disabled) {
        return;
      }

      const key = event.key.toLowerCase();
      const relativeSemitone = pcKeyToRelative[key];
      if (relativeSemitone === undefined || pressedPcKeysRef.current.has(key)) {
        return;
      }

      event.preventDefault();
      pressedPcKeysRef.current.add(key);
      handleNoteOn(relativeSemitone);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const relativeSemitone = pcKeyToRelative[key];
      if (relativeSemitone === undefined) {
        return;
      }

      event.preventDefault();
      pressedPcKeysRef.current.delete(key);
      handleNoteOff(relativeSemitone);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [disabled, handleNoteOn, handleNoteOff, pcKeyToRelative]);

  const isActive = useCallback(
    (relativeSemitone: number) => activeNotes.includes(resolveMidiNote(relativeSemitone)),
    [activeNotes, resolveMidiNote],
  );

  const blackKeySx = useMemo(
    () => ({
      position: "absolute" as const,
      top: 0,
      width: `${blackKeyWidthPercent}%`,
      height: `${blackKeyHeightRatio * 100}%`,
      border: "1px solid #111",
      borderRadius: "0 0 4px 4px",
      cursor: disabled ? "not-allowed" : "pointer",
      p: 0,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      pb: 0.5,
      fontSize: "0.5rem",
      zIndex: 1,
    }),
    [disabled, blackKeyWidthPercent, blackKeyHeightRatio],
  );

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        鍵盤: {keyboardRangeLabel(octaveCount)} / PC: A S D F G H J K（白）W E T Y U（黒）/
        オクターブ ±{octaveOffset}
      </Typography>

      <Box
        sx={{
          position: "relative",
          height: KEY_HEIGHT,
          userSelect: "none",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Box sx={{ display: "flex", width: "100%" }}>
          {whiteKeys.map((key) => (
            <Box
              key={key.relativeSemitone}
              component="button"
              type="button"
              aria-label={`${key.label}${key.pcKey ? ` (${key.pcKey.toUpperCase()})` : ""}`}
              onMouseDown={() => handleNoteOn(key.relativeSemitone)}
              onMouseUp={() => handleNoteOff(key.relativeSemitone)}
              onMouseLeave={() => {
                if (isActive(key.relativeSemitone)) {
                  handleNoteOff(key.relativeSemitone);
                }
              }}
              onTouchStart={(event) => {
                event.preventDefault();
                handleNoteOn(key.relativeSemitone);
              }}
              onTouchEnd={(event) => {
                event.preventDefault();
                handleNoteOff(key.relativeSemitone);
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                height: KEY_HEIGHT,
                border: "1px solid #333",
                borderRadius: "0 0 4px 4px",
                bgcolor: isActive(key.relativeSemitone) ? "#f3063e" : "#f5f5f5",
                color: isActive(key.relativeSemitone) ? "#fff" : "#000",
                cursor: disabled ? "not-allowed" : "pointer",
                p: 0,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                pb: 0.5,
                fontSize: "0.55rem",
              }}
            >
              {key.pcKey?.toUpperCase()}
            </Box>
          ))}
        </Box>

        {blackKeys.map((key) => (
          <Box
            key={key.relativeSemitone}
            component="button"
            type="button"
            aria-label={`${key.label}${key.pcKey ? ` (${key.pcKey.toUpperCase()})` : ""}`}
            onMouseDown={() => handleNoteOn(key.relativeSemitone)}
            onMouseUp={() => handleNoteOff(key.relativeSemitone)}
            onMouseLeave={() => {
              if (isActive(key.relativeSemitone)) {
                handleNoteOff(key.relativeSemitone);
              }
            }}
            onTouchStart={(event) => {
              event.preventDefault();
              handleNoteOn(key.relativeSemitone);
            }}
            onTouchEnd={(event) => {
              event.preventDefault();
              handleNoteOff(key.relativeSemitone);
            }}
            sx={{
              ...blackKeySx,
              left: blackKeyLeftPercent(key.whiteOffset),
              bgcolor: isActive(key.relativeSemitone) ? "#c00430" : "#222",
              color: "#fff",
            }}
          >
            {key.pcKey?.toUpperCase()}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
