const FADE_DURATION_SECONDS = 0.02;

export function computeFadeSamples(sampleRate: number): number {
  return Math.round(sampleRate * FADE_DURATION_SECONDS);
}

export function computeFadeGain(
  sampleIndex: number,
  totalSamples: number,
  fadeSamples: number,
): number {
  if (fadeSamples <= 0 || totalSamples <= 0) {
    return 1;
  }

  if (sampleIndex < fadeSamples) {
    return sampleIndex / fadeSamples;
  }

  const fadeOutStart = totalSamples - fadeSamples;
  if (sampleIndex >= fadeOutStart) {
    const remaining = totalSamples - sampleIndex;
    return remaining / fadeSamples;
  }

  return 1;
}
