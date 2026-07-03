import { create } from "zustand";

export type HardwareVariant = "original" | "new";
export type PlayerLayout = "facing" | "stacked" | "solo";

interface UIState {
  isConfigPanelOpen: boolean;
  hardwareVariant: HardwareVariant;
  playerLayout: PlayerLayout;
  openConfigPanel: () => void;
  closeConfigPanel: () => void;
  toggleConfigPanel: () => void;
  setHardwareVariant: (variant: HardwareVariant) => void;
  setPlayerLayout: (layout: PlayerLayout) => void;
}

const useUIStoreInternal = create<UIState>((set) => ({
  isConfigPanelOpen: false,
  hardwareVariant: "original",
  playerLayout: "facing",
  openConfigPanel: () => set({ isConfigPanelOpen: true }),
  closeConfigPanel: () => set({ isConfigPanelOpen: false }),
  toggleConfigPanel: () => set((state) => ({ isConfigPanelOpen: !state.isConfigPanelOpen })),
  setHardwareVariant: (variant) => set({ hardwareVariant: variant }),
  setPlayerLayout: (layout) => set({ playerLayout: layout }),
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
