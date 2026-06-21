import {
  type CollidoscopeConfig,
  collidoscopeConfigSchema,
  mergeCollidoscopeConfig,
  type PartialCollidoscopeConfig,
  validateConfigDependencies,
} from "./config-schema.ts";
import { DEFAULT_CONFIG } from "./default-config.ts";

export const CONFIG_STORAGE_KEY = "collidoscope-config";

export class ConfigManager {
  private config: CollidoscopeConfig;

  constructor(initialConfig: PartialCollidoscopeConfig = {}) {
    this.config = mergeCollidoscopeConfig(DEFAULT_CONFIG, initialConfig);
    this.loadFromStorage();
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
}
