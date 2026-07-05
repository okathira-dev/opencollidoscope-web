import type { CollidoscopeConfig } from "../config/index.ts";

export type MicInputConfig = CollidoscopeConfig["micInput"];

export interface MicConstraintSupport {
  autoGainControl: boolean;
  noiseSuppression: boolean;
  echoCancellation: boolean;
}

export interface MediaTrackAudioConstraints {
  autoGainControl?: boolean;
  noiseSuppression?: boolean;
  echoCancellation?: boolean;
}

export function buildMicMediaConstraints(
  config: Pick<MicInputConfig, "autoGainControl" | "noiseSuppression" | "echoCancellation">,
): MediaTrackAudioConstraints {
  return {
    autoGainControl: config.autoGainControl,
    noiseSuppression: config.noiseSuppression,
    echoCancellation: config.echoCancellation,
  };
}

export function detectMicConstraintSupport(track: MediaStreamTrack): MicConstraintSupport {
  const capabilities = track.getCapabilities?.() as MediaTrackAudioConstraints | undefined;

  return {
    autoGainControl: capabilities?.autoGainControl !== undefined,
    noiseSuppression: capabilities?.noiseSuppression !== undefined,
    echoCancellation: capabilities?.echoCancellation !== undefined,
  };
}

export function applyCompressorSettings(
  compressor: DynamicsCompressorNode,
  config: MicInputConfig,
): void {
  compressor.threshold.value = config.compressorThreshold;
  compressor.knee.value = config.compressorKnee;
  compressor.ratio.value = config.compressorRatio;
  compressor.attack.value = config.compressorAttack;
  compressor.release.value = config.compressorRelease;
}

export function computeInputPeakLevel(
  analyser: AnalyserNode,
  buffer: Float32Array<ArrayBuffer>,
): number {
  analyser.getFloatTimeDomainData(buffer);
  let peak = 0;
  // perf: rAF 毎フレーム呼ばれる。GC ゼロ保証のため index ループを維持する。
  for (let i = 0; i < buffer.length; i++) {
    const sample = Math.abs(buffer[i] ?? 0);
    if (sample > peak) {
      peak = sample;
    }
  }
  return peak;
}
