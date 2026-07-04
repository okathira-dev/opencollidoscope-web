import { describe, expect, it } from "vitest";

import { computeBufferPeak, normalizePeakBuffer } from "./recording-normalize.ts";

describe("recording-normalize", () => {
  it("バッファのピーク振幅を返す", () => {
    const samples = new Float32Array([-0.2, 0.5, -0.1]);

    expect(computeBufferPeak(samples)).toBeCloseTo(0.5);
  });

  it("ピークを目標値にスケールする", () => {
    const samples = new Float32Array([-0.2, 0.5, -0.1]);
    const scale = normalizePeakBuffer(samples, 0.95);

    expect(scale).toBeCloseTo(1.9);
    expect(computeBufferPeak(samples)).toBeCloseTo(0.95);
    expect(samples[1]).toBeCloseTo(0.95);
    expect(samples[0]).toBeCloseTo(-0.38);
  });

  it("無音バッファは変更しない", () => {
    const samples = new Float32Array([0, 0, 0]);
    const scale = normalizePeakBuffer(samples, 0.95);

    expect(scale).toBe(1);
    expect(samples[0]).toBe(0);
  });
});
