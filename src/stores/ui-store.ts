import { create } from "zustand";

export type HardwareVariant = "original" | "new";
export type PlayerLayout = "facing" | "stacked" | "solo";

export type ConfigPanelSectionId =
  | "audio"
  | "mic-input"
  | "granular"
  | "filter"
  | "visual"
  | "preset"
  | "midi";

interface UIState {
  isConfigPanelOpen: boolean;
  configPanelTargetSection: ConfigPanelSectionId | null;
  hardwareVariant: HardwareVariant;
  playerLayout: PlayerLayout;
  isFullscreen: boolean;
  openConfigPanel: () => void;
  openConfigPanelSection: (sectionId: ConfigPanelSectionId) => void;
  clearConfigPanelTargetSection: () => void;
  closeConfigPanel: () => void;
  toggleConfigPanel: () => void;
  setHardwareVariant: (variant: HardwareVariant) => void;
  setPlayerLayout: (layout: PlayerLayout) => void;
  setIsFullscreen: (value: boolean) => void;
  toggleFullscreen: () => Promise<void>;
}

async function requestAppFullscreen(): Promise<void> {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }

  await document.documentElement.requestFullscreen();
}

const useUIStoreInternal = create<UIState>((set) => ({
  isConfigPanelOpen: false,
  configPanelTargetSection: null,
  hardwareVariant: "original",
  playerLayout: "solo",
  isFullscreen: document.fullscreenElement !== null,
  openConfigPanel: () => set({ isConfigPanelOpen: true }),
  openConfigPanelSection: (sectionId) =>
    set({ isConfigPanelOpen: true, configPanelTargetSection: sectionId }),
  clearConfigPanelTargetSection: () => set({ configPanelTargetSection: null }),
  closeConfigPanel: () => set({ isConfigPanelOpen: false, configPanelTargetSection: null }),
  toggleConfigPanel: () => set((state) => ({ isConfigPanelOpen: !state.isConfigPanelOpen })),
  setHardwareVariant: (variant) => set({ hardwareVariant: variant }),
  setPlayerLayout: (layout) => set({ playerLayout: layout }),
  setIsFullscreen: (value) => set({ isFullscreen: value }),
  toggleFullscreen: async () => {
    try {
      await requestAppFullscreen();
      set({ isFullscreen: document.fullscreenElement !== null });
    } catch {
      // ユーザーキャンセルや非対応環境は無視
    }
  },
}));

export function useIsConfigPanelOpen(): boolean {
  return useUIStoreInternal((state) => state.isConfigPanelOpen);
}

export function useToggleConfigPanel() {
  return useUIStoreInternal((state) => state.toggleConfigPanel);
}

export function useOpenConfigPanel() {
  return useUIStoreInternal((state) => state.openConfigPanel);
}

export function useOpenConfigPanelSection() {
  return useUIStoreInternal((state) => state.openConfigPanelSection);
}

export function useConfigPanelTargetSection(): ConfigPanelSectionId | null {
  return useUIStoreInternal((state) => state.configPanelTargetSection);
}

export function useClearConfigPanelTargetSection() {
  return useUIStoreInternal((state) => state.clearConfigPanelTargetSection);
}

export function useCloseConfigPanel() {
  return useUIStoreInternal((state) => state.closeConfigPanel);
}

export function useHardwareVariant(): HardwareVariant {
  return useUIStoreInternal((state) => state.hardwareVariant);
}

export function useSetHardwareVariant() {
  return useUIStoreInternal((state) => state.setHardwareVariant);
}

export function usePlayerLayout(): PlayerLayout {
  return useUIStoreInternal((state) => state.playerLayout);
}

export function useSetPlayerLayout() {
  return useUIStoreInternal((state) => state.setPlayerLayout);
}

export function useIsFullscreen(): boolean {
  return useUIStoreInternal((state) => state.isFullscreen);
}

export function useToggleFullscreen() {
  return useUIStoreInternal((state) => state.toggleFullscreen);
}

export function useSetIsFullscreen() {
  return useUIStoreInternal((state) => state.setIsFullscreen);
}

export function subscribeFullscreenChange(): () => void {
  const handler = () => {
    useUIStoreInternal.getState().setIsFullscreen(document.fullscreenElement !== null);
  };
  document.addEventListener("fullscreenchange", handler);
  return () => document.removeEventListener("fullscreenchange", handler);
}
