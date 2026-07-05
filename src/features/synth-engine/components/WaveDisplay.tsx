import { memo, useCallback, useEffect, useRef, useState } from "react";

import { MIDI_CC_MAX } from "../../../consts/midi.ts";
import { selectionAlphaFromFilter } from "../../../domain/audio/index.ts";
import { getAudioStoreState, subscribeRecordingStatus } from "../../../stores/audio-store.ts";
import {
  useConfigChunkCount,
  useConfigCursorColor,
  useConfigWaveLength,
} from "../../../stores/config-store.ts";
import { useAnalyserNode, useGrainDurationCoeff } from "../../../stores/synth-store.ts";
import {
  type ChunkData,
  type CursorState,
  getWaveStoreState,
  isWaveSelectionEmpty,
  subscribeWaveStore,
  useParticleTriggerTick,
  useSetWaveSelection,
  useWaveSelectionIsNull,
  type WaveSelection,
} from "../../../stores/wave-store.ts";
import { useSelectionWheel } from "../hooks/useSelectionWheel.ts";
import { ParticleSystem } from "../particle-system.ts";
import {
  createOscilloscopeBuffer,
  drawOscilloscope,
  isOscilloscopeSilent,
} from "./Oscilloscope.tsx";

const CHUNK_WIDTH = 7;
const CHUNK_STEP = 9;
const ANIMATION_FRAMES = 3;
const ANIMATION_FRAME_MS = 16;
const ANIMATION_SCALE_STEP = 0.15;
const KNOB_HIT_SLOP = 4;
const MAX_BAR_HEIGHT_RATIO = 3 / 10;
const KNOB_RADIUS = 8;
const OUT_OF_SELECTION_COLOR = "#808080";

/** カーソルインデックス計算用 — フレームごとに clear して再利用 */
const cursorIndexPool = new Set<number>();

interface WaveDisplayProps {
  color: string;
  filterCutoff?: number;
  height?: string | number;
  minHeight?: number;
}

interface RenderSnapshot {
  chunks: ChunkData[];
  selection: WaveSelection;
  cursors: Record<number, CursorState>;
  color: string;
  filterCutoff: number;
  chunkCount: number;
  cursorColor: string;
  secondsPerChunk: number;
  analyserNode: AnalyserNode | null;
}

function getAnimationScale(updatedAt: number, now: number): number {
  if (updatedAt <= 0) {
    return 1;
  }

  const elapsed = now - updatedAt;
  const frame = Math.floor(elapsed / ANIMATION_FRAME_MS);
  if (frame >= ANIMATION_FRAMES) {
    return 1;
  }

  return 1 + (ANIMATION_FRAMES - frame) * ANIMATION_SCALE_STEP;
}

function chunkIndexFromX(x: number): number {
  return Math.max(0, Math.floor(x / CHUNK_STEP));
}

function selectionKnobX(start: number): number {
  return start * CHUNK_STEP + CHUNK_WIDTH / 2;
}

function isPointerOverKnob(
  x: number,
  y: number,
  selection: WaveSelection,
  canvasHeight: number,
): boolean {
  if (isWaveSelectionEmpty(selection)) {
    return false;
  }
  const knobX = selectionKnobX(selection.start);
  const centerY = canvasHeight / 2;
  return Math.hypot(x - knobX, y - centerY) <= KNOB_RADIUS + KNOB_HIT_SLOP;
}

function selectionEndChunkIndex(selection: WaveSelection): number {
  if (isWaveSelectionEmpty(selection)) {
    return 0;
  }
  return selection.start + selection.size - 1;
}

function isInSelection(index: number, selection: WaveSelection): boolean {
  if (isWaveSelectionEmpty(selection)) {
    return false;
  }
  return index >= selection.start && index < selection.start + selection.size;
}

function colorWithAlpha(hexColor: string, alpha: number): string {
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(clampedAlpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hexColor}${alphaHex}`;
}

function computeCursorIndices(
  cursors: Record<number, CursorState>,
  selection: WaveSelection,
  now: number,
  secondsPerChunk: number,
): Set<number> {
  cursorIndexPool.clear();
  if (isWaveSelectionEmpty(selection)) {
    return cursorIndexPool;
  }

  const selectionEnd = selection.start + selection.size - 1;
  const msPerChunk = secondsPerChunk * 1000;

  for (const cursor of Object.values(cursors)) {
    const elapsed = now - cursor.startTime;
    const pos = cursor.startChunk + Math.floor(elapsed / msPerChunk);
    if (pos <= selectionEnd) {
      cursorIndexPool.add(pos);
    }
  }

  return cursorIndexPool;
}

function drawSelectionBars(
  ctx: CanvasRenderingContext2D,
  selection: WaveSelection,
  color: string,
  height: number,
): void {
  if (isWaveSelectionEmpty(selection)) {
    return;
  }

  const barColor = colorWithAlpha(color, 0.5);
  const startBarX = selection.start * CHUNK_STEP;
  ctx.fillStyle = barColor;
  ctx.fillRect(startBarX, 0, CHUNK_WIDTH, height);

  const endBarX = selectionEndChunkIndex(selection) * CHUNK_STEP;
  ctx.fillRect(endBarX, 0, CHUNK_WIDTH, height);

  const knobX = selectionKnobX(selection.start);
  const centerY = height / 2;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(knobX, centerY, KNOB_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(knobX, centerY, KNOB_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
}

function hasActiveChunkAnimation(chunks: ChunkData[], now: number): boolean {
  const maxAge = ANIMATION_FRAMES * ANIMATION_FRAME_MS;
  for (const chunk of chunks) {
    if (chunk.updatedAt > 0 && now - chunk.updatedAt < maxAge) {
      return true;
    }
  }
  return false;
}

function drawChunks(
  ctx: CanvasRenderingContext2D,
  snapshot: RenderSnapshot,
  width: number,
  height: number,
  now: number,
  oscilloscopeBuffer: Uint8Array<ArrayBuffer> | null,
  particleSystem: ParticleSystem,
): void {
  const {
    chunks,
    selection,
    color,
    filterCutoff,
    cursors,
    cursorColor,
    secondsPerChunk,
    analyserNode,
  } = snapshot;
  const centerY = height / 2;
  const maxBarHeight = height * MAX_BAR_HEIGHT_RATIO;
  const cursorIndices = computeCursorIndices(cursors, selection, now, secondsPerChunk);
  const selectionAlpha = selectionAlphaFromFilter(filterCutoff);
  const selectionFillStyle = colorWithAlpha(color, selectionAlpha);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();

  if (analyserNode && oscilloscopeBuffer) {
    drawOscilloscope(ctx, analyserNode, width, height, oscilloscopeBuffer);
  }

  particleSystem.draw(ctx, cursorColor);

  drawSelectionBars(ctx, selection, color, height);

  // perf: 150 chunks × 60fps。fillStyle/fillRect の JS→レンダリングエンジン境界が
  // ボトルネック。ループ方式の差は数μs 以下で無意味。
  // early break で画面外チャンクをスキップするため forEach は使用不可。
  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index];
    if (!chunk) {
      continue;
    }

    const x = index * CHUNK_STEP;
    if (x > width) {
      break;
    }

    const scale = getAnimationScale(chunk.updatedAt, now);
    const topY = centerY - chunk.max * maxBarHeight * scale;
    const bottomY = centerY - chunk.min * maxBarHeight * scale;
    const barHeight = Math.max(bottomY - topY, 1);

    if (cursorIndices.has(index)) {
      ctx.fillStyle = cursorColor;
    } else if (isInSelection(index, selection)) {
      ctx.fillStyle = selectionFillStyle;
    } else {
      ctx.fillStyle = OUT_OF_SELECTION_COLOR;
    }

    ctx.fillRect(x, topY, CHUNK_WIDTH, barHeight);
  }
}

function WaveDisplayComponent({
  color,
  filterCutoff = MIDI_CC_MAX,
  height = "40vh",
  minHeight = 200,
}: WaveDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const oscilloscopeBufferRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem());
  const snapshotRef = useRef<RenderSnapshot>({
    chunks: [],
    selection: { kind: "empty" },
    cursors: {},
    color,
    filterCutoff,
    chunkCount: 150,
    cursorColor: "#FFFFFF",
    secondsPerChunk: 2 / 150,
    analyserNode: null,
  });
  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetChunksRef = useRef(0);
  const isRecordingRef = useRef(false);

  const selectionIsNull = useWaveSelectionIsNull();
  const particleTriggerTick = useParticleTriggerTick();
  const grainDurationCoeff = useGrainDurationCoeff();
  const setSelection = useSetWaveSelection();
  const chunkCount = useConfigChunkCount();
  const waveLength = useConfigWaveLength();
  const cursorColor = useConfigCursorColor();
  const analyserNode = useAnalyserNode();
  const [isDragging, setIsDragging] = useState(false);

  useSelectionWheel(canvasRef, setSelection, !selectionIsNull);

  // 描画スナップショット ref を同期
  useEffect(() => {
    snapshotRef.current.color = color;
    snapshotRef.current.filterCutoff = filterCutoff;
    snapshotRef.current.chunkCount = chunkCount;
    snapshotRef.current.cursorColor = cursorColor;
    snapshotRef.current.secondsPerChunk = waveLength / chunkCount;
    snapshotRef.current.analyserNode = analyserNode;
  }, [color, filterCutoff, chunkCount, cursorColor, waveLength, analyserNode]);

  useEffect(() => {
    if (analyserNode) {
      oscilloscopeBufferRef.current = createOscilloscopeBuffer(analyserNode);
    } else {
      oscilloscopeBufferRef.current = null;
    }
    snapshotRef.current.analyserNode = analyserNode;
  }, [analyserNode]);

  const ensureRafRunning = useCallback(() => {
    if (animationFrameRef.current !== null) {
      return;
    }

    const renderFrame = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameRef.current = null;
        return;
      }

      if (!ctxRef.current) {
        ctxRef.current = canvas.getContext("2d");
      }
      const ctx = ctxRef.current;
      if (!ctx) {
        animationFrameRef.current = null;
        return;
      }

      const snapshot = snapshotRef.current;
      const width = snapshot.chunkCount * CHUNK_STEP + CHUNK_WIDTH;
      const canvasHeight = canvas.clientHeight;

      if (canvas.width !== width || canvas.height !== canvasHeight) {
        canvas.width = width;
        canvas.height = canvasHeight;
        ctxRef.current = canvas.getContext("2d");
      }
      const drawCtx = ctxRef.current;
      if (!drawCtx) {
        animationFrameRef.current = null;
        return;
      }

      const now = performance.now();
      particleSystemRef.current.update();

      drawChunks(
        drawCtx,
        snapshot,
        width,
        canvasHeight,
        now,
        oscilloscopeBufferRef.current,
        particleSystemRef.current,
      );

      const hasCursors = Object.keys(snapshot.cursors).length > 0;
      const hasParticles = particleSystemRef.current.getActiveCount() > 0;
      const hasChunkAnim = hasActiveChunkAnimation(snapshot.chunks, now);
      const analyser = snapshot.analyserNode;
      const oscBuffer = oscilloscopeBufferRef.current;
      const hasSignal = analyser && oscBuffer ? !isOscilloscopeSilent(analyser, oscBuffer) : false;

      if (
        !isDraggingRef.current &&
        !isRecordingRef.current &&
        !hasCursors &&
        !hasParticles &&
        !hasChunkAnim &&
        !hasSignal
      ) {
        animationFrameRef.current = null;
        return;
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, []);

  // wave-store / audio-store 購読 — React 再レンダリングなしで ref 更新 + rAF 再開
  useEffect(() => {
    const waveState = getWaveStoreState();
    snapshotRef.current.chunks = waveState.chunks;
    snapshotRef.current.selection = waveState.selection;
    snapshotRef.current.cursors = waveState.cursors;

    const unsubscribeWave = subscribeWaveStore((state) => {
      snapshotRef.current.chunks = state.chunks;
      snapshotRef.current.selection = state.selection;
      snapshotRef.current.cursors = state.cursors;
      ensureRafRunning();
    });

    isRecordingRef.current = getAudioStoreState().isRecording;
    const unsubscribeRecording = subscribeRecordingStatus((recording) => {
      isRecordingRef.current = recording;
      if (recording) {
        ensureRafRunning();
      }
    });

    ensureRafRunning();

    const canvas = canvasRef.current;
    const resizeObserver =
      canvas &&
      new ResizeObserver(() => {
        ensureRafRunning();
      });
    if (canvas && resizeObserver) {
      resizeObserver.observe(canvas);
    }

    return () => {
      unsubscribeWave();
      unsubscribeRecording();
      resizeObserver?.disconnect();
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [ensureRafRunning]);

  // パーティクル発火 — selection は store から都度取得（ドラッグ中の誤発火防止）
  useEffect(() => {
    if (particleTriggerTick === 0) {
      return;
    }
    const currentSelection = getWaveStoreState().selection;
    if (isWaveSelectionEmpty(currentSelection) || grainDurationCoeff <= 1) {
      return;
    }

    const canvas = canvasRef.current;
    const canvasHeight = canvas?.clientHeight ?? minHeight;
    const selectionEnd = currentSelection.start + currentSelection.size - 1;

    particleSystemRef.current.addParticles(
      {
        particleSpread: grainDurationCoeff,
        filterCoeff: filterCutoff / MIDI_CC_MAX,
        selectionStart: currentSelection.start,
        selectionEnd,
        canvasHeight,
      },
      CHUNK_STEP,
      CHUNK_WIDTH,
    );
    ensureRafRunning();
  }, [particleTriggerTick, grainDurationCoeff, filterCutoff, minHeight, ensureRafRunning]);

  const clampStart = useCallback(
    (start: number) => {
      const maxStart = Math.max(0, chunkCount - 1);
      return Math.max(0, Math.min(start, maxStart));
    },
    [chunkCount],
  );

  const updateStartFromPointer = useCallback(
    (clientX: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const x = (clientX - rect.left) * scaleX;
      const chunkIndex = chunkIndexFromX(x);
      const currentSelection = snapshotRef.current.selection;
      if (isWaveSelectionEmpty(currentSelection)) {
        return;
      }

      const newStart = clampStart(chunkIndex + dragOffsetChunksRef.current);
      setSelection(newStart, currentSelection.size);
    },
    [clampStart, setSelection],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const currentSelection = snapshotRef.current.selection;
      if (isWaveSelectionEmpty(currentSelection)) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      const chunkIndex = chunkIndexFromX(x);

      dragOffsetChunksRef.current = currentSelection.start - chunkIndex;
      isDraggingRef.current = true;
      setIsDragging(true);
      canvas.setPointerCapture(event.pointerId);
      ensureRafRunning();

      if (!isPointerOverKnob(x, y, currentSelection, canvas.height)) {
        dragOffsetChunksRef.current = 0;
        setSelection(clampStart(chunkIndex), currentSelection.size);
      }
    },
    [clampStart, setSelection, ensureRafRunning],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDraggingRef.current) {
        return;
      }
      updateStartFromPointer(event.clientX);
    },
    [updateStartFromPointer],
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      canvasRef.current?.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-label="波形表示"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: "100%",
        height,
        minHeight,
        flex: height === "100%" ? 1 : undefined,
        display: "block",
        backgroundColor: "#000000",
        cursor: isDragging ? "grabbing" : selectionIsNull ? "default" : "grab",
        touchAction: "none",
      }}
    />
  );
}

export const WaveDisplay = memo(WaveDisplayComponent);
