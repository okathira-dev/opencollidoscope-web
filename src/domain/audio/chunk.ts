export interface ChunkMinMax {
  min: number;
  max: number;
}

export function computeBufferLength(sampleRate: number, waveLength: number): number {
  return Math.round(sampleRate * waveLength);
}

/**
 * チャンクあたりのサンプル数。
 * オリジナル BufferToWaveRecorderNode::initialize の std::lround(getNumFrames() / mNumChunks) に相当。
 * Math.ceil にすると末尾チャンクが空になる場合があるため round を使う。
 * 割り切れない端数は computeChunkRange の totalSamples クランプで各チャンクに配分される。
 */
export function computeSamplesPerChunk(totalSamples: number, chunkCount: number): number {
  return Math.round(totalSamples / chunkCount);
}

export function computeChunkIndex(sampleIndex: number, samplesPerChunk: number): number {
  if (samplesPerChunk <= 0) {
    return 0;
  }
  return Math.floor(sampleIndex / samplesPerChunk);
}

export function computeChunkRange(
  chunkIndex: number,
  samplesPerChunk: number,
  totalSamples: number,
): { start: number; end: number } {
  const start = chunkIndex * samplesPerChunk;
  const end = Math.min(start + samplesPerChunk, totalSamples);
  return { start, end };
}

export function chunkToSampleRange(
  chunkStart: number,
  chunkSize: number,
  totalSamples: number,
  chunkCount: number,
): { startSample: number; sizeSamples: number } {
  const samplesPerChunk = computeSamplesPerChunk(totalSamples, chunkCount);
  const startSample = chunkStart * samplesPerChunk;
  const sizeSamples = chunkSize * samplesPerChunk;
  return { startSample, sizeSamples };
}

export function computeChunkMinMax(
  samples: Float32Array,
  chunkIndex: number,
  samplesPerChunk: number,
): ChunkMinMax {
  const { start, end } = computeChunkRange(chunkIndex, samplesPerChunk, samples.length);

  if (start >= end) {
    return { min: 0, max: 0 };
  }

  let min = samples[start] ?? 0;
  let max = samples[start] ?? 0;

  // perf: ~588 samples/chunk の min/max 走査。.reduce() は毎イテレーション {min,max}
  // オブジェクトを生成し GC 圧がかかる。index ループは V8 bounds-check hoisting +
  // register allocation で最速。
  for (let i = start + 1; i < end; i++) {
    const sample = samples[i] ?? 0;
    if (sample < min) {
      min = sample;
    }
    if (sample > max) {
      max = sample;
    }
  }

  return { min, max };
}
