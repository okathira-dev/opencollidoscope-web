import { create } from "zustand";

import {
  DEFAULT_SELECTION_START,
  DEFAULT_SELECTION_SIZE,
  DEFAULT_GRAIN_DURATION,
  MAX_FILTER_CUTOFF_FREQ,
} from "../constants/config";

interface SynthState {
  selectionStart: number;
  selectionSize: number;
  grainDuration: number;
  filterCutoff: number;
  loop: boolean;
  setSelectionStart: (start: number) => void;
  setSelectionSize: (size: number) => void;
  setGrainDuration: (duration: number) => void;
  setFilterCutoff: (cutoff: number) => void;
  toggleLoop: () => void;
}

export const useSynthStore = create<SynthState>((set) => ({
  selectionStart: DEFAULT_SELECTION_START,
  selectionSize: DEFAULT_SELECTION_SIZE,
  grainDuration: DEFAULT_GRAIN_DURATION,
  filterCutoff: MAX_FILTER_CUTOFF_FREQ,
  loop: false,
  setSelectionStart: (start) => set({ selectionStart: start }),
  setSelectionSize: (size) => set({ selectionSize: size }),
  setGrainDuration: (duration) => set({ grainDuration: duration }),
  setFilterCutoff: (cutoff) => set({ filterCutoff: cutoff }),
  toggleLoop: () => set((state) => ({ loop: !state.loop })),
}));
