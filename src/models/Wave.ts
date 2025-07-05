/**
 * Wave model based on the original Wave.h
 * Implements immutable data structures with functional programming patterns
 */

import {
  NUM_CHUNKS,
  MAX_SELECTION_NUM_CHUNKS,
  MAX_GRAIN_DURATION_COEFF,
} from "../constants/config";

import type {
  ChunkData,
  SelectionData,
  CursorData,
  WaveData,
  SynthID,
  ChunkIndex,
  PartialUpdate,
} from "../types";

// Chunk implementation
export const createEmptyChunk = (): ChunkData => ({
  top: 0,
  bottom: 0,
  isEmpty: true,
});

export const createChunk = (top: number, bottom: number): ChunkData => ({
  top: Math.max(-1, Math.min(1, top)),
  bottom: Math.max(-1, Math.min(1, bottom)),
  isEmpty: false,
});

export const updateChunk = (
  chunk: ChunkData,
  top: number,
  bottom: number,
): ChunkData => createChunk(top, bottom);

// Selection implementation
export const createNullSelection = (): SelectionData => ({
  start: 0,
  size: 0,
  particleSpread: 1.0,
  isNull: true,
});

export const createSelection = (
  start: number,
  size: number,
  particleSpread: number = 1.0,
): SelectionData => {
  const clampedStart = Math.max(0, Math.min(NUM_CHUNKS - 1, start));
  const maxSize = Math.min(MAX_SELECTION_NUM_CHUNKS, NUM_CHUNKS - clampedStart);
  const clampedSize = Math.max(1, Math.min(maxSize, size));
  const clampedSpread = Math.max(
    1.0,
    Math.min(MAX_GRAIN_DURATION_COEFF, particleSpread),
  );

  return {
    start: clampedStart,
    size: clampedSize,
    particleSpread: clampedSpread,
    isNull: false,
  };
};

export const updateSelection = (
  selection: SelectionData,
  updates: PartialUpdate<Omit<SelectionData, "isNull">>,
): SelectionData => {
  if (selection.isNull && !updates.start && !updates.size) {
    return selection;
  }

  return createSelection(
    updates.start ?? selection.start,
    updates.size ?? selection.size,
    updates.particleSpread ?? selection.particleSpread,
  );
};

export const getSelectionEnd = (selection: SelectionData): number => {
  if (selection.isNull) return 0;
  return selection.start + selection.size - 1;
};

export const isChunkInSelection = (
  chunkIndex: ChunkIndex,
  selection: SelectionData,
): boolean => {
  if (selection.isNull) return false;
  return (
    chunkIndex >= selection.start && chunkIndex <= getSelectionEnd(selection)
  );
};

// Cursor implementation
export const createCursor = (id: SynthID, position: number): CursorData => ({
  id,
  position: Math.max(0, Math.min(NUM_CHUNKS - 1, position)),
  lastUpdate: Date.now(),
});

export const updateCursor = (
  cursor: CursorData,
  position: number,
): CursorData => ({
  ...cursor,
  position: Math.max(0, Math.min(NUM_CHUNKS - 1, position)),
  lastUpdate: Date.now(),
});

export const isCursorExpired = (
  cursor: CursorData,
  maxAge: number = 5000,
): boolean => {
  return Date.now() - cursor.lastUpdate > maxAge;
};

// Wave implementation
export const createEmptyWave = (): WaveData => ({
  chunks: Array.from({ length: NUM_CHUNKS }, () => createEmptyChunk()),
  selection: createNullSelection(),
  cursors: [],
  filterCoeff: 1.0,
});

export const resetWave = (
  wave: WaveData,
  onlyChunks: boolean = false,
): WaveData => ({
  ...wave,
  chunks: Array.from({ length: NUM_CHUNKS }, () => createEmptyChunk()),
  selection: onlyChunks ? wave.selection : createNullSelection(),
  cursors: [],
});

export const setWaveChunk = (
  wave: WaveData,
  index: ChunkIndex,
  top: number,
  bottom: number,
): WaveData => {
  if (index < 0 || index >= NUM_CHUNKS) return wave;

  const newChunks = [...wave.chunks];
  newChunks[index] = createChunk(top, bottom);

  return {
    ...wave,
    chunks: newChunks,
  };
};

export const updateWaveSelection = (
  wave: WaveData,
  updates: PartialUpdate<Omit<SelectionData, "isNull">>,
): WaveData => ({
  ...wave,
  selection: updateSelection(wave.selection, updates),
});

export const setCursorPosition = (
  wave: WaveData,
  synthID: SynthID,
  position: number,
): WaveData => {
  const existingCursorIndex = wave.cursors.findIndex(
    (cursor) => cursor.id === synthID,
  );
  const newCursors = [...wave.cursors];

  if (existingCursorIndex >= 0) {
    const existingCursor = wave.cursors[existingCursorIndex];
    if (existingCursor) {
      newCursors[existingCursorIndex] = updateCursor(existingCursor, position);
    }
  } else {
    newCursors.push(createCursor(synthID, position));
  }

  return {
    ...wave,
    cursors: newCursors,
  };
};

export const removeCursor = (wave: WaveData, synthID: SynthID): WaveData => ({
  ...wave,
  cursors: wave.cursors.filter((cursor) => cursor.id !== synthID),
});

export const cleanupExpiredCursors = (
  wave: WaveData,
  maxAge: number = 5000,
): WaveData => ({
  ...wave,
  cursors: wave.cursors.filter((cursor) => !isCursorExpired(cursor, maxAge)),
});

export const setWaveFilterCoeff = (
  wave: WaveData,
  filterCoeff: number,
): WaveData => ({
  ...wave,
  filterCoeff: Math.max(0, Math.min(1, filterCoeff)),
});

// Utility functions
export const getWaveChunk = (
  wave: WaveData,
  index: ChunkIndex,
): ChunkData | null => {
  if (index < 0 || index >= wave.chunks.length) return null;
  return wave.chunks[index] ?? null;
};

export const getActiveCursors = (wave: WaveData): readonly CursorData[] =>
  wave.cursors.filter((cursor) => !isCursorExpired(cursor));

export const getSelectionChunks = (wave: WaveData): readonly ChunkData[] => {
  if (wave.selection.isNull) return [];

  const start = wave.selection.start;
  const end = getSelectionEnd(wave.selection);

  return wave.chunks.slice(start, end + 1);
};

// Selection manipulation helpers (based on original keyboard controls)
export const incrementSelectionSize = (wave: WaveData): WaveData => {
  if (wave.selection.isNull) {
    return updateWaveSelection(wave, { start: 0, size: 1 });
  }

  const newSize = wave.selection.size + 1;
  const maxSize = Math.min(
    MAX_SELECTION_NUM_CHUNKS,
    NUM_CHUNKS - wave.selection.start,
  );

  if (newSize <= maxSize) {
    return updateWaveSelection(wave, { size: newSize });
  }

  return wave;
};

export const decrementSelectionSize = (wave: WaveData): WaveData => {
  if (wave.selection.isNull || wave.selection.size <= 1) {
    return wave;
  }

  return updateWaveSelection(wave, { size: wave.selection.size - 1 });
};

export const incrementSelectionStart = (wave: WaveData): WaveData => {
  if (wave.selection.isNull) return wave;

  const newStart = wave.selection.start + 1;
  const maxStart = NUM_CHUNKS - wave.selection.size;

  if (newStart <= maxStart) {
    return updateWaveSelection(wave, { start: newStart });
  }

  return wave;
};

export const decrementSelectionStart = (wave: WaveData): WaveData => {
  if (wave.selection.isNull || wave.selection.start <= 0) {
    return wave;
  }

  return updateWaveSelection(wave, { start: wave.selection.start - 1 });
};

export const incrementParticleSpread = (wave: WaveData): WaveData => {
  if (wave.selection.isNull) return wave;

  const newSpread = Math.min(
    MAX_GRAIN_DURATION_COEFF,
    wave.selection.particleSpread + 1,
  );
  return updateWaveSelection(wave, { particleSpread: newSpread });
};

export const decrementParticleSpread = (wave: WaveData): WaveData => {
  if (wave.selection.isNull) return wave;

  const newSpread = Math.max(1.0, wave.selection.particleSpread - 1);
  return updateWaveSelection(wave, { particleSpread: newSpread });
};
