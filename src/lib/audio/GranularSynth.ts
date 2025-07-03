/**
 * GranularSynth.ts - Web Audio API implementation of granular synthesizer
 * Based on the original PGranular implementation from OpenCollidoscope
 */

import { AUDIO_CONSTANTS } from "../../types/audio";

// Remove unused AudioGrain import to fix ESLint error

interface GrainData {
  id: number;
  active: boolean;
  source: AudioBufferSourceNode | null;
  gain: GainNode | null;
  envelope: GainNode | null;
  startTime: number;
  duration: number;
  rate: number;
  phase: number;
}

export class GranularSynth {
  private audioContext: AudioContext;
  private output: GainNode;
  private filterNode: BiquadFilterNode;
  private masterGain: GainNode;

  // Granular parameters (matching original)
  private maxGrains: number = AUDIO_CONSTANTS.MAX_GRAINS;
  private minGrainDuration: number = 0.04; // 40ms minimum (640 samples at 16kHz)
  private grainDurationCoeff: number = 1.0;
  private selectionStart: number = 0;
  private selectionSize: number = 64;
  private attenuation: number = 0.25; // -12dB default attenuation

  // Audio buffer and state
  private sourceBuffer: AudioBuffer | null = null;
  private grains: GrainData[] = [];
  private activeGrains: number = 0;
  private isLooping: boolean = false;
  private isNoteOn: boolean = false;

  // ASR Envelope parameters (matching original)
  private attackTime: number = AUDIO_CONSTANTS.ATTACK_TIME;
  private releaseTime: number = AUDIO_CONSTANTS.RELEASE_TIME;

  // Note tracking for polyphony
  private activeNotes: Map<number, { rate: number; velocity: number }> =
    new Map();
  private nextGrainId: number = 0;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.output = audioContext.createGain();
    this.filterNode = audioContext.createBiquadFilter();
    this.masterGain = audioContext.createGain();

    this.setupAudioGraph();
    this.initializeGrains();
  }

  private setupAudioGraph(): void {
    // Filter setup (low pass)
    this.filterNode.type = "lowpass";
    this.filterNode.frequency.value = 22050; // Max frequency
    this.filterNode.Q.value = 0.707;

    // Master gain setup
    this.masterGain.gain.value = this.attenuation;

    // Audio routing: grains -> filter -> master gain -> output
    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.output);
  }

  private initializeGrains(): void {
    this.grains = [];
    for (let i = 0; i < this.maxGrains; i++) {
      this.grains.push({
        id: i,
        active: false,
        source: null,
        gain: null,
        envelope: null,
        startTime: 0,
        duration: 0,
        rate: 1.0,
        phase: 0,
      });
    }
  }

  setBuffer(audioBuffer: AudioBuffer): void {
    this.sourceBuffer = audioBuffer;
    this.stopAllGrains();
    console.log("Buffer set:", audioBuffer.duration, "seconds");
  }

  setMasterVolume(volume: number): void {
    this.masterGain.gain.value = volume * this.attenuation;
  }

  setGrainDurationCoeff(coeff: number): void {
    this.grainDurationCoeff = Math.max(1.0, Math.min(8.0, coeff));
  }

  setFilterCutoff(midiValue: number): void {
    // Convert MIDI value (0-127) to frequency (50Hz - 22050Hz)
    const minCutoff = AUDIO_CONSTANTS.FILTER_MIN_FREQ;
    const maxCutoff = AUDIO_CONSTANTS.FILTER_MAX_FREQ;
    const normalizedValue = midiValue / 127;

    // Exponential scaling for more musical control
    const frequency =
      minCutoff * Math.pow(maxCutoff / minCutoff, normalizedValue);
    this.filterNode.frequency.value = frequency;
  }

  setSelection(start: number, size: number): void {
    this.selectionStart = start;
    this.selectionSize = size;
  }

  noteOn(rate: number = 1.0, velocity: number = 0.8): void {
    if (!this.sourceBuffer) return;

    this.isNoteOn = true;

    if (this.isLooping) {
      this.startLoopGrains(rate, velocity);
    } else {
      this.triggerGrain(rate, velocity);
    }
  }

  noteOff(): void {
    this.isNoteOn = false;
    this.stopLoopGrains();
  }

  loopOn(): void {
    this.isLooping = true;
    if (this.isNoteOn) {
      this.startLoopGrains(1.0, 0.8);
    }
  }

  loopOff(): void {
    this.isLooping = false;
    this.stopLoopGrains();
  }

  private triggerGrain(rate: number = 1.0, velocity: number = 0.8): void {
    if (!this.sourceBuffer) return;

    const grain = this.getNextAvailableGrain();
    if (!grain) return;

    this.setupGrain(grain, rate, velocity, false);
  }

  private startLoopGrains(rate: number = 1.0, velocity: number = 0.8): void {
    if (!this.sourceBuffer || !this.isLooping) return;

    // Calculate trigger interval based on selection size
    const selectionDuration = this.getSelectionDuration();
    const triggerInterval = selectionDuration / this.grainDurationCoeff;

    // Schedule first grain immediately
    this.triggerGrain(rate, velocity);

    // Schedule subsequent grains
    this.scheduleLoopGrains(rate, velocity, triggerInterval);
  }

  private scheduleLoopGrains(
    rate: number,
    velocity: number,
    interval: number,
  ): void {
    if (!this.isLooping || !this.isNoteOn) return;

    setTimeout(() => {
      if (this.isLooping && this.isNoteOn) {
        this.triggerGrain(rate, velocity);
        this.scheduleLoopGrains(rate, velocity, interval);
      }
    }, interval * 1000);
  }

  private stopLoopGrains(): void {
    this.isLooping = false;
    // Note: individual grains will stop naturally when their envelopes finish
  }

  private getNextAvailableGrain(): GrainData | null {
    for (const grain of this.grains) {
      if (!grain.active) {
        return grain;
      }
    }
    return null; // No available grains
  }

  private setupGrain(
    grain: GrainData,
    rate: number,
    velocity: number,
    _isLoop: boolean = false,
  ): void {
    const currentTime = this.audioContext.currentTime;

    // Calculate grain parameters
    const selectionDuration = this.getSelectionDuration();
    const grainDuration = Math.max(
      this.minGrainDuration,
      selectionDuration * this.grainDurationCoeff,
    );

    // Create audio nodes for this grain
    grain.source = this.audioContext.createBufferSource();
    grain.gain = this.audioContext.createGain();
    grain.envelope = this.audioContext.createGain();

    // Set buffer and playback rate
    grain.source.buffer = this.sourceBuffer;
    grain.source.playbackRate.value = rate;

    // Calculate random offset (matching original behavior)
    const randomOffset = Math.random() * (this.audioContext.sampleRate / 100);
    const startOffset =
      this.getSelectionStartTime() +
      randomOffset / this.audioContext.sampleRate;

    // Connect audio graph for this grain
    grain.source.connect(grain.gain);
    grain.gain.connect(grain.envelope);
    grain.envelope.connect(this.filterNode);

    // Setup gain (velocity and attenuation)
    grain.gain.gain.value = velocity * this.attenuation;

    // Setup Hann window envelope (matching original raised cosine bell)
    this.setupHannEnvelope(grain.envelope, currentTime, grainDuration);

    // Setup grain properties
    grain.active = true;
    grain.startTime = currentTime;
    grain.duration = grainDuration;
    grain.rate = rate;
    grain.id = this.nextGrainId++;

    // Start playback
    grain.source.start(currentTime, startOffset, grainDuration);

    // Schedule cleanup
    grain.source.addEventListener("ended", () => {
      this.cleanupGrain(grain);
    });

    // Stop after duration
    grain.source.stop(currentTime + grainDuration);

    this.activeGrains++;
  }

  private setupHannEnvelope(
    envelopeNode: GainNode,
    startTime: number,
    duration: number,
  ): void {
    const envelope = envelopeNode.gain;

    // Hann window: 0.5 * (1 - cos(2π * t / duration))
    // Implemented as attack-sustain-release for simplicity

    envelope.setValueAtTime(0, startTime);
    envelope.linearRampToValueAtTime(1, startTime + this.attackTime);
    envelope.setValueAtTime(1, startTime + duration - this.releaseTime);
    envelope.linearRampToValueAtTime(0, startTime + duration);
  }

  private cleanupGrain(grain: GrainData): void {
    if (grain.source) {
      grain.source.disconnect();
      grain.source = null;
    }
    if (grain.gain) {
      grain.gain.disconnect();
      grain.gain = null;
    }
    if (grain.envelope) {
      grain.envelope.disconnect();
      grain.envelope = null;
    }

    grain.active = false;
    this.activeGrains = Math.max(0, this.activeGrains - 1);
  }

  stopAllGrains(): void {
    for (const grain of this.grains) {
      if (grain.active && grain.source) {
        grain.source.stop();
        this.cleanupGrain(grain);
      }
    }
    this.activeGrains = 0;
  }

  private getSelectionStartTime(): number {
    if (!this.sourceBuffer) return 0;

    // Convert chunk position to time
    const chunksPerSecond =
      AUDIO_CONSTANTS.DEFAULT_CHUNKS / this.sourceBuffer.duration;
    return this.selectionStart / chunksPerSecond;
  }

  private getSelectionDuration(): number {
    if (!this.sourceBuffer) return this.minGrainDuration;

    // Convert chunk size to duration
    const chunksPerSecond =
      AUDIO_CONSTANTS.DEFAULT_CHUNKS / this.sourceBuffer.duration;
    return Math.max(
      this.minGrainDuration,
      this.selectionSize / chunksPerSecond,
    );
  }

  getActiveGrainCount(): number {
    return this.activeGrains;
  }

  connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  disconnect(): void {
    this.output.disconnect();
  }

  destroy(): void {
    this.stopAllGrains();
    this.disconnect();

    this.filterNode?.disconnect();
    this.masterGain?.disconnect();
    this.output?.disconnect();
  }
}

// Utility class for envelope generation
export class ASREnvelope {
  private audioContext: AudioContext;
  private attackTime: number;
  private sustainLevel: number;
  private releaseTime: number;
  private state: "idle" | "attack" | "sustain" | "release" = "idle";

  constructor(
    audioContext: AudioContext,
    attackTime: number = AUDIO_CONSTANTS.ATTACK_TIME,
    sustainLevel: number = 1.0,
    releaseTime: number = AUDIO_CONSTANTS.RELEASE_TIME,
  ) {
    this.audioContext = audioContext;
    this.attackTime = attackTime;
    this.sustainLevel = sustainLevel;
    this.releaseTime = releaseTime;
  }

  trigger(gainNode: GainNode, startTime: number, duration: number): void {
    const gain = gainNode.gain;

    gain.setValueAtTime(0, startTime);
    gain.linearRampToValueAtTime(
      this.sustainLevel,
      startTime + this.attackTime,
    );

    const releaseStartTime = startTime + duration - this.releaseTime;
    gain.setValueAtTime(this.sustainLevel, releaseStartTime);
    gain.linearRampToValueAtTime(0, startTime + duration);
  }
}
