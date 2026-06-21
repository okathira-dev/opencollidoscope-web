import { beforeEach, describe, expect, it } from "vitest";
import { CONFIG_STORAGE_KEY, ConfigManager } from "./config-manager.ts";
import type { PartialCollidoscopeConfig } from "./config-schema.ts";
import { DEFAULT_CONFIG } from "./default-config.ts";

describe("ConfigManager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("初期化でデフォルト設定が適用される", () => {
    const manager = new ConfigManager();

    expect(manager.getConfig()).toEqual(DEFAULT_CONFIG);
  });

  it("カスタム初期設定をマージできる", () => {
    const manager = new ConfigManager({
      audio: { chunkCount: 200 },
    });

    expect(manager.getConfig().audio.chunkCount).toBe(200);
    expect(manager.getConfig().audio.waveLength).toBe(DEFAULT_CONFIG.audio.waveLength);
  });

  it("updateConfig で部分更新ができる", () => {
    const manager = new ConfigManager();

    manager.updateConfig({
      audio: { chunkCount: 200, waveLength: 3.0 },
      granular: { maxGrains: 64 },
    });

    const config = manager.getConfig();
    expect(config.audio.chunkCount).toBe(200);
    expect(config.audio.waveLength).toBe(3.0);
    expect(config.granular.maxGrains).toBe(64);
    expect(config.audio.sampleRate).toBe(DEFAULT_CONFIG.audio.sampleRate);
  });

  it("依存関係違反で updateConfig がエラーになる", () => {
    const manager = new ConfigManager();

    expect(() =>
      manager.updateConfig({
        audio: { chunkCount: 10, maxSelectionSize: 37 },
      }),
    ).toThrow("最大選択サイズはチャンク数以下で設定してください");
  });

  it("resetConfig でデフォルトに戻る", () => {
    const manager = new ConfigManager({ audio: { chunkCount: 200 } });

    manager.resetConfig();

    expect(manager.getConfig()).toEqual(DEFAULT_CONFIG);
  });

  it("exportConfig / importConfig の往復で設定が保存される", () => {
    const manager = new ConfigManager();
    const updates: PartialCollidoscopeConfig = {
      audio: { chunkCount: 200 },
      visual: { colors: { wave1: "#FF0000" } },
    };

    manager.updateConfig(updates);
    const exported = manager.exportConfig();

    localStorage.clear();
    const anotherManager = new ConfigManager();
    anotherManager.importConfig(exported);

    expect(anotherManager.getConfig().audio.chunkCount).toBe(200);
    expect(anotherManager.getConfig().visual.colors.wave1).toBe("#FF0000");
  });

  it("不正な JSON のインポートでエラーが返る", () => {
    const manager = new ConfigManager();

    expect(() => manager.importConfig("{ invalid json")).toThrow("JSONの構文が無効です");
  });

  it("不正な設定値のインポートでエラーが返る", () => {
    const manager = new ConfigManager();

    expect(() => manager.importConfig(JSON.stringify({ audio: { chunkCount: -1 } }))).toThrow(
      "設定ファイルの形式が無効です",
    );
  });

  it("localStorage から有効な設定を読み込む", () => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ audio: { chunkCount: 180 } }));

    const manager = new ConfigManager();

    expect(manager.getConfig().audio.chunkCount).toBe(180);
  });

  it("localStorage の破損データは無視してデフォルトを使う", () => {
    localStorage.setItem(CONFIG_STORAGE_KEY, "{ invalid");

    const manager = new ConfigManager();

    expect(manager.getConfig()).toEqual(DEFAULT_CONFIG);
  });

  it("localStorage の無効な設定値は無視してデフォルトを使う", () => {
    localStorage.setItem(
      CONFIG_STORAGE_KEY,
      JSON.stringify({ audio: { chunkCount: "not-a-number" } }),
    );

    const manager = new ConfigManager();

    expect(manager.getConfig()).toEqual(DEFAULT_CONFIG);
  });

  it("updateConfig 後に localStorage に保存される", () => {
    const manager = new ConfigManager();
    manager.updateConfig({ audio: { chunkCount: 175 } });

    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored ?? "{}") as { audio: { chunkCount: number } };
    expect(parsed.audio.chunkCount).toBe(175);
  });
});
