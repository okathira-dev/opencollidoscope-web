export interface HannState {
  b1: number;
  y1: number;
  y2: number;
}

export function computeHannCoefficients(duration: number): HannState {
  const w = Math.PI / duration;
  return {
    b1: 2.0 * Math.cos(w),
    y1: Math.sin(w),
    y2: 0.0,
  };
}

export function tickHann(state: HannState): { y0: number; state: HannState } {
  const y0 = state.b1 * state.y1 - state.y2;
  return {
    y0,
    state: {
      b1: state.b1,
      y1: y0,
      y2: state.y1,
    },
  };
}

export function interpolateLinear(x0: number, x1: number, frac: number): number {
  return (1 - frac) * x0 + frac * x1;
}

export function midiNoteToRate(midiNote: number, baseNote = 60): number {
  return 2 ** ((midiNote - baseNote) / 12);
}

export function computeGrainDuration(
  selectionSize: number,
  durationCoeff: number,
  minDuration: number,
): number {
  const duration = Math.round(selectionSize * durationCoeff);
  return Math.max(duration, minDuration);
}

export function clampSelectionSize(size: number, minDuration: number): number {
  return Math.max(size, minDuration);
}

export function computeSelectionSamples(
  startChunk: number,
  sizeChunks: number,
  samplesPerChunk: number,
): { startSample: number; sizeSamples: number } {
  return {
    startSample: startChunk * samplesPerChunk,
    sizeSamples: sizeChunks * samplesPerChunk,
  };
}
