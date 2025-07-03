/**
 * WaveformDisplay.tsx - Waveform visualization and selection React component
 * Based on the original OpenCollidoscope waveform display
 */

import { useRef, useEffect, useCallback } from "react";

import type { WaveformDisplayProps } from "../../../types/audio";
import type React from "react";

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  audioBuffer,
  selectionStart,
  selectionSize,
  onSelectionChange,
}) => {
  // Type guard for audioBuffer
  const isValidAudioBuffer = (buffer: unknown): buffer is AudioBuffer => {
    return buffer instanceof AudioBuffer;
  };

  // Safe wrapper for onSelectionChange
  const safeOnSelectionChange = useCallback(
    (start: number, size: number) => {
      if (
        typeof onSelectionChange === "function" &&
        typeof start === "number" &&
        typeof size === "number" &&
        !isNaN(start) &&
        !isNaN(size)
      ) {
        (onSelectionChange as (start: number, size: number) => void)(
          start,
          size,
        );
      }
    },
    [onSelectionChange],
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const dragType = useRef<"move" | "resize-start" | "resize-end" | null>(null);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer || !isValidAudioBuffer(audioBuffer)) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    const channelData = audioBuffer.getChannelData(0);
    if (!channelData) return;

    const samplesPerPixel = channelData.length / width;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    ctx.strokeStyle = "#4a9eff";
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const sampleIndex = Math.floor(x * samplesPerPixel);
      const sample =
        channelData && channelData[sampleIndex] ? channelData[sampleIndex] : 0;
      const y = height / 2 + (sample * height) / 2;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw selection
    if (
      selectionStart >= 0 &&
      selectionSize > 0 &&
      isValidAudioBuffer(audioBuffer) &&
      audioBuffer.duration
    ) {
      const selectionStartX = (selectionStart / audioBuffer.duration) * width;
      const selectionWidth = (selectionSize / audioBuffer.duration) * width;

      // Selection background
      ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
      ctx.fillRect(selectionStartX, 0, selectionWidth, height);

      // Selection borders
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(selectionStartX, 0);
      ctx.lineTo(selectionStartX, height);
      ctx.moveTo(selectionStartX + selectionWidth, 0);
      ctx.lineTo(selectionStartX + selectionWidth, height);
      ctx.stroke();
    }
  }, [audioBuffer, selectionStart, selectionSize]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !audioBuffer || !isValidAudioBuffer(audioBuffer)) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const time = audioBuffer.duration
        ? (x / canvas.width) * audioBuffer.duration
        : 0;

      const selectionStartX = audioBuffer.duration
        ? (selectionStart / audioBuffer.duration) * canvas.width
        : 0;
      const selectionEndX = audioBuffer.duration
        ? selectionStartX +
          (selectionSize / audioBuffer.duration) * canvas.width
        : 0;

      const EDGE_TOLERANCE = 5;

      // Check if near selection edges
      if (Math.abs(x - selectionStartX) < EDGE_TOLERANCE) {
        dragType.current = "resize-start";
      } else if (Math.abs(x - selectionEndX) < EDGE_TOLERANCE) {
        dragType.current = "resize-end";
      } else if (x >= selectionStartX && x <= selectionEndX) {
        dragType.current = "move";
      } else {
        // Create new selection
        safeOnSelectionChange(time, 0.1); // Default 100ms selection
        return;
      }

      isDragging.current = true;
    },
    [audioBuffer, selectionStart, selectionSize, safeOnSelectionChange],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (
        !canvas ||
        !audioBuffer ||
        !isValidAudioBuffer(audioBuffer) ||
        !isDragging.current
      )
        return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const time = audioBuffer.duration
        ? (x / canvas.width) * audioBuffer.duration
        : 0;

      switch (dragType.current) {
        case "move": {
          const clampedTime = audioBuffer.duration
            ? Math.max(0, Math.min(time, audioBuffer.duration - selectionSize))
            : 0;
          safeOnSelectionChange(clampedTime, selectionSize);
          break;
        }
        case "resize-start": {
          const newStart = Math.max(
            0,
            Math.min(time, selectionStart + selectionSize - 0.01),
          );
          const newSize = selectionStart + selectionSize - newStart;
          safeOnSelectionChange(newStart, newSize);
          break;
        }
        case "resize-end": {
          const newSize = audioBuffer.duration
            ? Math.max(
                0.01,
                Math.min(
                  time - selectionStart,
                  audioBuffer.duration - selectionStart,
                ),
              )
            : 0.01;
          safeOnSelectionChange(selectionStart, newSize);
          break;
        }
      }
    },
    [audioBuffer, selectionStart, selectionSize, safeOnSelectionChange],
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    dragType.current = null;
  }, []);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
      dragType.current = null;
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return (
    <div className="waveform-display">
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        style={{
          border: "1px solid #333",
          cursor: "crosshair",
          backgroundColor: "#1a1a1a",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default WaveformDisplay;
