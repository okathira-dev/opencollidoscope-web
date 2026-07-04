import {
  type CollidoscopeConfig,
  collidoscopeConfigSchema,
  mergeCollidoscopeConfig,
  type PartialCollidoscopeConfig,
  validateConfigDependencies,
} from "./config-schema.ts";
import { DEFAULT_CONFIG } from "./default-config.ts";

export const CONFIG_STORAGE_KEY = "collidoscope-config";
export const PRESETS_STORAGE_KEY = "collidoscope-presets";

export class ConfigManager {
  private config: CollidoscopeConfig;
  private presets: Record<string, CollidoscopeConfig>;

  constructor(initialConfig: PartialCollidoscopeConfig = {}) {
    this.config = mergeCollidoscopeConfig(DEFAULT_CONFIG, initialConfig);
    this.presets = {};
    this.loadFromStorage();
    this.loadPresetsFromStorage();
  }

  getConfig(): CollidoscopeConfig {
    return structuredClone(this.config);
  }

  updateConfig(updates: PartialCollidoscopeConfig): void {
    this.config = mergeCollidoscopeConfig(this.config, updates);
    validateConfigDependencies(this.config);
    collidoscopeConfigSchema.parse(this.config);
    this.saveToStorage();
  }

  resetConfig(): void {
    this.config = structuredClone(DEFAULT_CONFIG);
    this.saveToStorage();
  }

  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(configJson: string): void {
    let imported: unknown;

    try {
      imported = JSON.parse(configJson);
    } catch {
      throw new Error("JSONの構文が無効です");
    }

    const partialResult = collidoscopeConfigSchema.partial().safeParse(imported);

    if (!partialResult.success) {
      const errorMessage = partialResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      throw new Error(`設定ファイルの形式が無効です: ${errorMessage}`);
    }

    this.updateConfig(partialResult.data);
  }

  listPresets(): string[] {
    return Object.keys(this.presets).sort((a, b) => a.localeCompare(b));
  }

  getPresets(): Record<string, CollidoscopeConfig> {
    return structuredClone(this.presets);
  }

  savePreset(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("プリセット名を入力してください");
    }

    this.presets[trimmed] = structuredClone(this.config);
    this.savePresetsToStorage();
  }

  loadPreset(name: string): void {
    const preset = this.presets[name];
    if (!preset) {
      throw new Error(`プリセット "${name}" が見つかりません`);
    }

    this.config = structuredClone(preset);
    validateConfigDependencies(this.config);
    this.config = collidoscopeConfigSchema.parse(this.config);
    this.saveToStorage();
  }

  deletePreset(name: string): void {
    if (!this.presets[name]) {
      throw new Error(`プリセット "${name}" が見つかりません`);
    }

    delete this.presets[name];
    this.savePresetsToStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed: unknown = JSON.parse(stored);
      const result = collidoscopeConfigSchema.partial().safeParse(parsed);

      if (result.success) {
        this.config = mergeCollidoscopeConfig(this.config, result.data);
        validateConfigDependencies(this.config);
        this.config = collidoscopeConfigSchema.parse(this.config);
      }
    } catch {
      // 破損データは無視してデフォルト設定を維持する
    }
  }

  private saveToStorage(): void {
    const validatedConfig = collidoscopeConfigSchema.parse(this.config);
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(validatedConfig, null, 2));
  }

  private loadPresetsFromStorage(): void {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed !== "object" || parsed === null) {
        return;
      }

      const loaded: Record<string, CollidoscopeConfig> = {};
      for (const [name, value] of Object.entries(parsed)) {
        const result = collidoscopeConfigSchema.safeParse(value);
        if (result.success) {
          loaded[name] = result.data;
        }
      }
      this.presets = loaded;
    } catch {
      // 破損データは無視
    }
  }

  private savePresetsToStorage(): void {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(this.presets, null, 2));
  }
}
