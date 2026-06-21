import { create } from "zustand";

import { getConfigState } from "./config-store.ts";

export interface ChunkData {
  min: number;
  max: number;
  updatedAt: number;
}

export interface WaveSelection {
  start: number;
  size: number;
  isNull: boolean;
}

interface WaveState {
  chunks: ChunkData[];
  chunkCount: number;
  selection: WaveSelection;
  initChunks: (count: number) => void;
  setChunk: (index: number, min: number, max: number) => void;
  clearChunks: () => void;
  setSelection: (start: number, size: number) => void;
  clearSelection: () => void;
  clampSelectionToConfig: () => void;
}

function createDefaultSelection(chunkCount: number, maxSelectionSize: number): WaveSelection {
  const size = Math.min(maxSelectionSize, chunkCount);
  return {
    start: 0,
    size: Math.max(1, size),
    isNull: chunkCount <= 0,
  };
}

const useWaveStoreInternal = create<WaveState>((set, get) => ({
  chunks: [],
  chunkCount: 0,
  selection: { start: 0, size: 1, isNull: true },

  initChunks: (count) => {
    const maxSelectionSize = getConfigState().config.audio.maxSelectionSize;
    set({
      chunkCount: count,
      chunks: Array.from({ length: count }, () => ({
        min: 0,
        max: 0,
        updatedAt: 0,
      })),
      selection: createDefaultSelection(count, maxSelectionSize),
    });
  },

  setChunk: (index, min, max) =>
    set((state) => {
      const chunks = [...state.chunks];
      if (index < 0 || index >= chunks.length) {
        return state;
      }
      chunks[index] = { min, max, updatedAt: performance.now() };
      return { chunks };
    }),

  clearChunks: () =>
    set((state) => ({
      chunks: state.chunks.map(() => ({ min: 0, max: 0, updatedAt: 0 })),
      selection: { ...state.selection, isNull: true },
    })),

  setSelection: (start, size) => {
    const config = getConfigState().config;
    const chunkCount = get().chunkCount;
    const maxSize = Math.min(config.audio.maxSelectionSize, chunkCount);
    const clampedStart = Math.max(0, Math.min(start, Math.max(0, chunkCount - 1)));
    const clampedSize = Math.max(1, Math.min(size, maxSize));

    set({
      selection: {
        start: clampedStart,
        size: clampedSize,
        isNull: chunkCount <= 0,
      },
    });
  },

  clearSelection: () =>
    set({
      selection: { start: 0, size: 1, isNull: true },
    }),

  clampSelectionToConfig: () => {
    const { selection } = get();
    if (selection.isNull) {
      return;
    }
    get().setSelection(selection.start, selection.size);
  },
}));

export function useWaveChunks(): ChunkData[] {
  return useWaveStoreInternal((state) => state.chunks);
}

export function useWaveChunkCount(): number {
  return useWaveStoreInternal((state) => state.chunkCount);
}

export function useWaveSelection(): WaveSelection {
  return useWaveStoreInternal((state) => state.selection);
}

export function useSetWaveSelection() {
  return useWaveStoreInternal((state) => state.setSelection);
}

export function getWaveStoreState(): WaveState {
  return useWaveStoreInternal.getState();
}

export function subscribeWaveSelection(listener: (selection: WaveSelection) => void): () => void {
  return useWaveStoreInternal.subscribe((state, prev) => {
    const current = state.selection;
    const previous = prev.selection;
    if (
      current.start !== previous.start ||
      current.size !== previous.size ||
      current.isNull !== previous.isNull
    ) {
      listener(current);
    }
  });
}
