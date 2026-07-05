import { useCallback, useEffect, useRef, useState } from "react";

import { selectionAlphaFromFilter } from "../../../domain/audio/index.ts";
import { useConfig } from "../../../stores/config-store.ts";
import { useAnalyserNode, useGrainDurationCoeff } from "../../../stores/synth-store.ts";
import {
  type ChunkData,
  type CursorState,
  useParticleTriggerTick,
  useSetWaveSelection,
  useWaveChunks,
  useWaveCursors,
  useWaveSelection,
  type WaveSelection,
} from "../../../stores/wave-store.ts";
import { useSelectionWheel } from "../hooks/useSelectionWheel.ts";
import { ParticleSystem } from "../particle-system.ts";
import { createOscilloscopeBuffer, drawOscilloscope } from "./Oscilloscope.tsx";

const CHUNK_WIDTH = 7;
const CHUNK_STEP = 9;
const ANIMATION_FRAMES = 3;
const ANIMATION_FRAME_MS = 16;
const KNOB_RADIUS = 8;
const OUT_OF_SELECTION_COLOR = "#808080";

interface WaveDisplayProps {
  color: string;
  filterCutoff?: number;
  height?: string | number;
  minHeight?: number;
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

  return 1 + (ANIMATION_FRAMES - frame) * 0.15;
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
  const knobX = selectionKnobX(selection.start);
  const centerY = canvasHeight / 2;
  return Math.hypot(x - knobX, y - centerY) <= KNOB_RADIUS + 4;
}

function selectionEndChunkIndex(selection: WaveSelection): number {
  return selection.start + selection.size - 1;
}

function isInSelection(index: number, selection: WaveSelection): boolean {
  if (selection.isNull) {
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

/**
 * 各ボイスのカーソルを現在のチャンクインデックスに変換する。
 * 壁時計と secondsPerChunk (= waveLength / chunkCount) で進行し、
 * MIDI ノートの再生レート (ピッチ) には連動しない演出用の位置。
 */
function computeCursorIndices(
  cursors: Record<number, CursorState>,
  selection: WaveSelection,
  now: number,
  secondsPerChunk: number,
): Set<number> {
  const indices = new Set<number>();
  if (selection.isNull) {
    return indices;
  }

  const selectionEnd = selection.start + selection.size - 1;
  const msPerChunk = secondsPerChunk * 1000;

  for (const cursor of Object.values(cursors)) {
    const elapsed = now - cursor.startTime;
    const pos = cursor.startChunk + Math.floor(elapsed / msPerChunk);
    if (pos <= selectionEnd) {
      indices.add(pos);
    }
  }

  return indices;
}

function drawSelectionBars(
  ctx: CanvasRenderingContext2D,
  selection: WaveSelection,
  color: string,
  height: number,
): void {
  if (selection.isNull) {
    return;
  }

  const startBarX = selection.start * CHUNK_STEP;
  ctx.fillStyle = colorWithAlpha(color, 0.5);
  ctx.fillRect(startBarX, 0, CHUNK_WIDTH, height);

  const endBarX = selectionEndChunkIndex(selection) * CHUNK_STEP;
  ctx.fillStyle = colorWithAlpha(color, 0.5);
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

function drawChunks(
  ctx: CanvasRenderingContext2D,
  chunks: ChunkData[],
  selection: WaveSelection,
  color: string,
  width: number,
  height: number,
  now: number,
  filterCutoff: number,
  cursors: Record<number, CursorState>,
  cursorColor: string,
  secondsPerChunk: number,
  analyser: AnalyserNode | null,
  oscilloscopeBuffer: Uint8Array<ArrayBuffer> | null,
  particleSystem: ParticleSystem,
): void {
  const centerY = height / 2;
  const maxBarHeight = (height * 3) / 5 / 2;
  const cursorIndices = computeCursorIndices(cursors, selection, now, secondsPerChunk);
  const selectionAlpha = selectionAlphaFromFilter(filterCutoff);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();

  if (analyser && oscilloscopeBuffer) {
    drawOscilloscope(ctx, analyser, width, height, oscilloscopeBuffer);
  }

  particleSystem.draw(ctx, cursorColor);

  drawSelectionBars(ctx, selection, color, height);

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
      ctx.fillStyle = colorWithAlpha(color, selectionAlpha);
    } else {
      ctx.fillStyle = OUT_OF_SELECTION_COLOR;
    }

    ctx.fillRect(x, topY, CHUNK_WIDTH, barHeight);
  }
}

export function WaveDisplay({
  color,
  filterCutoff = 127,
  height = "40vh",
  minHeight = 200,
}: WaveDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const oscilloscopeBufferRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem());
  const chunks = useWaveChunks();
  const selection = useWaveSelection();
  const cursors = useWaveCursors();
  const particleTriggerTick = useParticleTriggerTick();
  const grainDurationCoeff = useGrainDurationCoeff();
  const setSelection = useSetWaveSelection();
  const config = useConfig();
  const analyserNode = useAnalyserNode();
  const secondsPerChunk = config.audio.waveLength / config.audio.chunkCount;
  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetChunksRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useSelectionWheel(canvasRef, selection, setSelection, !selection.isNull);

  useEffect(() => {
    if (particleTriggerTick === 0) {
      return;
    }
    if (selection.isNull || grainDurationCoeff <= 1) {
      return;
    }

    const canvas = canvasRef.current;
    const canvasHeight = canvas?.clientHeight ?? minHeight;
    const selectionEnd = selection.start + selection.size - 1;

    particleSystemRef.current.addParticles(
      {
        particleSpread: grainDurationCoeff,
        filterCoeff: filterCutoff / 127,
        selectionStart: selection.start,
        selectionEnd,
        canvasHeight,
      },
      CHUNK_STEP,
      CHUNK_WIDTH,
    );
  }, [particleTriggerTick, grainDurationCoeff, selection, filterCutoff, minHeight]);

  useEffect(() => {
    if (analyserNode) {
      oscilloscopeBufferRef.current = createOscilloscopeBuffer(analyserNode);
    } else {
      oscilloscopeBufferRef.current = null;
    }
  }, [analyserNode]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const width = config.audio.chunkCount * CHUNK_STEP + CHUNK_WIDTH;
    const canvasHeight = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== canvasHeight) {
      canvas.width = width;
      canvas.height = canvasHeight;
    }

    particleSystemRef.current.update();

    drawChunks(
      ctx,
      chunks,
      selection,
      color,
      width,
      canvasHeight,
      performance.now(),
      filterCutoff,
      cursors,
      config.visual.colors.cursor,
      secondsPerChunk,
      analyserNode,
      oscilloscopeBufferRef.current,
      particleSystemRef.current,
    );
    // オシロスコープ・カーソルスイープ・パーティクルのため常時 rAF。静止時のみ停止する最適化は将来検討。
    animationFrameRef.current = requestAnimationFrame(render);
  }, [
    chunks,
    selection,
    color,
    config.audio.chunkCount,
    config.visual.colors.cursor,
    filterCutoff,
    cursors,
    analyserNode,
    secondsPerChunk,
  ]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  const clampStart = useCallback(
    (start: number) => {
      const maxStart = Math.max(0, config.audio.chunkCount - 1);
      return Math.max(0, Math.min(start, maxStart));
    },
    [config.audio.chunkCount],
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
      const newStart = clampStart(chunkIndex + dragOffsetChunksRef.current);
      setSelection(newStart, selection.size);
    },
    [clampStart, selection.size, setSelection],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (selection.isNull) {
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

      dragOffsetChunksRef.current = selection.start - chunkIndex;
      isDraggingRef.current = true;
      setIsDragging(true);
      canvas.setPointerCapture(event.pointerId);

      if (!isPointerOverKnob(x, y, selection, canvas.height)) {
        dragOffsetChunksRef.current = 0;
        setSelection(clampStart(chunkIndex), selection.size);
      }
    },
    [clampStart, selection, setSelection],
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
        display: "block",
        backgroundColor: "#000000",
        cursor: isDragging ? "grabbing" : selection.isNull ? "default" : "grab",
        touchAction: "none",
      }}
    />
  );
}
