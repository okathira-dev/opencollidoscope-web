import { create } from "zustand";

interface UIState {
  isConfigPanelOpen: boolean;
  openConfigPanel: () => void;
  closeConfigPanel: () => void;
  toggleConfigPanel: () => void;
}

const useUIStoreInternal = create<UIState>((set) => ({
  isConfigPanelOpen: false,
  openConfigPanel: () => set({ isConfigPanelOpen: true }),
  closeConfigPanel: () => set({ isConfigPanelOpen: false }),
  toggleConfigPanel: () => set((state) => ({ isConfigPanelOpen: !state.isConfigPanelOpen })),
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
