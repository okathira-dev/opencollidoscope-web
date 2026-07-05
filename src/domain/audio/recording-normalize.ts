export function computeBufferPeak(samples: Float32Array): number {
  let peak = 0;
  // perf: 88K+ samples の全走査。GC ゼロの index ループを維持する。
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.abs(samples[i] ?? 0);
    if (sample > peak) {
      peak = sample;
    }
  }
  return peak;
}

/**
 * バッファ全体のピーク振幅を targetPeak に揃える（インプレース）。
 * 無音（peak=0）のときは何もしない。戻り値は適用したスケール係数（未適用なら 1）。
 */
export function normalizePeakBuffer(samples: Float32Array, targetPeak: number): number {
  const peak = computeBufferPeak(samples);
  if (peak <= 0) {
    return 1;
  }

  const scale = targetPeak / peak;
  // perf: in-place mutation (samples[i] = …) は配列メソッドでは表現不可。
  for (let i = 0; i < samples.length; i++) {
    samples[i] = (samples[i] ?? 0) * scale;
  }

  return scale;
}
