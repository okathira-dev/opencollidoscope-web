import { useEffect, useRef } from "react";

interface Props {
  buffer: AudioBuffer | null;
  selection: [number, number]; // seconds
}

/* Simple canvas-based waveform visualiser */
export function Waveform({ buffer, selection }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!buffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;

    ctx.beginPath();
    ctx.moveTo(0, amp);
    for (let i = 0; i < canvas.width; i++) {
      const segment = data.subarray(i * step, (i + 1) * step);
      const min = Math.min(...segment);
      ctx.lineTo(i, (1 + min) * amp);
    }
    ctx.strokeStyle = "#1976d2";
    ctx.stroke();

    // Draw selection highlight
    const [selStart, selEnd] = selection;
    if (selEnd > selStart) {
      const startX = (selStart / buffer.duration) * canvas.width;
      const endX = (selEnd / buffer.duration) * canvas.width;
      ctx.fillStyle = "rgba(25,118,210,0.2)";
      ctx.fillRect(startX, 0, endX - startX, canvas.height);
    }
  }, [buffer, selection]);

  return <canvas ref={canvasRef} width={600} height={100} />;
}