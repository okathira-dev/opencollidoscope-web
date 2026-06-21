import { create } from "zustand";

import {
  type CollidoscopeConfig,
  ConfigManager,
  type PartialCollidoscopeConfig,
} from "../domain/config/index.ts";

interface ConfigState {
  config: CollidoscopeConfig;
  configManager: ConfigManager;
  updateConfig: (updates: PartialCollidoscopeConfig) => void;
  resetConfig: () => void;
}

const configManager = new ConfigManager();

const useConfigStoreInternal = create<ConfigState>((set) => ({
  config: configManager.getConfig(),
  configManager,
  updateConfig: (updates) => {
    configManager.updateConfig(updates);
    set({ config: configManager.getConfig() });
  },
  resetConfig: () => {
    configManager.resetConfig();
    set({ config: configManager.getConfig() });
  },
}));

export function useConfig(): CollidoscopeConfig {
  return useConfigStoreInternal((state) => state.config);
}

export function useConfigAudio() {
  return useConfigStoreInternal((state) => state.config.audio);
}

export function useUpdateConfig() {
  return useConfigStoreInternal((state) => state.updateConfig);
}

export function useResetConfig() {
  return useConfigStoreInternal((state) => state.resetConfig);
}

export function getConfigState(): ConfigState {
  return useConfigStoreInternal.getState();
}
