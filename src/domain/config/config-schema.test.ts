import { describe, expect, it } from "vitest";

import {
  collidoscopeConfigSchema,
  parseCollidoscopeConfig,
  validateConfigDependencies,
} from "./config-schema.ts";

describe("collidoscopeConfigSchema", () => {
  it("空オブジェクトをパースするとデフォルト値が補完される", () => {
    const result = parseCollidoscopeConfig({});

    expect(result.audio.chunkCount).toBe(150);
    expect(result.audio.waveLength).toBe(2.0);
    expect(result.audio.sampleRate).toBe(44100);
    expect(result.granular.maxGrains).toBe(32);
    expect(result.visual.colors.wave1).toBe("#F3063E");
    expect(result.midi.ccMappings.selectionSize).toBe(1);
  });

  it("有効な値でパースが成功する", () => {
    const result = parseCollidoscopeConfig({
      audio: {
        chunkCount: 200,
        waveLength: 3.0,
      },
    });

    expect(result.audio.chunkCount).toBe(200);
    expect(result.audio.waveLength).toBe(3.0);
    expect(result.audio.sampleRate).toBe(44100);
  });

  it("範囲外のチャンク数でバリデーションエラーになる", () => {
    const result = collidoscopeConfigSchema.safeParse({
      audio: { chunkCount: 0 },
    });

    expect(result.success).toBe(false);
  });

  it("範囲外の録音時間でバリデーションエラーになる", () => {
    const result = collidoscopeConfigSchema.safeParse({
      audio: { waveLength: 20 },
    });

    expect(result.success).toBe(false);
  });

  it("不正な型でバリデーションエラーになる", () => {
    const result = collidoscopeConfigSchema.safeParse({
      audio: { chunkCount: "invalid" },
    });

    expect(result.success).toBe(false);
  });

  it("不正なカラーコードでバリデーションエラーになる", () => {
    const result = collidoscopeConfigSchema.safeParse({
      visual: { colors: { wave1: "not-a-color" } },
    });

    expect(result.success).toBe(false);
  });
});

describe("validateConfigDependencies", () => {
  it("maxSelectionSize が chunkCount 以下なら成功する", () => {
    const config = parseCollidoscopeConfig({
      audio: { chunkCount: 100, maxSelectionSize: 37 },
    });

    expect(() => validateConfigDependencies(config)).not.toThrow();
  });

  it("maxSelectionSize が chunkCount を超えるとエラーになる", () => {
    const config = parseCollidoscopeConfig({
      audio: { chunkCount: 10, maxSelectionSize: 37 },
    });

    expect(() => validateConfigDependencies(config)).toThrow(
      "最大選択サイズはチャンク数以下で設定してください",
    );
  });

  it("minCutoff が maxCutoff 以上だとエラーになる", () => {
    const config = parseCollidoscopeConfig({
      filter: { minCutoff: 10000, maxCutoff: 500 },
    });

    expect(() => validateConfigDependencies(config)).toThrow(
      "最小カットオフは最大カットオフより小さく設定してください",
    );
  });
});
