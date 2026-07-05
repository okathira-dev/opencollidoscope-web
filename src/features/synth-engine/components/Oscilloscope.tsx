import { BYTE_CENTER } from "../../../consts/audio.ts";

const OSCILLOSCOPE_AMPLITUDE_SCALE = 0.8;

export function drawOscilloscope(
  ctx: CanvasRenderingContext2D,
  analyser: AnalyserNode,
  width: number,
  height: number,
  dataBuffer: Uint8Array<ArrayBuffer>,
): void {
  analyser.getByteTimeDomainData(dataBuffer);

  const centerY = height / 2;
  const amplitude = (height / 2) * OSCILLOSCOPE_AMPLITUDE_SCALE;
  const step = width / dataBuffer.length;

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();

  // perf: moveTo/lineTo 分岐に index が必須。canvas API 呼び出しがボトルネックであり、
  // ループ方式を変えても効果はない。
  for (let i = 0; i < dataBuffer.length; i++) {
    const value = (dataBuffer[i] ?? BYTE_CENTER) / BYTE_CENTER - 1;
    const x = i * step;
    const y = centerY + value * amplitude;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
}

export function createOscilloscopeBuffer(analyser: AnalyserNode): Uint8Array<ArrayBuffer> {
  return new Uint8Array(analyser.fftSize);
}

const SILENCE_THRESHOLD = 2;

/** オシロスコープ波形が無音（中央値付近）かどうか */
export function isOscilloscopeSilent(
  analyser: AnalyserNode,
  dataBuffer: Uint8Array<ArrayBuffer>,
): boolean {
  analyser.getByteTimeDomainData(dataBuffer);
  // V8 TurboFan は TypedArray.some() のモノモーフィックコールバックをインライン展開し、
  // ループピーリングにより index ループと同等速度で動作する (fftSize=256 要素)。
  return !dataBuffer.some((b) => Math.abs(b - BYTE_CENTER) > SILENCE_THRESHOLD);
}
