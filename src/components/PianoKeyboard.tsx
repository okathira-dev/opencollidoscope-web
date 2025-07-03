/**
 * PianoKeyboard.tsx - Interactive piano keyboard React component
 * Based on the original OpenCollidoscope piano keyboard
 */

import React, { useCallback, useMemo } from 'react';
import { PianoKeyboardProps, PianoKeyProps } from '../types/ui';
import { KEYBOARD_MAPPINGS } from '../types/audio';

const PianoKey: React.FC<PianoKeyProps> = ({
  note,
  isBlack,
  isPressed,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  onMouseLeave,
}) => {
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onMouseDown(note);
  }, [note, onMouseDown]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onMouseUp(note);
  }, [note, onMouseUp]);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    onMouseEnter(note);
  }, [note, onMouseEnter]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    onMouseLeave(note);
  }, [note, onMouseLeave]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    onMouseDown(note);
  }, [note, onMouseDown]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    onMouseUp(note);
  }, [note, onMouseUp]);

  // Get computer keyboard label for this MIDI note
  const getKeyLabel = (midiNote: number): string => {
    const reverseMapping = Object.entries(KEYBOARD_MAPPINGS).find(
      ([, value]) => value === midiNote
    );
    return reverseMapping ? reverseMapping[0].replace('Key', '') : '';
  };

  // Get note name (C, C#, D, etc.)
  const getNoteName = (midiNote: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const note = noteNames[midiNote % 12];
    const octave = Math.floor(midiNote / 12) - 1;
    return `${note}${octave}`;
  };

  const keyLabel = getKeyLabel(note);
  const noteName = getNoteName(note);

  return (
    <button
      className={`piano-key ${isBlack ? 'black' : 'white'} ${isPressed ? 'pressed' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
      data-midi-note={note}
      aria-label={`Piano key ${noteName}`}
    >
      {keyLabel && (
        <span className="key-label">{keyLabel}</span>
      )}
      <span className="midi-note">{note}</span>
      <span className="note-name">{noteName}</span>
    </button>
  );
};

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  startNote = 60, // C4
  endNote = 84,   // C6 (25 keys)
  onNotePress,
  onNoteRelease,
  pressedKeys = new Set(),
}) => {
  // Generate array of MIDI notes for the keyboard range
  const notes = useMemo(() => {
    const noteArray = [];
    for (let i = startNote; i <= endNote; i++) {
      noteArray.push(i);
    }
    return noteArray;
  }, [startNote, endNote]);

  // Check if a MIDI note is a black key
  const isBlackKey = useCallback((midiNote: number): boolean => {
    const note = midiNote % 12;
    return [1, 3, 6, 8, 10].includes(note); // C#, D#, F#, G#, A#
  }, []);

  const handleMouseDown = useCallback((note: number) => {
    onNotePress(note, 0.8); // Default velocity
  }, [onNotePress]);

  const handleMouseUp = useCallback((note: number) => {
    onNoteRelease(note);
  }, [onNoteRelease]);

  const handleMouseEnter = useCallback((note: number) => {
    // Could implement drag functionality here
  }, []);

  const handleMouseLeave = useCallback((note: number) => {
    // Could implement drag functionality here
  }, []);

  // Handle mouse leave from the entire keyboard (release all keys)
  const handleKeyboardMouseLeave = useCallback(() => {
    pressedKeys.forEach(note => {
      onNoteRelease(note);
    });
  }, [pressedKeys, onNoteRelease]);

  return (
    <div 
      className="piano-keyboard-container"
      onMouseLeave={handleKeyboardMouseLeave}
    >
      <div className="piano-keyboard">
        {notes.map(note => (
          <PianoKey
            key={note}
            note={note}
            isBlack={isBlackKey(note)}
            isPressed={pressedKeys.has(note)}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>
    </div>
  );
};