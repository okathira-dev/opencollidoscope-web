import { useState, useEffect, useCallback, useRef } from "react";

import { KEYBOARD_MAPPINGS } from "../types/audio";

interface UseKeyboardInputProps {
  onNotePress: (note: number, velocity: number) => void;
  onNoteRelease: (note: number) => void;
  onToggleLoop?: () => void;
  onToggleRecord?: () => void | Promise<void>;
  onToggleFullscreen?: () => void;
  enabled?: boolean;
}

export const useKeyboardInput = ({
  onNotePress,
  onNoteRelease,
  onToggleLoop,
  onToggleRecord,
  onToggleFullscreen,
  enabled = true,
}: UseKeyboardInputProps) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const pressedKeysRef = useRef<Set<string>>(new Set());

  // Keep ref in sync with state
  useEffect(() => {
    pressedKeysRef.current = pressedKeys;
  }, [pressedKeys]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || event.repeat) return;

      const { code } = event;

      // Handle special function keys
      switch (code) {
        case "Space":
          event.preventDefault();
          onToggleLoop?.();
          return;
        case "KeyR":
          if (!event.ctrlKey && !event.metaKey) {
            // Avoid interfering with browser refresh
            event.preventDefault();
            void onToggleRecord?.();
          }
          return;
        case "F11":
          event.preventDefault();
          onToggleFullscreen?.();
          return;
      }

      // Handle musical keys
      const midiNote = KEYBOARD_MAPPINGS[code];
      if (midiNote && !pressedKeysRef.current.has(code)) {
        setPressedKeys((prev: Set<string>) => new Set(prev).add(code));
        onNotePress(midiNote, 0.8); // Default velocity
      }
    },
    [enabled, onNotePress, onToggleLoop, onToggleRecord, onToggleFullscreen],
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const { code } = event;
      const midiNote = KEYBOARD_MAPPINGS[code];

      if (midiNote && pressedKeysRef.current.has(code)) {
        setPressedKeys((prev: Set<string>) => {
          const newSet = new Set(prev);
          newSet.delete(code);
          return newSet;
        });
        onNoteRelease(midiNote);
      }
    },
    [enabled, onNoteRelease],
  );

  // Handle window focus loss (release all keys)
  const handleWindowBlur = useCallback(() => {
    if (pressedKeysRef.current.size > 0) {
      // Release all currently pressed keys
      pressedKeysRef.current.forEach((code: string) => {
        const midiNote = KEYBOARD_MAPPINGS[code];
        if (midiNote) {
          onNoteRelease(midiNote);
        }
      });
      setPressedKeys(new Set());
    }
  }, [onNoteRelease]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [enabled, handleKeyDown, handleKeyUp, handleWindowBlur]);

  // Convert pressed keyboard codes to MIDI notes
  const getPressedMidiNotes = useCallback((): Set<number> => {
    const midiNotes = new Set<number>();
    pressedKeys.forEach((code: string) => {
      const midiNote = KEYBOARD_MAPPINGS[code];
      if (midiNote) {
        midiNotes.add(midiNote);
      }
    });
    return midiNotes;
  }, [pressedKeys]);

  return {
    pressedKeys,
    pressedMidiNotes: getPressedMidiNotes(),
  };
};
