import { Box, Paper, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ChunkData } from "../utils/types";
import type React from "react";

interface WaveformDisplayProps {
  chunks: ChunkData[];
  width?: number;
  height?: number;
  backgroundColor?: string;
  waveColor?: string;
  selectedColor?: string;
  showChunks?: boolean;
  title?: string;
}

export function WaveformDisplay({
  chunks,
  width = 800,
  height = 200,
  backgroundColor = "#1a1a1a",
  waveColor = "#00ff00",
  selectedColor = "#ffff00",
  showChunks = true,
  title = "波形表示",
}: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 波形描画の中心線Y座標
  const centerY = height / 2;

  /**
   * Canvasをクリア
   */
  const clearCanvas = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    },
    [backgroundColor, width, height],
  );

  /**
   * 波形を描画
   */
  const drawWaveform = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      console.log("🎨 drawWaveform called:", {
        chunksLength: chunks.length,
        firstChunkData: chunks[0] ? chunks[0].data.length : 0,
      });

      if (chunks.length === 0) {
        console.log("⚠️ No chunks to draw");
        return;
      }

      const totalSamples = chunks.reduce(
        (sum, chunk) => sum + chunk.data.length,
        0,
      );

      console.log("📊 Drawing waveform:", {
        totalSamples,
        chunksLength: chunks.length,
      });

      if (totalSamples === 0) {
        console.log("⚠️ No samples to draw");
        return;
      }

      // 波形描画
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 1;
      ctx.beginPath();

      let xOffset = 0;

      for (const chunk of chunks) {
        const chunkWidth = (chunk.data.length / totalSamples) * width;

        // チャンクが選択されている場合は色を変更
        if (chunk.isSelected) {
          ctx.strokeStyle = selectedColor;
        } else {
          ctx.strokeStyle = waveColor;
        }

        ctx.beginPath();

        // チャンクの波形を描画
        for (let i = 0; i < chunk.data.length; i++) {
          const x = xOffset + (i / chunk.data.length) * chunkWidth;
          const y = centerY - (chunk.data[i] || 0) * centerY * 0.9; // 90%の高さに制限

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
        xOffset += chunkWidth;
      }
    },
    [chunks, waveColor, selectedColor, width, centerY],
  );

  /**
   * チャンク境界を描画
   */
  const drawChunkBoundaries = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!showChunks || chunks.length === 0) return;

      const totalSamples = chunks.reduce(
        (sum, chunk) => sum + chunk.data.length,
        0,
      );
      if (totalSamples === 0) return;

      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      let xOffset = 0;

      for (let i = 0; i < chunks.length - 1; i++) {
        const chunk = chunks[i];
        if (!chunk) continue;
        const chunkWidth = (chunk.data.length / totalSamples) * width;
        xOffset += chunkWidth;

        ctx.beginPath();
        ctx.moveTo(xOffset, 0);
        ctx.lineTo(xOffset, height);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    },
    [chunks, showChunks, width, height],
  );

  /**
   * 中心線を描画
   */
  const drawCenterLine = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.strokeStyle = "#444444";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      ctx.setLineDash([]);
    },
    [centerY, width],
  );

  /**
   * チャンクインデックスを描画
   */
  const drawChunkIndices = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!showChunks || chunks.length === 0) return;

      const totalSamples = chunks.reduce(
        (sum, chunk) => sum + chunk.data.length,
        0,
      );
      if (totalSamples === 0) return;

      ctx.fillStyle = "#888888";
      ctx.font = "10px Arial";
      ctx.textAlign = "left";

      let xOffset = 0;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (!chunk) continue;
        const chunkWidth = (chunk.data.length / totalSamples) * width;

        // チャンクインデックスを描画（10チャンクごと）
        if (i % 10 === 0) {
          ctx.fillText(i.toString(), xOffset + 2, 15);
        }

        xOffset += chunkWidth;
      }
    },
    [chunks, showChunks, width],
  );

  /**
   * 波形統計を描画
   */
  const drawStatistics = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (chunks.length === 0) return;

      const totalSamples = chunks.reduce(
        (sum, chunk) => sum + chunk.data.length,
        0,
      );
      const selectedChunks = chunks.filter((chunk) => chunk.isSelected);

      ctx.fillStyle = "#cccccc";
      ctx.font = "12px Arial";
      ctx.textAlign = "right";

      const stats = [
        `チャンク数: ${chunks.length}`,
        `選択済み: ${selectedChunks.length}`,
        `総サンプル数: ${totalSamples}`,
      ];

      stats.forEach((stat, index) => {
        ctx.fillText(
          stat,
          width - 10,
          height - 10 - (stats.length - 1 - index) * 15,
        );
      });
    },
    [chunks, height, width],
  );

  /**
   * 全体の描画処理
   */
  const drawAll = useCallback(() => {
    console.log("🖼️ drawAll called:", {
      chunksLength: chunks.length,
      canvasExists: !!canvasRef.current,
    });

    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("❌ Canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("❌ Canvas context not found");
      return;
    }

    setIsDrawing(true);

    // 高解像度対応
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // 描画実行
    clearCanvas(ctx);
    drawCenterLine(ctx);
    drawWaveform(ctx);
    drawChunkBoundaries(ctx);
    drawChunkIndices(ctx);
    drawStatistics(ctx);

    setIsDrawing(false);
  }, [
    clearCanvas,
    drawCenterLine,
    drawWaveform,
    drawChunkBoundaries,
    drawChunkIndices,
    drawStatistics,
    width,
    height,
  ]);

  /**
   * チャンクデータが変更された時に再描画
   */
  useEffect(() => {
    drawAll();
  }, [drawAll]);

  /**
   * キャンバスクリック処理（チャンク選択）
   */
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || chunks.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;

      // クリック位置からチャンクインデックスを計算
      const totalSamples = chunks.reduce(
        (sum, chunk) => sum + chunk.data.length,
        0,
      );
      if (totalSamples === 0) return;

      let xOffset = 0;
      let clickedChunkIndex = -1;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (!chunk) continue;
        const chunkWidth = (chunk.data.length / totalSamples) * width;

        if (x >= xOffset && x < xOffset + chunkWidth) {
          clickedChunkIndex = i;
          break;
        }

        xOffset += chunkWidth;
      }

      if (clickedChunkIndex >= 0) {
        console.log(`🎯 Chunk ${clickedChunkIndex} clicked`);

        // チャンクの選択状態を切り替え
        // 注意: この実装では直接状態を変更しないため、親コンポーネントでの実装が必要
        // onChunkSelectコールバックを追加する必要があります
      }
    },
    [chunks, height, width],
  );

  return (
    <Paper elevation={3} sx={{ p: 2, m: 1 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          border: "1px solid #333",
          borderRadius: 1,
          p: 1,
          backgroundColor: backgroundColor,
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            cursor: "crosshair",
          }}
          onClick={handleCanvasClick}
        />
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        {isDrawing ? "描画中..." : `${chunks.length}チャンク表示中`}
      </Typography>
    </Paper>
  );
}
