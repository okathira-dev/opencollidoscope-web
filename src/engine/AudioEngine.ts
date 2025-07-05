/**
 * AudioEngine implementation based on the original AudioEngine.h
 * Uses Web Audio API with modern TypeScript patterns
 */

import {
  NUM_WAVES,
  WAVE_LENGTH_SECONDS,
  DEFAULT_SAMPLE_RATE,
  DEFAULT_CHANNEL_COUNT,
  MAX_FILTER_CUTOFF_FREQ,
  MIN_FILTER_CUTOFF_FREQ,
  MIDDLE_C_MIDI_NOTE,
} from "../constants/config";
import { Command } from "../types";

import type {
  RecordWaveMessage,
  CursorTriggerMessage,
  WaveIndex,
} from "../types";

// Web Audio Node wrapper for granular synthesis
class PGranularNode {
  private audioContext: AudioContext;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;
  private filterNode: BiquadFilterNode;
  private outputNode: GainNode;
  private audioBuffer: AudioBuffer | null = null;
  private selectionStart: number = 0;
  private selectionSize: number = 0;
  private grainDurationCoeff: number = 1.0;
  private isLooping: boolean = false;
  private activeVoices: Set<AudioBufferSourceNode> = new Set();

  constructor(audioContext: AudioContext, outputNode: AudioNode) {
    this.audioContext = audioContext;

    // Create audio graph: source -> filter -> gain -> output
    this.gainNode = audioContext.createGain();
    this.filterNode = audioContext.createBiquadFilter();
    this.outputNode = audioContext.createGain();

    this.filterNode.type = "lowpass";
    this.filterNode.frequency.value = MAX_FILTER_CUTOFF_FREQ;
    this.filterNode.Q.value = 0.707;

    this.gainNode.gain.value = 0.7;
    this.outputNode.gain.value = 1.0;

    // Connect the chain
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.outputNode);
    this.outputNode.connect(outputNode);
  }

  setAudioBuffer(buffer: AudioBuffer | null): void {
    this.audioBuffer = buffer;
  }

  setSelectionStart(start: number): void {
    this.selectionStart = Math.max(0, start);
  }

  setSelectionSize(size: number): void {
    this.selectionSize = Math.max(0, size);
  }

  setGrainDurationCoeff(coeff: number): void {
    this.grainDurationCoeff = Math.max(1.0, Math.min(8.0, coeff));
  }

  setFilterCutoff(cutoff: number): void {
    const clampedCutoff = Math.max(
      MIN_FILTER_CUTOFF_FREQ,
      Math.min(MAX_FILTER_CUTOFF_FREQ, cutoff),
    );
    this.filterNode.frequency.setValueAtTime(
      clampedCutoff,
      this.audioContext.currentTime,
    );
  }

  setLoop(loop: boolean): void {
    this.isLooping = loop;
  }

  noteOn(midiNote: number): void {
    if (!this.audioBuffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;

    // Calculate playback rate from MIDI note
    const playbackRate = Math.pow(2, (midiNote - MIDDLE_C_MIDI_NOTE) / 12);
    source.playbackRate.value = playbackRate;

    // Calculate timing parameters
    const startTime =
      (this.selectionStart / (NUM_WAVES * 1000)) * this.audioBuffer.duration;
    const grainDuration =
      (this.selectionSize / (NUM_WAVES * 1000)) *
      this.audioBuffer.duration *
      this.grainDurationCoeff;

    // Connect to audio graph
    source.connect(this.filterNode);

    // Set up envelope
    const now = this.audioContext.currentTime;
    const attackTime = 0.01;
    const releaseTime = 0.05;

    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(0.7, now + attackTime);

    if (!this.isLooping) {
      this.gainNode.gain.setValueAtTime(0.7, now + grainDuration - releaseTime);
      this.gainNode.gain.linearRampToValueAtTime(0, now + grainDuration);
    }

    // Start playback
    source.start(now, startTime, this.isLooping ? undefined : grainDuration);

    if (!this.isLooping) {
      source.stop(now + grainDuration);
    }

    // Track active voices
    this.activeVoices.add(source);

    source.onended = () => {
      source.disconnect();
      this.activeVoices.delete(source);
    };
  }

  noteOff(): void {
    // Stop all active voices
    this.activeVoices.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Voice might already be stopped
      }
    });
    this.activeVoices.clear();

    // Fade out
    const now = this.audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
  }

  disconnect(): void {
    this.noteOff();
    this.outputNode.disconnect();
  }
}

// Buffer recorder for capturing audio input
class BufferRecorderNode {
  private audioContext: AudioContext;
  public scriptProcessor: ScriptProcessorNode;
  private isRecording: boolean = false;
  private recordBuffer: Float32Array[] = [];
  private recordLength: number = 0;
  private onChunkCallback?: (index: number, min: number, max: number) => void;
  private onStartCallback?: () => void;

  constructor(audioContext: AudioContext, bufferSize: number = 4096) {
    this.audioContext = audioContext;
    this.scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);

    this.scriptProcessor.onaudioprocess = (event) => {
      if (!this.isRecording) return;

      const inputBuffer = event.inputBuffer.getChannelData(0);
      const bufferCopy = new Float32Array(inputBuffer);
      this.recordBuffer.push(bufferCopy);
      this.recordLength += bufferCopy.length;

      // Calculate chunk statistics
      let min = 0;
      let max = 0;
      for (let i = 0; i < bufferCopy.length; i++) {
        const value = bufferCopy[i];
        if (value !== undefined) {
          if (value < min) min = value;
          if (value > max) max = value;
        }
      }

      // Send chunk data
      if (this.onChunkCallback) {
        const chunkIndex = Math.floor(
          this.recordLength /
            ((this.audioContext.sampleRate * WAVE_LENGTH_SECONDS) / NUM_WAVES),
        );
        this.onChunkCallback(chunkIndex, min, max);
      }
    };
  }

  connect(destination: AudioNode): void {
    this.scriptProcessor.connect(destination);
  }

  disconnect(): void {
    this.scriptProcessor.disconnect();
  }

  startRecording(): void {
    this.isRecording = true;
    this.recordBuffer = [];
    this.recordLength = 0;

    if (this.onStartCallback) {
      this.onStartCallback();
    }
  }

  stopRecording(): AudioBuffer | null {
    this.isRecording = false;

    if (this.recordBuffer.length === 0) return null;

    // Create AudioBuffer from recorded data
    const audioBuffer = this.audioContext.createBuffer(
      DEFAULT_CHANNEL_COUNT,
      this.recordLength,
      this.audioContext.sampleRate,
    );

    const channelData = audioBuffer.getChannelData(0);
    let offset = 0;

    for (const buffer of this.recordBuffer) {
      channelData.set(buffer, offset);
      offset += buffer.length;
    }

    return audioBuffer;
  }

  setOnChunk(
    callback: (index: number, min: number, max: number) => void,
  ): void {
    this.onChunkCallback = callback;
  }

  setOnStart(callback: () => void): void {
    this.onStartCallback = callback;
  }
}

// Main AudioEngine class
export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private inputNodes: MediaStreamAudioSourceNode[] = [];
  private recorderNodes: BufferRecorderNode[] = [];
  private granularNodes: PGranularNode[] = [];
  private outputNodes: GainNode[] = [];
  private masterGainNode: GainNode | null = null;
  private messageQueue: RecordWaveMessage[] = [];
  private cursorTriggerQueue: CursorTriggerMessage[] = [];

  constructor() {
    // Initialize will be called when needed
  }

  async initialize(): Promise<void> {
    if (this.audioContext) return;

    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    // Create master gain
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);

    // Initialize nodes for each wave
    for (let i = 0; i < NUM_WAVES; i++) {
      // Output gain for each wave
      const outputGain = this.audioContext.createGain();
      outputGain.connect(this.masterGainNode);
      this.outputNodes.push(outputGain);

      // Granular synth for each wave
      const granular = new PGranularNode(this.audioContext, outputGain);
      this.granularNodes.push(granular);

      // Recorder for each wave
      const recorder = new BufferRecorderNode(this.audioContext);
      recorder.setOnChunk((index, min, max) => {
        this.messageQueue.push({
          cmd: Command.WAVE_CHUNK,
          index,
          arg1: min,
          arg2: max,
        });
      });
      recorder.setOnStart(() => {
        this.messageQueue.push({
          cmd: Command.WAVE_START,
          index: 0,
          arg1: 0,
          arg2: 0,
        });
      });
      this.recorderNodes.push(recorder);
    }
  }

  async setupInput(): Promise<void> {
    if (!this.audioContext) throw new Error("AudioContext not initialized");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: DEFAULT_SAMPLE_RATE,
          channelCount: DEFAULT_CHANNEL_COUNT,
        },
      });

      // Create input source for each wave
      for (let i = 0; i < NUM_WAVES; i++) {
        const inputSource = this.audioContext.createMediaStreamSource(stream);
        this.inputNodes.push(inputSource);

        // Connect input to recorder
        const recorder = this.recorderNodes[i];
        if (recorder) {
          inputSource.connect(recorder.scriptProcessor);
        }
      }
    } catch (error) {
      console.error("Failed to access microphone:", error);
      throw error;
    }
  }

  getSampleRate(): number {
    return this.audioContext?.sampleRate ?? DEFAULT_SAMPLE_RATE;
  }

  async record(waveIndex: WaveIndex): Promise<void> {
    if (!this.audioContext || waveIndex >= NUM_WAVES) return;

    await this.setupInput();
    const recorder = this.recorderNodes[waveIndex];
    if (recorder) {
      recorder.startRecording();
    }

    // Auto-stop after wave length
    setTimeout(() => {
      const recorder = this.recorderNodes[waveIndex];
      const granular = this.granularNodes[waveIndex];
      if (recorder && granular) {
        const buffer = recorder.stopRecording();
        if (buffer) {
          granular.setAudioBuffer(buffer);
        }
      }
    }, WAVE_LENGTH_SECONDS * 1000);
  }

  loopOn(waveIndex: WaveIndex): void {
    if (waveIndex >= NUM_WAVES) return;
    const granular = this.granularNodes[waveIndex];
    if (granular) {
      granular.setLoop(true);
    }
  }

  loopOff(waveIndex: WaveIndex): void {
    if (waveIndex >= NUM_WAVES) return;
    const granular = this.granularNodes[waveIndex];
    if (granular) {
      granular.setLoop(false);
    }
  }

  noteOn(waveIndex: WaveIndex, midiNote: number): void {
    if (waveIndex >= NUM_WAVES) return;
    const granular = this.granularNodes[waveIndex];
    if (granular) {
      granular.noteOn(midiNote);
    }

    // Add cursor trigger message
    this.cursorTriggerQueue.push({
      cmd: Command.TRIGGER_UPDATE,
      synthID: Date.now(), // Use timestamp as unique ID
    });
  }

  noteOff(waveIndex: WaveIndex): void {
    if (waveIndex >= NUM_WAVES) return;
    const granular = this.granularNodes[waveIndex];
    if (granular) {
      granular.noteOff();
    }

    // Add cursor end message
    this.cursorTriggerQueue.push({
      cmd: Command.TRIGGER_END,
      synthID: Date.now(),
    });
  }

  setSelectionStart(waveIndex: WaveIndex, start: number): void {
    if (waveIndex >= NUM_WAVES) return;
    const granular = this.granularNodes[waveIndex];
    if (granular) {
      granular.setSelectionStart(start);
    }
  }

  setSelectionSize(waveIndex: WaveIndex, size: number): void {
    if (waveIndex >= NUM_WAVES) return;
    const granular = this.granularNodes[waveIndex];
    if (granular) {
      granular.setSelectionSize(size);
    }
  }

  setGrainDurationCoeff(waveIndex: WaveIndex, coeff: number): void {
    if (waveIndex >= NUM_WAVES) return;
    const granular = this.granularNodes[waveIndex];
    if (granular) {
      granular.setGrainDurationCoeff(coeff);
    }
  }

  setFilterCutoff(waveIndex: WaveIndex, cutoff: number): void {
    if (waveIndex >= NUM_WAVES) return;
    const granular = this.granularNodes[waveIndex];
    if (granular) {
      granular.setFilterCutoff(cutoff);
    }
  }

  // Message queue management
  getRecordWaveAvailable(): number {
    return this.messageQueue.length;
  }

  readRecordWave(count: number): RecordWaveMessage[] {
    const messages = this.messageQueue.splice(0, count);
    return messages;
  }

  getCursorTriggerAvailable(): number {
    return this.cursorTriggerQueue.length;
  }

  readCursorTriggers(count: number): CursorTriggerMessage[] {
    const messages = this.cursorTriggerQueue.splice(0, count);
    return messages;
  }

  setMasterVolume(volume: number): void {
    if (!this.masterGainNode) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.masterGainNode.gain.setValueAtTime(
      clampedVolume,
      this.audioContext?.currentTime ?? 0,
    );
  }

  disconnect(): void {
    this.granularNodes.forEach((node) => node.disconnect());
    this.recorderNodes.forEach((node) => node.disconnect());
    this.inputNodes.forEach((node) => node.disconnect());

    if (this.masterGainNode) {
      this.masterGainNode.disconnect();
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
let audioEngineInstance: AudioEngine | null = null;

export const getAudioEngine = (): AudioEngine => {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
};
