import { describe, expect, it } from "vitest";

import {
  computeBufferLength,
  computeChunkIndex,
  computeChunkMinMax,
  computeChunkRange,
  computeSamplesPerChunk,
} from "./chunk.ts";

describe("computeBufferLength", () => {
  it("サンプルレートと録音時間からバッファ長を計算する", () => {
    expect(computeBufferLength(44100, 2.0)).toBe(88200);
  });
});

describe("computeSamplesPerChunk", () => {
  it("オリジナル既定値で588サンプル/チャンクになる", () => {
    expect(computeSamplesPerChunk(88200, 150)).toBe(588);
  });
});

describe("computeChunkIndex", () => {
  it("サンプル位置からチャンクインデックスを返す", () => {
    expect(computeChunkIndex(0, 588)).toBe(0);
    expect(computeChunkIndex(587, 588)).toBe(0);
    expect(computeChunkIndex(588, 588)).toBe(1);
  });
});

describe("computeChunkRange", () => {
  it("チャンクの開始・終了サンプル位置を返す", () => {
    expect(computeChunkRange(0, 588, 88200)).toEqual({ start: 0, end: 588 });
    expect(computeChunkRange(149, 588, 88200)).toEqual({ start: 87612, end: 88200 });
  });
});

describe("computeChunkMinMax", () => {
  it("チャンク区間のmin/maxを計算する", () => {
    const samples = new Float32Array([0.1, -0.5, 0.3, 0.8, -0.2]);

    const result = computeChunkMinMax(samples, 0, 2);
    expect(result.min).toBe(-0.5);
    expect(result.max).toBeCloseTo(0.1);
    const chunk1 = computeChunkMinMax(samples, 1, 2);
    expect(chunk1.min).toBeCloseTo(0.3);
    expect(chunk1.max).toBeCloseTo(0.8);
  });

  it("空チャンクは0を返す", () => {
    const samples = new Float32Array([0.1]);

    expect(computeChunkMinMax(samples, 5, 2)).toEqual({ min: 0, max: 0 });
  });
});
