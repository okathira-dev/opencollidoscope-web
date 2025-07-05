import { Box } from "@mui/material";
import { useRef, useEffect } from "react";

import { useAudioContext } from "../hooks/useAudioContext";

export const OscilloscopeDisplay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const { audioContext } = useAudioContext(); // 共有AudioContextを使用
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);

  // AnalyserNodeの初期化（現在は無効化）
  useEffect(() => {
    if (!audioContext) return; // AudioContextがnullの場合は何もしない

    // TODO: オシロスコープ機能は後で実装
    // 現在は音声ソースとの接続が複雑なため、基本機能の動作確認を優先

    return () => {
      // クリーンアップ
      analyser.current = null;
      dataArray.current = null;
    };
  }, [audioContext]);

  // オシロスコープの描画ロジック（現在は無効化）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const width = canvas.width;
    const height = canvas.height;

    // 静的な背景を描画
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#2C2C2C"; // 背景色
    context.fillRect(0, 0, width, height);

    // プレースホルダーテキストを表示
    context.fillStyle = "lime";
    context.font = "16px Arial";
    context.textAlign = "center";
    context.fillText("オシロスコープ（準備中）", width / 2, height / 2);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [audioContext]);

  return (
    <Box
      sx={{
        border: "1px solid grey",
        height: 100,
        bgcolor: "background.default",
        borderRadius: 1,
      }}
    >
      <canvas ref={canvasRef} width="1000" height="100"></canvas>
    </Box>
  );
};
