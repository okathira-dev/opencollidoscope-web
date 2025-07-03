/**
 * WaveformDisplay.tsx - Waveform visualization and selection React component
 * Based on the original OpenCollidoscope waveform display
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { WaveformDisplayProps, WaveformPeaks, SelectionRegion } from '../types/ui';
import { AUDIO_CONSTANTS } from '../types/audio';

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  buffer,
  selection,
  onSelectionChange,
  width = 800,
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<WaveformPeaks | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number>(0);
  const dragStartRef = useRef<number>(0);

  // Calculate waveform peaks for efficient rendering
  const calculatePeaks = useCallback((audioBuffer: AudioBuffer, samplesPerPixel: number): WaveformPeaks => {
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const peakLength = Math.ceil(channelData.length / samplesPerPixel);
    const positive = new Float32Array(peakLength);
    const negative = new Float32Array(peakLength);

    for (let i = 0; i < peakLength; i++) {
      const start = i * samplesPerPixel;
      const end = Math.min(start + samplesPerPixel, channelData.length);
      
      let max = -1;
      let min = 1;
      
      for (let j = start; j < end; j++) {
        const sample = channelData[j];
        if (sample > max) max = sample;
        if (sample < min) min = sample;
      }
      
      positive[i] = max;
      negative[i] = min;
    }

    return { positive, negative, length: peakLength };
  }, []);

  // Update peaks when buffer changes
  useEffect(() => {
    if (!buffer) {
      setPeaks(null);
      return;
    }

    const samplesPerPixel = Math.max(1, Math.floor(buffer.length / width));
    const newPeaks = calculatePeaks(buffer, samplesPerPixel);
    setPeaks(newPeaks);
  }, [buffer, width, calculatePeaks]);

  // Draw waveform and selection
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks || !buffer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size accounting for device pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    const centerY = height / 2;
    const amplitude = height * 0.4;

    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x < width && x < peaks.length; x++) {
      const posY = centerY - (peaks.positive[x] * amplitude);
      const negY = centerY - (peaks.negative[x] * amplitude);
      
      if (x === 0) {
        ctx.moveTo(x, posY);
      } else {
        ctx.lineTo(x, posY);
      }
    }
    
    // Draw bottom half
    for (let x = width - 1; x >= 0 && x < peaks.length; x--) {
      const negY = centerY - (peaks.negative[x] * amplitude);
      ctx.lineTo(x, negY);
    }
    
    ctx.closePath();
    ctx.fill();

    // Draw selection overlay
    if (selection.size > 0) {
      const chunksPerPixel = AUDIO_CONSTANTS.DEFAULT_CHUNKS / width;
      const selectionStartX = selection.start / chunksPerPixel;
      const selectionEndX = (selection.start + selection.size) / chunksPerPixel;

      // Selection highlight
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.fillRect(selectionStartX, 0, selectionEndX - selectionStartX, height);

      // Selection borders
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(selectionStartX, 0);
      ctx.lineTo(selectionStartX, height);
      ctx.moveTo(selectionEndX, 0);
      ctx.lineTo(selectionEndX, height);
      ctx.stroke();
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Vertical lines (time markers)
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    
    // Horizontal center line
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    
    ctx.stroke();

  }, [peaks, buffer, selection, width, height]);

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  // Convert mouse position to chunk position
  const pixelToChunk = useCallback((x: number): number => {
    const chunksPerPixel = AUDIO_CONSTANTS.DEFAULT_CHUNKS / width;
    return Math.floor(x * chunksPerPixel);
  }, [width]);

  // Handle mouse events for selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const chunkPosition = pixelToChunk(x);

    setIsDragging(true);
    setDragStart(chunkPosition);
    dragStartRef.current = chunkPosition;

    // Start new selection
    onSelectionChange(chunkPosition, 1);
  }, [pixelToChunk, onSelectionChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const chunkPosition = pixelToChunk(x);

    const start = Math.min(dragStartRef.current, chunkPosition);
    const end = Math.max(dragStartRef.current, chunkPosition);
    const size = Math.max(1, end - start);

    onSelectionChange(start, size);
  }, [isDragging, pixelToChunk, onSelectionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle touch events for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const chunkPosition = pixelToChunk(x);

    setIsDragging(true);
    setDragStart(chunkPosition);
    dragStartRef.current = chunkPosition;

    onSelectionChange(chunkPosition, 1);
  }, [pixelToChunk, onSelectionChange]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const chunkPosition = pixelToChunk(x);

    const start = Math.min(dragStartRef.current, chunkPosition);
    const end = Math.max(dragStartRef.current, chunkPosition);
    const size = Math.max(1, end - start);

    onSelectionChange(start, size);
  }, [isDragging, pixelToChunk, onSelectionChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="waveform-display-container">
      <div className="waveform-info">
        <span>Selection: {selection.start}-{selection.start + selection.size} chunks</span>
        {buffer && (
          <span>Duration: {buffer.duration.toFixed(2)}s</span>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="waveform-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'crosshair' }}
      />
    </div>
  );
};