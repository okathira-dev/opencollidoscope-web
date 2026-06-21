import { create } from "zustand";

export interface ChunkData {
  min: number;
  max: number;
  updatedAt: number;
}

interface WaveState {
  chunks: ChunkData[];
  chunkCount: number;
  initChunks: (count: number) => void;
  setChunk: (index: number, min: number, max: number) => void;
  clearChunks: () => void;
}

const useWaveStoreInternal = create<WaveState>((set) => ({
  chunks: [],
  chunkCount: 0,
  initChunks: (count) =>
    set({
      chunkCount: count,
      chunks: Array.from({ length: count }, () => ({
        min: 0,
        max: 0,
        updatedAt: 0,
      })),
    }),
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
    })),
}));

export function useWaveChunks(): ChunkData[] {
  return useWaveStoreInternal((state) => state.chunks);
}

export function useWaveChunkCount(): number {
  return useWaveStoreInternal((state) => state.chunkCount);
}

export function getWaveStoreState(): WaveState {
  return useWaveStoreInternal.getState();
}
