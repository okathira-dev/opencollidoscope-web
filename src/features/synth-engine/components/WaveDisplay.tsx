import { useCallback, useEffect, useRef } from "react";

import { useConfig } from "../../../stores/config-store.ts";
import { type ChunkData, useWaveChunks } from "../../../stores/wave-store.ts";

const CHUNK_WIDTH = 7;
const CHUNK_STEP = 9;
const ANIMATION_FRAMES = 3;
const ANIMATION_FRAME_MS = 16;

interface WaveDisplayProps {
  color: string;
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

function drawChunks(
  ctx: CanvasRenderingContext2D,
  chunks: ChunkData[],
  color: string,
  width: number,
  height: number,
  now: number,
): void {
  const centerY = height / 2;
  const maxBarHeight = (height * 3) / 5 / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();

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

    ctx.fillStyle = color;
    ctx.fillRect(x, topY, CHUNK_WIDTH, barHeight);
  }
}

export function WaveDisplay({ color }: WaveDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chunks = useWaveChunks();
  const config = useConfig();
  const animationFrameRef = useRef<number | null>(null);

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
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    drawChunks(ctx, chunks, color, width, height, performance.now());
    animationFrameRef.current = requestAnimationFrame(render);
  }, [chunks, color, config.audio.chunkCount]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="波形表示"
      style={{
        width: "100%",
        height: "40vh",
        minHeight: 200,
        display: "block",
        backgroundColor: "#000000",
      }}
    />
  );
}
