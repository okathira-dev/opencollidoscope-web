// AudioWorkletProcessor用の型定義
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean;
}

declare function registerProcessor(
  name: string,
  processorCtor: typeof AudioWorkletProcessor,
): void;

// AudioWorkletグローバル変数
declare const sampleRate: number;
declare const currentTime: number;
declare const currentFrame: number;
