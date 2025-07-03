/**
 * Oscilloscope.tsx - Real-time audio visualization React component
 * Based on the original OpenCollidoscope oscilloscope display
 */

import { useRef, useEffect, useCallback } from "react";

import type { OscilloscopeProps } from "../../../types/audio";
import type React from "react";

const Oscilloscope: React.FC<OscilloscopeProps> = ({ analyser, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Type guard for analyser
  const isValidAnalyser = (node: unknown): node is AnalyserNode => {
    return node instanceof AnalyserNode;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser || !isValidAnalyser(analyser) || !isActive) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;

    // Get time domain data for oscilloscope view
    const bufferLength = analyser.frequencyBinCount;
    if (!bufferLength) return;

    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, width, height);

    // Set up drawing style
    ctx.shadowColor = "#4a9eff";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "#4a9eff";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;

    ctx.beginPath();

    // Calculate step size for drawing
    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = (dataArray[i] || 0) / 128.0; // Convert to 0-2 range
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();

    // Reset glow effect
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;

    // Get frequency data for peaks
    const freqData = new Uint8Array(bufferLength);
    if (isValidAnalyser(analyser)) {
      analyser.getByteFrequencyData(freqData);
    }

    // Calculate and display peak level
    let peak = 0;
    for (let i = 0; i < freqData.length; i++) {
      const value = freqData[i] || 0;
      if (value > peak) {
        peak = value;
      }
    }

    // Draw peak indicator
    const peakHeight = (peak / 255) * height;
    ctx.fillStyle = "#ff4444";
    ctx.fillRect(width - 20, height - peakHeight, 10, peakHeight);

    // Continue animation
    if (isActive) {
      animationRef.current = requestAnimationFrame(draw);
    }
  }, [analyser, isActive]);

  useEffect(() => {
    if (isActive && analyser) {
      draw();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw, isActive, analyser]);

  // Clear canvas when not active
  useEffect(() => {
    if (!isActive) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [isActive]);

  return (
    <div className="oscilloscope">
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        style={{
          border: "1px solid #333",
          backgroundColor: "#1a1a1a",
          borderRadius: "4px",
        }}
      />
      <div className="oscilloscope-status">
        Status: {isActive ? "Active" : "Inactive"}
      </div>
    </div>
  );
};

export default Oscilloscope;
