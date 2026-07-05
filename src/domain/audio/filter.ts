import { MIDI_CC_MAX } from "../../consts/midi.ts";

/**
 * CollidoscopeApp.cpp CC7 と同型の指数的カットオフ。
 * オリジナルは指数部に 200 をハードコード: pow(maxCutoff/200, midi/127) * minCutoff
 * Web 版では 200 を config.filter.minCutoff（設定パネル可変）に置き換える。
 */
export function midiToFilterCutoff(midiVal: number, minCutoff: number, maxCutoff: number): number {
  const clamped = Math.max(0, Math.min(MIDI_CC_MAX, midiVal));
  const exponentBase = Math.max(minCutoff, 1);
  return (maxCutoff / exponentBase) ** (clamped / MIDI_CC_MAX) * minCutoff;
}

/** CollidoscopeApp.cpp: lmap(midi, 0, 127, 0, 1) → Wave.cpp: 0.5 + coeff * 0.5 */
export function selectionAlphaFromFilter(midiVal: number): number {
  const clamped = Math.max(0, Math.min(MIDI_CC_MAX, midiVal));
  return 0.5 + (clamped / MIDI_CC_MAX) * 0.5;
}
