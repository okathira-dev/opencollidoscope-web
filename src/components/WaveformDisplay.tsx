import { Box } from "@mui/material";
import { useRef, useEffect, useCallback } from "react";

import { useAudioContext } from "../hooks/useAudioContext";
import { useSynthStore } from "../store/synthStore";
import {
  NUM_CHUNKS,
  SELECTION_SCALE_FACTOR,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  WAVE_COLORS,
} from "../constants/config";

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
}

interface WaveformDisplayProps {
  audioBuffer: AudioBuffer | null;
  particleTriggerRef?: React.MutableRefObject<
    ((x: number, y: number) => void) | undefined
  >;
}

const CURSOR_COLOR = "white";

export const WaveformDisplay = ({
  audioBuffer,
  particleTriggerRef,
}: WaveformDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null); // 静的コンテンツ用
  const animationFrameId = useRef<number | null>(null);
  const { audioContext } = useAudioContext(); // 共有AudioContextを使用
  const sourceNode = useRef<AudioBufferSourceNode | null>(null);
  const particles = useRef<Particle[]>([]);

  const { selectionStart, selectionSize, loop, grainDuration } =
    useSynthStore(); // ここで取得

  // AudioContextの初期化はuseAudioContextで行うため、ここでは不要
  useEffect(() => {
    return () => {
      if (sourceNode.current) {
        sourceNode.current.stop();
        sourceNode.current.disconnect();
      }
    };
  }, []);

  // 静的な波形と選択範囲の描画ロジック
  const drawStaticContent = useCallback(() => {
    const canvas = staticCanvasRef.current;
    if (!audioBuffer || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = audioBuffer.getChannelData(0);

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#1A1A1A"; // 背景をテーマの背景色に合わせる
    context.fillRect(0, 0, width, height);

    const chunkWidth = width / NUM_CHUNKS;
    const samplesPerChunk = Math.floor(data.length / NUM_CHUNKS);

    context.strokeStyle = "red"; // Wave 1の色をテーマのprimaryに合わせる
    context.lineWidth = 1; // バーの太さ

    for (let i = 0; i < NUM_CHUNKS; i++) {
      const start = i * samplesPerChunk;
      const end = Math.min(start + samplesPerChunk, data.length); // 範囲外アクセスを防ぐ
      let min = 0;
      let max = 0;

      // チャンク内の最小値と最大値を計算
      for (let j = start; j < end; j++) {
        const value = data[j]; // 直接インデックスjを使用
        if (value !== undefined) {
          if (value < min) {
            min = value;
          } else if (value > max) {
            max = value;
          }
        }
      }

      // チャンクを描画
      const x = i * chunkWidth;
      const yMin = ((1 + min) * height) / 2;
      const yMax = ((1 + max) * height) / 2;

      context.beginPath();
      context.moveTo(x + chunkWidth / 2, yMin);
      context.lineTo(x + chunkWidth / 2, yMax);
      context.stroke();
    }

    // 選択範囲の描画
    const selectionPixelStart =
      (selectionStart / SELECTION_SCALE_FACTOR) * width;
    const selectionPixelEnd =
      ((selectionStart + selectionSize) / SELECTION_SCALE_FACTOR) * width;

    context.fillStyle = `rgba(${WAVE_COLORS.WAVE_2.r}, ${WAVE_COLORS.WAVE_2.g}, ${WAVE_COLORS.WAVE_2.b}, 0.3)`; // オリジナルの選択範囲色を使用
    context.fillRect(
      selectionPixelStart,
      0,
      selectionPixelEnd - selectionPixelStart,
      height,
    );
  }, [audioBuffer, selectionStart, selectionSize]);

  // 静的コンテンツの再描画トリガー
  useEffect(() => {
    drawStaticContent();
  }, [drawStaticContent]);

  // パーティクル生成ロジック
  const createParticle = useCallback(
    (x: number, y: number) => {
      if (grainDuration > 1) {
        const numParticles = Math.floor(grainDuration * 5); // grainDurationに応じてパーティクル数を増やす
        for (let i = 0; i < numParticles; i++) {
          particles.current.push({
            x: x + (Math.random() - 0.5) * 20, // 少しランダムな位置
            y: y + (Math.random() - 0.5) * 20,
            radius: Math.random() * 3 + 1,
            color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            alpha: 1,
          });
        }
      }
    },
    [grainDuration],
  );

  // particleTriggerRefが渡された場合、createParticleをrefに設定
  useEffect(() => {
    if (particleTriggerRef) {
      particleTriggerRef.current = createParticle;
    }
  }, [particleTriggerRef, createParticle]);

  // 再生カーソルとループ、パーティクルアニメーションのロジック
  useEffect(() => {
    const canvas = canvasRef.current;
    const staticCanvas = staticCanvasRef.current;
    if (!audioBuffer || !canvas || !staticCanvas || !audioContext) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const width = canvas.width;
    const height = canvas.height;

    // 既存のソースノードがあれば停止して切断
    if (sourceNode.current) {
      sourceNode.current.stop();
      sourceNode.current.disconnect();
      sourceNode.current = null;
    }

    // 新しいソースノードを作成し、バッファを設定
    sourceNode.current = audioContext.createBufferSource();
    sourceNode.current.buffer = audioBuffer;
    sourceNode.current.connect(audioContext.destination);

    const startOffset =
      (selectionStart / SELECTION_SCALE_FACTOR) * audioBuffer.duration;
    const baseDuration =
      (selectionSize / SELECTION_SCALE_FACTOR) * audioBuffer.duration;

    sourceNode.current.loop = loop;
    if (loop) {
      sourceNode.current.loopStart = startOffset;
      sourceNode.current.loopEnd = startOffset + baseDuration;
    }

    // 再生開始
    sourceNode.current.start(0, startOffset);

    const startTime = audioContext.currentTime;

    const animate = () => {
      // 静的コンテンツをコピー
      context.clearRect(0, 0, width, height); // メインCanvasをクリア
      context.drawImage(staticCanvas, 0, 0); // 静的コンテンツをコピー

      // カーソルの描画
      const elapsed = audioContext ? audioContext.currentTime - startTime : 0;
      let currentPlayTime = (startOffset + elapsed) % audioBuffer.duration; // ループを考慮

      if (loop) {
        const loopDuration = sourceNode.current
          ? sourceNode.current.loopEnd - sourceNode.current.loopStart
          : baseDuration;
        currentPlayTime =
          (sourceNode.current ? sourceNode.current.loopStart : startOffset) +
          (elapsed % loopDuration);
      }

      const cursorX = (currentPlayTime / audioBuffer.duration) * width;

      context.strokeStyle = CURSOR_COLOR;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(cursorX, 0);
      context.lineTo(cursorX, height);
      context.stroke();

      // パーティクルの更新と描画
      particles.current = particles.current.filter((p) => p.alpha > 0.01);
      particles.current.forEach((p, _index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.01; // フェードアウト

        context.fillStyle = p.color.replace(/[^,]+(?=\))/, p.alpha.toString()); // アルファ値を更新
        context.beginPath();
        context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        context.fill();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    // クリーンアップ
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (sourceNode.current) {
        sourceNode.current.stop();
        sourceNode.current.disconnect();
      }
      particles.current = []; // パーティクルもクリア
    };
  }, [
    audioBuffer,
    selectionStart,
    selectionSize,
    loop,
    drawStaticContent,
    createParticle,
    audioContext,
  ]);

  return (
    <Box
      sx={{
        border: "1px solid black",
        height: CANVAS_HEIGHT,
        bgcolor: "background.default",
        borderRadius: 1,
      }}
    >
      <canvas
        ref={staticCanvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ display: "none" }}
      ></canvas>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      ></canvas>
    </Box>
  );
};
