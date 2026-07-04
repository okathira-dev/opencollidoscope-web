export { CONFIG_STORAGE_KEY, ConfigManager, PRESETS_STORAGE_KEY } from "./config-manager.ts";
export {
  type CollidoscopeConfig,
  collidoscopeConfigSchema,
  mergeCollidoscopeConfig,
  type PartialCollidoscopeConfig,
  parseCollidoscopeConfig,
  validateConfigDependencies,
} from "./config-schema.ts";
export { DEFAULT_CONFIG } from "./default-config.ts";
