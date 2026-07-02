import { describe, expect, it } from "vitest";

import { computeFadeGain, computeFadeSamples } from "./fade.ts";

describe("computeFadeSamples", () => {
  it("20ms分のサンプル数を返す", () => {
    expect(computeFadeSamples(44100)).toBe(882);
  });
});

describe("computeFadeGain", () => {
  const totalSamples = 1000;
  const fadeSamples = 100;

  it("フェードイン開始は0", () => {
    expect(computeFadeGain(0, totalSamples, fadeSamples)).toBe(0);
  });

  it("フェードイン終了直前は1未満", () => {
    expect(computeFadeGain(99, totalSamples, fadeSamples)).toBeCloseTo(0.99);
  });

  it("中間は1", () => {
    expect(computeFadeGain(500, totalSamples, fadeSamples)).toBe(1);
  });

  it("フェードアウト終了は0", () => {
    expect(computeFadeGain(999, totalSamples, fadeSamples)).toBeCloseTo(0.01);
  });

  it("フェードアウト開始直前は1", () => {
    expect(computeFadeGain(899, totalSamples, fadeSamples)).toBe(1);
  });
});
