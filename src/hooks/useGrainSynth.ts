import { useCallback } from "react";
import * as Tone from "tone";

/**
 * Hook providing a playNote function that triggers a granular playback of the loaded audio buffer.
 * The audio context must be started externally (Tone.start()).
 */
export function useGrainSynth(buffer: Tone.ToneAudioBuffer | null) {
  const playNote = useCallback(
    (midi: number) => {
      if (!buffer) return;

      // Create a GrainPlayer for this note.
      const player = new Tone.GrainPlayer({
        url: buffer,
        grainSize: 0.2, // seconds – tweak as desired
        overlap: 0.05,
        loop: false,
      }).toDestination();

      // Pitch-shift by setting detune in cents (100 cents per semitone).
      player.detune = (midi - 60) * 100;

      // Slight randomization of grain position for more natural sound.
      player.playbackRate = 1;

      // Start immediately and schedule stop after 1 second.
      player.start(0);
      player.stop("+1");
    },
    [buffer],
  );

  return { playNote };
}