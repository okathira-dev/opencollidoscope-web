import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";

/**
 * Utility: convert MIDI note → playback rate ratio relative to middle-C.
 */
function midiToRate(midi: number): number {
  const chromaticRatios = [
    1,
    1.0594630943591,
    1.1224620483089,
    1.1892071150019,
    1.2599210498937,
    1.3348398541685,
    1.4142135623711,
    1.4983070768743,
    1.5874010519653,
    1.6817928305039,
    1.7817974362766,
    1.8877486253586,
  ];

  const distance = midi - 60;
  if (distance < 0) {
    const diff = -distance;
    const octaves = Math.floor(diff / 12);
    const intervals = diff % 12;
    return Math.pow(0.5, octaves) / chromaticRatios[intervals]!;
  }
  const octaves = Math.floor(distance / 12);
  const intervals = distance % 12;
  return Math.pow(2, octaves) * chromaticRatios[intervals]!;
}

export interface GrainSynthControls {
  selection: [number, number]; // seconds [start, end]
  setSelection: (sel: [number, number]) => void;
  grainDuration: number; // seconds
  setGrainDuration: (d: number) => void;
  loop: boolean;
  toggleLoop: () => void;
  playNote: (midi: number) => void;
}

/**
 * Hook returning granular playback helpers with additional controls (selection, grainDuration, loop).
 */
export function useGrainSynth(buffer: Tone.ToneAudioBuffer | null): GrainSynthControls {
  const [selection, setSelection] = useState<[number, number]>([0, 0]);
  const [grainDuration, setGrainDuration] = useState(0.2); // seconds
  const [loop, setLoop] = useState(false);
  const loopPlayerRef = useRef<Tone.GrainPlayer | null>(null);

  // Update default selection when buffer loaded
  useEffect(() => {
    if (buffer) {
      setSelection([0, buffer.duration]);
    }
  }, [buffer]);

  // Helper: stop and dispose loop player
  const stopLoopInternal = () => {
    if (loopPlayerRef.current) {
      loopPlayerRef.current.stop();
      loopPlayerRef.current.dispose();
      loopPlayerRef.current = null;
    }
  };

  // Play/stop loop whenever `loop` flag changes
  useEffect(() => {
    if (!buffer) return;

    if (loop) {
      stopLoopInternal(); // safety
      const [start, end] = selection;
      const player = new Tone.GrainPlayer({
        url: buffer,
        grainSize: grainDuration,
        overlap: grainDuration * 0.25,
        loop: true,
        loopStart: start,
        loopEnd: end,
      }).toDestination();
      player.start(0);
      loopPlayerRef.current = player;
    } else {
      stopLoopInternal();
    }

    // cleanup on unmount
    return () => {
      stopLoopInternal();
    };
  }, [loop, buffer, selection, grainDuration]);

  // Play a one-shot note
  const playNote = useCallback(
    (midi: number) => {
      if (!buffer) return;

      const [selStart, selEnd] = selection;
      const offset = selStart + Math.random() * (selEnd - selStart);

      const player = new Tone.GrainPlayer({
        url: buffer,
        grainSize: grainDuration,
        overlap: grainDuration * 0.25,
        loop: false,
      }).toDestination();

      player.playbackRate = midiToRate(midi);

      player.start(0, offset);
      player.stop("+1");
    },
    [buffer, selection, grainDuration],
  );

  return {
    selection,
    setSelection,
    grainDuration,
    setGrainDuration,
    loop,
    toggleLoop: () => setLoop((prev) => !prev),
    playNote,
  };
}