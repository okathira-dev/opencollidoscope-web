/**
 * PianoKeyboard.tsx - Interactive piano keyboard React component
 * Based on the original OpenCollidoscope piano keyboard
 */

import { useEffect, useMemo, useCallback } from "react";

import { KEYBOARD_MAPPINGS } from "../../../types/audio";

import type { PianoKeyboardProps } from "../../../types/audio";
import type React from "react";

interface PianoKey {
  note: number;
  isBlack: boolean;
  x: number;
  width: number;
}

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  onNoteOn,
  onNoteOff,
  activeNotes,
}) => {
  // Generate piano keys for 2 octaves starting from C4 (MIDI note 60)
  const keys = useMemo((): PianoKey[] => {
    const keyData: PianoKey[] = [];
    const whiteKeyWidth = 40;
    const blackKeyWidth = 24;
    let whiteKeyIndex = 0;

    for (let octave = 0; octave < 2; octave++) {
      const baseNote = 60 + octave * 12; // C4, C5

      // C
      keyData.push({
        note: baseNote,
        isBlack: false,
        x: whiteKeyIndex * whiteKeyWidth,
        width: whiteKeyWidth,
      });
      whiteKeyIndex++;

      // C#
      keyData.push({
        note: baseNote + 1,
        isBlack: true,
        x:
          (whiteKeyIndex - 1) * whiteKeyWidth +
          whiteKeyWidth -
          blackKeyWidth / 2,
        width: blackKeyWidth,
      });

      // D
      keyData.push({
        note: baseNote + 2,
        isBlack: false,
        x: whiteKeyIndex * whiteKeyWidth,
        width: whiteKeyWidth,
      });
      whiteKeyIndex++;

      // D#
      keyData.push({
        note: baseNote + 3,
        isBlack: true,
        x:
          (whiteKeyIndex - 1) * whiteKeyWidth +
          whiteKeyWidth -
          blackKeyWidth / 2,
        width: blackKeyWidth,
      });

      // E
      keyData.push({
        note: baseNote + 4,
        isBlack: false,
        x: whiteKeyIndex * whiteKeyWidth,
        width: whiteKeyWidth,
      });
      whiteKeyIndex++;

      // F
      keyData.push({
        note: baseNote + 5,
        isBlack: false,
        x: whiteKeyIndex * whiteKeyWidth,
        width: whiteKeyWidth,
      });
      whiteKeyIndex++;

      // F#
      keyData.push({
        note: baseNote + 6,
        isBlack: true,
        x:
          (whiteKeyIndex - 1) * whiteKeyWidth +
          whiteKeyWidth -
          blackKeyWidth / 2,
        width: blackKeyWidth,
      });

      // G
      keyData.push({
        note: baseNote + 7,
        isBlack: false,
        x: whiteKeyIndex * whiteKeyWidth,
        width: whiteKeyWidth,
      });
      whiteKeyIndex++;

      // G#
      keyData.push({
        note: baseNote + 8,
        isBlack: true,
        x:
          (whiteKeyIndex - 1) * whiteKeyWidth +
          whiteKeyWidth -
          blackKeyWidth / 2,
        width: blackKeyWidth,
      });

      // A
      keyData.push({
        note: baseNote + 9,
        isBlack: false,
        x: whiteKeyIndex * whiteKeyWidth,
        width: whiteKeyWidth,
      });
      whiteKeyIndex++;

      // A#
      keyData.push({
        note: baseNote + 10,
        isBlack: true,
        x:
          (whiteKeyIndex - 1) * whiteKeyWidth +
          whiteKeyWidth -
          blackKeyWidth / 2,
        width: blackKeyWidth,
      });

      // B
      keyData.push({
        note: baseNote + 11,
        isBlack: false,
        x: whiteKeyIndex * whiteKeyWidth,
        width: whiteKeyWidth,
      });
      whiteKeyIndex++;
    }

    return keyData;
  }, []);

  const handleMouseDown = useCallback(
    (note: number) => {
      onNoteOn(note, 80); // Default velocity
    },
    [onNoteOn],
  );

  const handleMouseUp = useCallback(
    (note: number) => {
      onNoteOff(note);
    },
    [onNoteOff],
  );

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.code;
      const note = KEYBOARD_MAPPINGS[key as keyof typeof KEYBOARD_MAPPINGS];

      if (note && activeNotes && !activeNotes.has(note)) {
        event.preventDefault();
        onNoteOn(note, 80);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.code;
      const note = KEYBOARD_MAPPINGS[key as keyof typeof KEYBOARD_MAPPINGS];

      if (note) {
        event.preventDefault();
        onNoteOff(note);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onNoteOn, onNoteOff, activeNotes]);

  const whiteKeys = keys.filter((key) => !key.isBlack);
  const blackKeys = keys.filter((key) => key.isBlack);

  return (
    <div className="piano-keyboard">
      <svg width="560" height="100" style={{ border: "1px solid #333" }}>
        {/* White keys */}
        {whiteKeys.map((key) => (
          <rect
            key={`white-${key.note}`}
            x={key.x}
            y={0}
            width={key.width}
            height={100}
            fill={activeNotes && activeNotes.has(key.note) ? "#ddd" : "#fff"}
            stroke="#000"
            strokeWidth={1}
            style={{ cursor: "pointer" }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleMouseDown(key.note);
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              handleMouseUp(key.note);
            }}
            onMouseLeave={(e) => {
              e.preventDefault();
              handleMouseUp(key.note);
            }}
          />
        ))}

        {/* Black keys */}
        {blackKeys.map((key) => (
          <rect
            key={`black-${key.note}`}
            x={key.x}
            y={0}
            width={key.width}
            height={60}
            fill={activeNotes && activeNotes.has(key.note) ? "#666" : "#000"}
            style={{ cursor: "pointer" }}
            onMouseDown={() => handleMouseDown(key.note)}
            onMouseUp={() => handleMouseUp(key.note)}
            onMouseLeave={() => handleMouseUp(key.note)}
          />
        ))}
      </svg>
      {/* markuplint-enable permitted-contents */}
    </div>
  );
};

export default PianoKeyboard;
