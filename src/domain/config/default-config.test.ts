import { describe, expect, it } from "vitest";

import { collidoscopeConfigSchema } from "./config-schema.ts";
import { DEFAULT_CONFIG } from "./default-config.ts";

describe("DEFAULT_CONFIG", () => {
  it("スキーマを通過する", () => {
    const result = collidoscopeConfigSchema.safeParse(DEFAULT_CONFIG);

    expect(result.success).toBe(true);
  });

  it("デフォルト値が仕様書の値と一致する", () => {
    expect(DEFAULT_CONFIG.audio.chunkCount).toBe(150);
    expect(DEFAULT_CONFIG.audio.waveLength).toBe(2.0);
    expect(DEFAULT_CONFIG.granular.maxGrains).toBe(32);
    expect(DEFAULT_CONFIG.granular.maxVoices).toBe(6);
    expect(DEFAULT_CONFIG.visual.colors.wave1).toBe("#F3063E");
    expect(DEFAULT_CONFIG.visual.colors.wave2).toBe("#FFCC00");
    expect(DEFAULT_CONFIG.midi.ccMappings.filterCutoff).toBe(7);
  });
});
