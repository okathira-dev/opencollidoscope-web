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

      // Calculate playback rate ratio relative to middle C (MIDI 60) as in original code.
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
      let ratio = 1;
      if (distance < 0) {
        const diff = -distance;
        const octaves = Math.floor(diff / 12);
        const intervals = diff % 12;
        ratio = Math.pow(0.5, octaves) / chromaticRatios[intervals]!;
      } else {
        const octaves = Math.floor(distance / 12);
        const intervals = distance % 12;
        ratio = Math.pow(2, octaves) * chromaticRatios[intervals]!;
      }

      player.playbackRate = ratio;

      // Start immediately and schedule stop after 1 second.
      player.start(0);
      player.stop("+1");
    },
    [buffer],
  );

  return { playNote };
}