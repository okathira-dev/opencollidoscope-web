import { describe, expect, it } from "vitest";

import {
  applyCompressorSettings,
  buildMicMediaConstraints,
  computeInputPeakLevel,
} from "./mic-input.ts";

describe("buildMicMediaConstraints", () => {
  it("マイク入力設定から MediaTrack 制約を生成する", () => {
    expect(
      buildMicMediaConstraints({
        autoGainControl: false,
        noiseSuppression: true,
        echoCancellation: false,
      }),
    ).toEqual({
      autoGainControl: false,
      noiseSuppression: true,
      echoCancellation: false,
    });
  });
});

describe("applyCompressorSettings", () => {
  it("コンプレッサーパラメータを反映する", () => {
    const compressor = {
      threshold: { value: 0 },
      knee: { value: 0 },
      ratio: { value: 0 },
      attack: { value: 0 },
      release: { value: 0 },
    } as DynamicsCompressorNode;

    applyCompressorSettings(compressor, {
      inputGain: 1,
      autoGainControl: false,
      noiseSuppression: false,
      echoCancellation: false,
      compressorEnabled: true,
      compressorThreshold: -18,
      compressorKnee: 20,
      compressorRatio: 4,
      compressorAttack: 0.01,
      compressorRelease: 0.1,
      normalizeRecording: false,
      normalizeTargetPeak: 1,
    });

    expect(compressor.threshold.value).toBe(-18);
    expect(compressor.knee.value).toBe(20);
    expect(compressor.ratio.value).toBe(4);
    expect(compressor.attack.value).toBe(0.01);
    expect(compressor.release.value).toBe(0.1);
  });
});

describe("computeInputPeakLevel", () => {
  it("時間領域データのピーク振幅を返す", () => {
    const analyser = {
      getFloatTimeDomainData(buffer: Float32Array) {
        buffer[0] = -0.2;
        buffer[1] = 0.5;
        buffer[2] = -0.1;
      },
    } as AnalyserNode;

    const peak = computeInputPeakLevel(analyser, new Float32Array(3));

    expect(peak).toBeCloseTo(0.5);
  });
});
