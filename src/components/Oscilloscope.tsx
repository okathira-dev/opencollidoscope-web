/**
 * Oscilloscope.tsx - Real-time audio visualization React component
 * Based on the original OpenCollidoscope oscilloscope display
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { OscilloscopeProps } from '../types/ui';

export const Oscilloscope: React.FC<OscilloscopeProps> = ({
  analyserNode,
  width = 400,
  height = 200,
  glowEffect = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size accounting for device pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Get audio data
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteTimeDomainData(dataArray);

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    drawGrid(ctx, width, height);

    // Draw waveform
    drawWaveform(ctx, dataArray, width, height, glowEffect);

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(draw);
  }, [analyserNode, width, height, glowEffect]);

  const drawGrid = useCallback((
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) => {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      const x = (w / 10) * i;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }

    // Horizontal lines
    for (let i = 0; i <= 6; i++) {
      const y = (h / 6) * i;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }

    ctx.stroke();

    // Center line (0V reference)
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
  }, []);

  const drawWaveform = useCallback((
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    w: number,
    h: number,
    glow: boolean
  ) => {
    const centerY = h / 2;
    const amplitude = h * 0.4;

    // Setup line style
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (glow) {
      // Draw glow effect
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#00ff88';
    } else {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#00ff88';
    }

    ctx.beginPath();

    // Calculate step size for sampling
    const sliceWidth = w / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      // Convert byte value (0-255) to normalized value (-1 to 1)
      const normalizedValue = (dataArray[i] - 128) / 128;
      const y = centerY + (normalizedValue * amplitude);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();

    // Reset shadow for other drawings
    ctx.shadowBlur = 0;

    // Draw peak indicators
    drawPeakIndicators(ctx, dataArray, w, h);
  }, []);

  const drawPeakIndicators = useCallback((
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    w: number,
    h: number
  ) => {
    // Find peak values
    let maxPeak = 0;
    let minPeak = 255;

    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxPeak) maxPeak = dataArray[i];
      if (dataArray[i] < minPeak) minPeak = dataArray[i];
    }

    // Convert to normalized values
    const maxNormalized = (maxPeak - 128) / 128;
    const minNormalized = (minPeak - 128) / 128;

    const centerY = h / 2;
    const amplitude = h * 0.4;

    // Draw peak lines
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    
    if (Math.abs(maxNormalized) > 0.1) {
      const maxY = centerY + (maxNormalized * amplitude);
      ctx.moveTo(0, maxY);
      ctx.lineTo(w, maxY);
    }
    
    if (Math.abs(minNormalized) > 0.1) {
      const minY = centerY + (minNormalized * amplitude);
      ctx.moveTo(0, minY);
      ctx.lineTo(w, minY);
    }

    ctx.stroke();
    ctx.setLineDash([]);

    // Draw peak level indicators
    const peakLevel = Math.max(Math.abs(maxNormalized), Math.abs(minNormalized));
    const peakHeight = 10;
    const peakWidth = 20;
    const peakX = w - peakWidth - 10;
    const peakY = 10;

    // Peak level bar background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(peakX, peakY, peakWidth, peakHeight);

    // Peak level bar fill
    const fillWidth = peakLevel * peakWidth;
    const peakColor = peakLevel > 0.8 ? '#ff4444' : '#00ff88';
    ctx.fillStyle = peakColor;
    ctx.fillRect(peakX, peakY, fillWidth, peakHeight);

    // Peak level text
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${(peakLevel * 100).toFixed(0)}%`, peakX - 5, peakY + peakHeight);
  }, []);

  // Start animation when analyser is available
  useEffect(() => {
    if (analyserNode) {
      draw();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, draw]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      // Canvas will be redrawn on next animation frame
    });

    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="oscilloscope-container">
      <div className="oscilloscope-header">
        <h3>Oscilloscope</h3>
        <div className="oscilloscope-controls">
          <span className="status-indicator">
            {analyserNode ? '●' : '○'} {analyserNode ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="oscilloscope-canvas"
        style={{ 
          border: '1px solid #333',
          borderRadius: '4px',
          backgroundColor: '#0a0a0a'
        }}
      />
    </div>
  );
};