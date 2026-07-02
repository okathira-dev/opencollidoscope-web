import { describe, expect, it } from "vitest";

import {
  clampSelectionSize,
  computeGrainDuration,
  computeHannCoefficients,
  computeSelectionSamples,
  interpolateLinear,
  midiNoteToRate,
  tickHann,
} from "./grain.ts";

describe("computeHannCoefficients", () => {
  it("raised cosine bell の初期係数を返す", () => {
    const duration = 640;
    const { b1, y1, y2 } = computeHannCoefficients(duration);
    const w = Math.PI / duration;

    expect(b1).toBeCloseTo(2.0 * Math.cos(w));
    expect(y1).toBeCloseTo(Math.sin(w));
    expect(y2).toBe(0);
  });
});

describe("tickHann", () => {
  it("再帰式で Hann 窓を進める", () => {
    const state = computeHannCoefficients(4);
    const { y0, state: next } = tickHann(state);

    expect(y0).toBeCloseTo(state.b1 * state.y1 - state.y2);
    expect(next.y1).toBe(y0);
    expect(next.y2).toBe(state.y1);
  });
});

describe("interpolateLinear", () => {
  it("線形補間する", () => {
    expect(interpolateLinear(0, 1, 0)).toBe(0);
    expect(interpolateLinear(0, 1, 1)).toBe(1);
    expect(interpolateLinear(0, 1, 0.5)).toBe(0.5);
  });
});

describe("midiNoteToRate", () => {
  it("MIDI 60 は rate 1.0", () => {
    expect(midiNoteToRate(60)).toBe(1);
  });

  it("1 オクターブ上は rate 2.0", () => {
    expect(midiNoteToRate(72)).toBe(2);
  });

  it("半音上は 2^(1/12)", () => {
    expect(midiNoteToRate(61)).toBeCloseTo(2 ** (1 / 12));
  });
});

describe("computeGrainDuration", () => {
  it("選択サイズ × 係数を返す", () => {
    expect(computeGrainDuration(588, 1.0, 640)).toBe(640);
    expect(computeGrainDuration(588, 2.0, 640)).toBe(1176);
  });

  it("最小持続時間を下回らない", () => {
    expect(computeGrainDuration(100, 1.0, 640)).toBe(640);
  });
});

describe("clampSelectionSize", () => {
  it("最小グレイン持続時間未満はクランプする", () => {
    expect(clampSelectionSize(100, 640)).toBe(640);
    expect(clampSelectionSize(1000, 640)).toBe(1000);
  });
});

describe("computeSelectionSamples", () => {
  it("チャンク単位からサンプル位置を計算する", () => {
    expect(computeSelectionSamples(10, 5, 588)).toEqual({
      startSample: 5880,
      sizeSamples: 2940,
    });
  });
});
