import { describe, expect, it } from "vitest";

import { EnvASR, EnvASRState } from "./env-asr.ts";

const SAMPLE_RATE = 44100;

describe("EnvASR", () => {
  it("初期状態は Idle で出力 0", () => {
    const env = new EnvASR(1.0, 0.01, 0.05, SAMPLE_RATE);
    expect(env.isIdle).toBe(true);
    expect(env.tick()).toBe(0);
  });

  it("noteOn で Attack → Sustain に遷移する", () => {
    const env = new EnvASR(1.0, 0.01, 0.05, SAMPLE_RATE);
    env.noteOn();

    const attackSamples = Math.ceil(0.01 * SAMPLE_RATE);
    for (let i = 0; i < attackSamples; i++) {
      env.tick();
    }

    expect(env.getState()).toBe(EnvASRState.Sustain);
    expect(env.tick()).toBeCloseTo(1.0);
  });

  it("noteOff で Release → Idle に遷移する", () => {
    const env = new EnvASR(1.0, 0.01, 0.05, SAMPLE_RATE);
    env.noteOn();

    const attackSamples = Math.ceil(0.01 * SAMPLE_RATE);
    for (let i = 0; i < attackSamples; i++) {
      env.tick();
    }

    env.noteOff();

    const releaseSamples = Math.ceil(0.05 * SAMPLE_RATE);
    for (let i = 0; i < releaseSamples; i++) {
      env.tick();
    }

    expect(env.isIdle).toBe(true);
    expect(env.tick()).toBe(0);
  });

  it("Idle 中の noteOff は無視される", () => {
    const env = new EnvASR(1.0, 0.01, 0.05, SAMPLE_RATE);
    env.noteOff();
    expect(env.isIdle).toBe(true);
  });
});
