import { create } from "zustand";

import { getConfigState } from "./config-store.ts";

export interface ChunkData {
  min: number;
  max: number;
  updatedAt: number;
}

export type WaveSelection = { kind: "active"; start: number; size: number } | { kind: "empty" };

export function isWaveSelectionEmpty(selection: WaveSelection): selection is { kind: "empty" } {
  return selection.kind === "empty";
}

/**
 * 再生カーソル（白バー）の演出状態。
 * オリジナル Collidoscope の Cursor と同様、グレインの実際の読み取り位相ではなく
 * 選択開始位置から壁時計でスイープする視覚フィードバック用。
 */
export interface CursorState {
  startChunk: number;
  startTime: number;
}

interface WaveState {
  chunks: ChunkData[];
  chunkCount: number;
  selection: WaveSelection;
  cursors: Record<number, CursorState>;
  particleTriggerTick: number;
  initChunks: (count: number) => void;
  setChunk: (index: number, min: number, max: number) => void;
  setChunks: (chunks: ChunkData[]) => void;
  clearChunks: () => void;
  setSelection: (start: number, size: number) => void;
  clearSelection: () => void;
  clampSelectionToConfig: () => void;
  setCursor: (voiceId: number, startChunk: number, startTime: number) => void;
  removeCursor: (voiceId: number) => void;
  triggerParticleSpawn: () => void;
}

function createDefaultSelection(chunkCount: number, maxSelectionSize: number): WaveSelection {
  if (chunkCount <= 0) {
    return { kind: "empty" };
  }
  const size = Math.min(maxSelectionSize, chunkCount);
  return {
    kind: "active",
    start: 0,
    size: Math.max(1, size),
  };
}

const useWaveStoreInternal = create<WaveState>((set, get) => ({
  chunks: [],
  chunkCount: 0,
  selection: { kind: "empty" },
  cursors: {},
  particleTriggerTick: 0,

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

  setChunk: (index, min, max) => {
    if (index < 0 || index >= get().chunks.length) {
      return;
    }
    const existing = get().chunks[index];
    if (existing && existing.min === min && existing.max === max) {
      return;
    }
    set((state) => {
      const newChunk = { min, max, updatedAt: performance.now() };
      // Array.with() はエンジンネイティブ実装 (V8/JSC/SpiderMonkey) で最適化済み。
      // spread + index 代入と同じ O(n) だが単一 native call で完結する。
      return { chunks: state.chunks.with(index, newChunk) };
    });
  },

  setChunks: (chunks) => {
    set({ chunks });
  },

  clearChunks: () =>
    set((state) => ({
      chunks: state.chunks.map(() => ({ min: 0, max: 0, updatedAt: 0 })),
      selection: { kind: "empty" },
    })),

  setSelection: (start, size) => {
    const config = getConfigState().config;
    const chunkCount = get().chunkCount;
    const maxSize = Math.min(config.audio.maxSelectionSize, chunkCount);
    const clampedSize = Math.max(1, Math.min(size, maxSize));
    const maxStart = Math.max(0, chunkCount - clampedSize);
    const clampedStart = Math.max(0, Math.min(start, maxStart));
    const { selection: current } = get();

    const nextSelection: WaveSelection =
      chunkCount <= 0
        ? { kind: "empty" }
        : { kind: "active", start: clampedStart, size: clampedSize };

    if (
      current.kind === nextSelection.kind &&
      current.kind === "active" &&
      nextSelection.kind === "active" &&
      current.start === nextSelection.start &&
      current.size === nextSelection.size
    ) {
      return;
    }
    if (current.kind === "empty" && nextSelection.kind === "empty") {
      return;
    }

    set({ selection: nextSelection });
  },

  clearSelection: () =>
    set({
      selection: { kind: "empty" },
    }),

  clampSelectionToConfig: () => {
    const { selection } = get();
    if (selection.kind === "empty") {
      return;
    }
    get().setSelection(selection.start, selection.size);
  },

  setCursor: (voiceId, startChunk, startTime) =>
    set((state) => ({
      cursors: { ...state.cursors, [voiceId]: { startChunk, startTime } },
    })),

  removeCursor: (voiceId) =>
    set((state) => {
      const { [voiceId]: _, ...rest } = state.cursors;
      return { cursors: rest };
    }),

  triggerParticleSpawn: () =>
    set((state) => ({ particleTriggerTick: state.particleTriggerTick + 1 })),
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

export function useWaveSelectionIsNull(): boolean {
  return useWaveStoreInternal((state) => state.selection.kind === "empty");
}

export function subscribeWaveStore(
  listener: (state: WaveState, prev: WaveState) => void,
): () => void {
  return useWaveStoreInternal.subscribe(listener);
}

export function useSetWaveSelection() {
  return useWaveStoreInternal((state) => state.setSelection);
}

export function useWaveCursors(): Record<number, CursorState> {
  return useWaveStoreInternal((state) => state.cursors);
}

export function useParticleTriggerTick(): number {
  return useWaveStoreInternal((state) => state.particleTriggerTick);
}

export function getWaveStoreState(): WaveState {
  return useWaveStoreInternal.getState();
}

export function subscribeWaveSelection(listener: (selection: WaveSelection) => void): () => void {
  return useWaveStoreInternal.subscribe((state, prev) => {
    if (state.selection !== prev.selection) {
      listener(state.selection);
    }
  });
}
