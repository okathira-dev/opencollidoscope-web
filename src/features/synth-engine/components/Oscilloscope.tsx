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

  for (let i = 0; i < dataBuffer.length; i++) {
    const value = (dataBuffer[i] ?? 128) / 128 - 1;
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
  for (let i = 0; i < dataBuffer.length; i++) {
    if (Math.abs((dataBuffer[i] ?? 128) - 128) > SILENCE_THRESHOLD) {
      return false;
    }
  }
  return true;
}
