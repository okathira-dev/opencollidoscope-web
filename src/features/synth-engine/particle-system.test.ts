import { describe, expect, it } from "vitest";

import {
  chunkCenterX,
  computeParticleSpawnAmount,
  MAX_PARTICLE_ADD,
  ParticleSystem,
} from "./particle-system.ts";

describe("computeParticleSpawnAmount", () => {
  it("spread と filter に比例する", () => {
    expect(computeParticleSpawnAmount(8, 1)).toBe(MAX_PARTICLE_ADD);
    expect(computeParticleSpawnAmount(2, 1)).toBe(5);
    expect(computeParticleSpawnAmount(8, 0.5)).toBe(11);
  });

  it("最低 1 粒", () => {
    expect(computeParticleSpawnAmount(1.1, 0)).toBe(1);
  });
});

describe("ParticleSystem", () => {
  it("spread <= 1 では粒子を追加しない", () => {
    const system = new ParticleSystem();
    system.addParticles(
      {
        particleSpread: 1,
        filterCoeff: 1,
        selectionStart: 0,
        selectionEnd: 10,
        canvasHeight: 200,
      },
      9,
      7,
    );
    expect(system.getActiveCount()).toBe(0);
  });

  it("spread > 1 で粒子を追加する", () => {
    const system = new ParticleSystem();
    system.addParticles(
      {
        particleSpread: 8,
        filterCoeff: 1,
        selectionStart: 0,
        selectionEnd: 10,
        canvasHeight: 200,
      },
      9,
      7,
    );
    expect(system.getActiveCount()).toBeGreaterThan(0);
  });

  it("update で寿命切れ粒子を除去する", () => {
    const system = new ParticleSystem();
    system.addParticles(
      {
        particleSpread: 8,
        filterCoeff: 1,
        selectionStart: 0,
        selectionEnd: 0,
        canvasHeight: 200,
      },
      9,
      7,
    );
    const initial = system.getActiveCount();
    for (let frame = 0; frame < 100; frame++) {
      system.update();
    }
    expect(system.getActiveCount()).toBeLessThan(initial);
  });
});

describe("chunkCenterX", () => {
  it("チャンク中心 X を返す", () => {
    expect(chunkCenterX(0, 9, 7)).toBe(3.5);
    expect(chunkCenterX(5, 9, 7)).toBe(5 * 9 + 3.5);
  });
});
