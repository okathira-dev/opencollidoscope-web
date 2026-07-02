import { computeChunkMinMax, computeFadeGain } from "../../../domain/audio/index.ts";
import type {
  RecordingCompleteMessage,
  RecordingStartMessage,
  RecordingWorkletInputMessage,
  RecordingWorkletOutputMessage,
} from "./recording-messages.ts";

class RecordingProcessor extends AudioWorkletProcessor {
  private buffer: Float32Array | null = null;
  private writeIndex = 0;
  private totalSamples = 0;
  private chunkCount = 0;
  private samplesPerChunk = 0;
  private fadeSamples = 0;
  private isRecording = false;
  private lastReportedChunk = -1;

  constructor() {
    super();
    this.port.onmessage = (event: MessageEvent<RecordingWorkletInputMessage>) => {
      const message = event.data;
      if (message.type === "start") {
        this.startRecording(message);
      } else if (message.type === "stop") {
        this.finishRecording();
      }
    };
  }

  private startRecording(message: RecordingStartMessage): void {
    this.totalSamples = message.totalSamples;
    this.chunkCount = message.chunkCount;
    this.fadeSamples = message.fadeSamples;
    this.samplesPerChunk = Math.round(this.totalSamples / this.chunkCount);
    this.writeIndex = 0;
    this.lastReportedChunk = -1;
    this.isRecording = true;

    if (message.sharedBuffer) {
      this.buffer = new Float32Array(message.sharedBuffer);
    } else {
      this.buffer = new Float32Array(this.totalSamples);
    }
  }

  private finishRecording(): void {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;
    this.reportChunkIfNeeded();
    this.postComplete();
  }

  private postComplete(): void {
    if (this.buffer && !this.usesSharedBuffer()) {
      const copy = new Float32Array(this.buffer);
      const message: RecordingCompleteMessage = { type: "complete", buffer: copy };
      this.port.postMessage(message, [copy.buffer]);
      return;
    }

    const message: RecordingCompleteMessage = { type: "complete" };
    this.port.postMessage(message);
  }

  private usesSharedBuffer(): boolean {
    return this.buffer?.buffer instanceof SharedArrayBuffer;
  }

  private reportChunkIfNeeded(): void {
    if (!this.buffer || this.samplesPerChunk <= 0) {
      return;
    }

    const completedUpTo = Math.floor(this.writeIndex / this.samplesPerChunk) - 1;
    if (completedUpTo <= this.lastReportedChunk) {
      return;
    }

    for (
      let index = this.lastReportedChunk + 1;
      index <= completedUpTo && index < this.chunkCount;
      index++
    ) {
      const { min, max } = computeChunkMinMax(this.buffer, index, this.samplesPerChunk);
      const chunkMessage: RecordingWorkletOutputMessage = {
        type: "chunk",
        index,
        min,
        max,
      };
      this.port.postMessage(chunkMessage);
    }

    this.lastReportedChunk = Math.min(completedUpTo, this.chunkCount - 1);
  }

  process(inputs: Float32Array[][], _outputs: Float32Array[][]): boolean {
    if (!this.isRecording || !this.buffer) {
      return true;
    }

    const input = inputs[0]?.[0];
    if (!input) {
      return true;
    }

    for (let i = 0; i < input.length; i++) {
      if (this.writeIndex >= this.totalSamples) {
        this.isRecording = false;
        this.reportChunkIfNeeded();
        this.postComplete();
        return true;
      }

      const fadeGain = computeFadeGain(this.writeIndex, this.totalSamples, this.fadeSamples);
      const sample = input[i] ?? 0;
      this.buffer[this.writeIndex] = sample * fadeGain;
      this.writeIndex++;
    }

    this.reportChunkIfNeeded();
    return true;
  }
}

registerProcessor("recording-processor", RecordingProcessor);
