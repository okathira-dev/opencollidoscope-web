import { create } from "zustand";

import {
  type CollidoscopeConfig,
  ConfigManager,
  type PartialCollidoscopeConfig,
} from "../domain/config/index.ts";

interface ConfigState {
  config: CollidoscopeConfig;
  configManager: ConfigManager;
  presets: string[];
  applyConfig: (updates: PartialCollidoscopeConfig) => void;
  persistConfig: () => void;
  updateConfig: (updates: PartialCollidoscopeConfig) => void;
  resetConfig: () => void;
  exportConfig: () => string;
  importConfig: (json: string) => void;
  savePreset: (name: string) => void;
  loadPreset: (name: string) => void;
  deletePreset: (name: string) => void;
  refreshPresets: () => void;
}

const configManager = new ConfigManager();

function syncPresetsFromManager(): string[] {
  return configManager.listPresets();
}

const useConfigStoreInternal = create<ConfigState>((set) => ({
  config: configManager.getConfig(),
  configManager,
  presets: syncPresetsFromManager(),
  applyConfig: (updates) => {
    configManager.applyConfig(updates);
    set({ config: configManager.getConfig() });
  },
  persistConfig: () => {
    configManager.persistConfig();
  },
  updateConfig: (updates) => {
    configManager.updateConfig(updates);
    set({ config: configManager.getConfig() });
  },
  resetConfig: () => {
    configManager.resetConfig();
    set({ config: configManager.getConfig() });
  },
  exportConfig: () => configManager.exportConfig(),
  importConfig: (json) => {
    configManager.importConfig(json);
    set({ config: configManager.getConfig() });
  },
  savePreset: (name) => {
    configManager.savePreset(name);
    set({ presets: syncPresetsFromManager() });
  },
  loadPreset: (name) => {
    configManager.loadPreset(name);
    set({ config: configManager.getConfig() });
  },
  deletePreset: (name) => {
    configManager.deletePreset(name);
    set({ presets: syncPresetsFromManager() });
  },
  refreshPresets: () => {
    set({ presets: syncPresetsFromManager() });
  },
}));

export function useConfig(): CollidoscopeConfig {
  return useConfigStoreInternal((state) => state.config);
}

export function useConfigAudio() {
  return useConfigStoreInternal((state) => state.config.audio);
}

export function useConfigMicInput() {
  return useConfigStoreInternal((state) => state.config.micInput);
}

export function useApplyConfig() {
  return useConfigStoreInternal((state) => state.applyConfig);
}

export function usePersistConfig() {
  return useConfigStoreInternal((state) => state.persistConfig);
}

export function useUpdateConfig() {
  return useConfigStoreInternal((state) => state.updateConfig);
}

export function useResetConfig() {
  return useConfigStoreInternal((state) => state.resetConfig);
}

export function useExportConfig() {
  return useConfigStoreInternal((state) => state.exportConfig);
}

export function useImportConfig() {
  return useConfigStoreInternal((state) => state.importConfig);
}

export function usePresets(): string[] {
  return useConfigStoreInternal((state) => state.presets);
}

export function useSavePreset() {
  return useConfigStoreInternal((state) => state.savePreset);
}

export function useLoadPreset() {
  return useConfigStoreInternal((state) => state.loadPreset);
}

export function useDeletePreset() {
  return useConfigStoreInternal((state) => state.deletePreset);
}

export function getConfigState(): ConfigState {
  return useConfigStoreInternal.getState();
}

export function subscribeConfig(listener: (config: CollidoscopeConfig) => void): () => void {
  return useConfigStoreInternal.subscribe((state, prev) => {
    if (state.config !== prev.config) {
      listener(state.config);
    }
  });
}
