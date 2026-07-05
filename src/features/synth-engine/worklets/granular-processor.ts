import { EnvASR, EnvASRState } from "../../../domain/audio/env-asr.ts";
import {
  clampSelectionSize,
  computeGrainDuration,
  computeHannCoefficients,
  interpolateLinear,
  tickHann,
} from "../../../domain/audio/index.ts";
import type {
  GranularWorkletInputMessage,
  GranularWorkletOutputMessage,
} from "./granular-messages.ts";

const DEFAULT_MAX_GRAINS = 32;
const DEFAULT_MIN_GRAIN_DURATION = 640;
const DEFAULT_MAX_VOICES = 6;
const DEFAULT_ATTACK_TIME = 0.01;
const DEFAULT_RELEASE_TIME = 0.05;
const DEFAULT_SUSTAIN_LEVEL = 1.0;
const DEFAULT_ATTENUATION = 0.25118864315096;
const NO_MIDI_NOTE = -50;
const LOOP_VOICE_ID = -1;

interface PGrain {
  phase: number;
  rate: number;
  alive: boolean;
  age: number;
  duration: number;
  b1: number;
  y1: number;
  y2: number;
}

type TriggerCallback = (msgType: "t" | "e", voiceId: number, samplePosition?: number) => void;

class PGranular {
  private readonly grains: PGrain[];
  private numAliveGrains = 0;
  private buffer: Float32Array | null = null;
  private bufferLen = 0;
  private grainsStart = 0;
  private grainsDuration = DEFAULT_MIN_GRAIN_DURATION;
  private grainsDurationCoeff = 1;
  private grainsRate = 1.0;
  private trigger = 0;
  private triggerRate = 0;
  private attenuation = DEFAULT_ATTENUATION;
  private readonly envASR: EnvASR;
  private readonly randomOffsetMax: number;
  private readonly triggerCallback: TriggerCallback;
  private readonly voiceId: number;
  private readonly maxGrains: number;
  private readonly minGrainDuration: number;

  constructor(
    sampleRate: number,
    voiceId: number,
    triggerCallback: TriggerCallback,
    maxGrains: number,
    minGrainDuration: number,
    attackTime: number,
    releaseTime: number,
    sustainLevel: number,
  ) {
    this.voiceId = voiceId;
    this.triggerCallback = triggerCallback;
    this.maxGrains = maxGrains;
    this.minGrainDuration = minGrainDuration;
    this.randomOffsetMax = Math.floor(sampleRate / 100);
    this.envASR = new EnvASR(sustainLevel, attackTime, releaseTime, sampleRate);
    this.grains = Array.from({ length: maxGrains }, () => ({
      phase: 0,
      rate: 1,
      alive: false,
      age: 0,
      duration: 1,
      b1: 0,
      y1: 0,
      y2: 0,
    }));
  }

  setBuffer(buffer: Float32Array): void {
    this.buffer = buffer;
    this.bufferLen = buffer.length;
  }

  setGrainsDurationCoeff(coeff: number): void {
    this.grainsDurationCoeff = coeff;
    this.grainsDuration = computeGrainDuration(
      this.triggerRate,
      this.grainsDurationCoeff,
      this.minGrainDuration,
    );
  }

  setGrainsRate(rate: number): void {
    this.grainsRate = rate;
  }

  setSelectionStart(start: number): void {
    this.grainsStart = start;
  }

  setSelectionSize(size: number): void {
    const clamped = clampSelectionSize(size, this.minGrainDuration);
    this.triggerRate = clamped;
    this.grainsDuration = computeGrainDuration(
      clamped,
      this.grainsDurationCoeff,
      this.minGrainDuration,
    );
  }

  setAttenuation(attenuation: number): void {
    this.attenuation = attenuation;
  }

  noteOn(rate: number): void {
    if (this.envASR.isIdle) {
      if (this.triggerRate < this.minGrainDuration) {
        this.triggerRate = this.minGrainDuration;
      }
      this.setGrainsRate(rate);
      this.envASR.setState(EnvASRState.Attack);
    }
  }

  noteOff(): void {
    if (!this.envASR.isIdle) {
      this.envASR.setState(EnvASRState.Release);
    }
  }

  isIdle(): boolean {
    return this.envASR.isIdle;
  }

  process(audioOut: Float32Array, tempBuffer: Float32Array, numSamples: number): void {
    let envSamples = 0;
    let becameIdle = false;

    for (let i = 0; i < numSamples; i++) {
      tempBuffer[i] = this.envASR.tick();
      envSamples++;

      if (this.isIdle()) {
        becameIdle = true;
        break;
      }
    }

    this.processGrains(audioOut, tempBuffer, envSamples);

    if (becameIdle) {
      this.triggerCallback("e", this.voiceId);
      this.reset();
    }
  }

  private processGrains(
    audioOut: Float32Array,
    envelopeValues: Float32Array,
    numSamples: number,
  ): void {
    for (let grainIdx = 0; grainIdx < this.numAliveGrains; ) {
      const grain = this.grains[grainIdx];
      if (!grain) {
        break;
      }

      this.synthesizeGrain(grain, audioOut, envelopeValues, numSamples);

      if (!grain.alive) {
        this.copyGrain(this.numAliveGrains - 1, grainIdx);
        this.numAliveGrains--;
      } else {
        grainIdx++;
      }
    }

    if (this.triggerRate === 0 || !this.buffer) {
      return;
    }

    const randOffset = Math.floor(Math.random() * this.randomOffsetMax);
    let newGrainWasTriggered = false;

    while (this.trigger < numSamples) {
      if (this.numAliveGrains < this.maxGrains) {
        const grainIdx = this.numAliveGrains;
        this.numAliveGrains++;

        const grain = this.grains[grainIdx];
        if (!grain) {
          break;
        }

        let phase = this.grainsStart + randOffset;
        if (phase >= this.bufferLen) {
          phase -= this.bufferLen;
        }

        grain.phase = phase;
        grain.rate = this.grainsRate;
        grain.alive = true;
        grain.age = 0;
        grain.duration = this.grainsDuration;

        const hann = computeHannCoefficients(grain.duration);
        grain.b1 = hann.b1;
        grain.y1 = hann.y1;
        grain.y2 = hann.y2;

        const offset = this.trigger;
        this.synthesizeGrain(
          grain,
          audioOut.subarray(offset),
          envelopeValues.subarray(offset),
          numSamples - offset,
        );

        if (!grain.alive) {
          this.numAliveGrains--;
        }

        newGrainWasTriggered = true;
      }

      this.trigger += this.triggerRate;
    }

    this.trigger -= numSamples;

    if (newGrainWasTriggered) {
      const lastTriggeredGrain = this.grains[this.numAliveGrains - 1];
      this.triggerCallback("t", this.voiceId, lastTriggeredGrain?.phase ?? this.grainsStart);
    }
  }

  private synthesizeGrain(
    grain: PGrain,
    audioOut: Float32Array,
    envelopeValues: Float32Array,
    numSamples: number,
  ): void {
    if (!this.buffer) {
      return;
    }

    const rate = grain.rate;
    let phase = grain.phase;
    let age = grain.age;
    const duration = grain.duration;
    let b1 = grain.b1;
    let y1 = grain.y1;
    let y2 = grain.y2;

    const numSamplesToOut = Math.min(numSamples, duration - age);

    for (let sampleIdx = 0; sampleIdx < numSamplesToOut; sampleIdx++) {
      const readIndex = Math.floor(phase);
      const nextReadIndex = readIndex === this.bufferLen - 1 ? 0 : readIndex + 1;
      const decimal = phase - readIndex;

      const sample0 = this.buffer[readIndex] ?? 0;
      const sample1 = this.buffer[nextReadIndex] ?? 0;
      let out = interpolateLinear(sample0, sample1, decimal);

      const hann = tickHann({ b1, y1, y2 });
      out *= hann.y0;
      b1 = hann.state.b1;
      y1 = hann.state.y1;
      y2 = hann.state.y2;

      audioOut[sampleIdx] =
        (audioOut[sampleIdx] ?? 0) + out * (envelopeValues[sampleIdx] ?? 0) * this.attenuation;

      age++;
      phase += rate;

      if (phase >= this.bufferLen) {
        phase -= this.bufferLen;
      }
    }

    if (age === duration) {
      grain.alive = false;
    } else {
      grain.phase = phase;
      grain.age = age;
      grain.y1 = y1;
      grain.y2 = y2;
    }
  }

  private copyGrain(from: number, to: number): void {
    const source = this.grains[from];
    const target = this.grains[to];
    if (source && target) {
      this.grains[to] = { ...source };
    }
  }

  private reset(): void {
    this.trigger = 0;
    for (let i = 0; i < this.numAliveGrains; i++) {
      const grain = this.grains[i];
      if (grain) {
        grain.alive = false;
      }
    }
    this.numAliveGrains = 0;
  }
}

class LazyParam<T> {
  private value: T;
  private previousValue: T;
  private dirty = false;

  constructor(initial: T) {
    this.value = initial;
    this.previousValue = initial;
  }

  set(val: T): void {
    this.value = val;
  }

  get(): T | null {
    if (this.dirty || this.value !== this.previousValue) {
      this.previousValue = this.value;
      this.dirty = false;
      return this.value;
    }
    return null;
  }

  invalidate(): void {
    this.dirty = true;
  }
}

class GranularProcessor extends AudioWorkletProcessor {
  private buffer: Float32Array | null = null;
  private loopVoice: PGranular | null = null;
  private noteVoices: PGranular[] = [];
  private midiNotes: number[] = [];
  private maxVoices = DEFAULT_MAX_VOICES;
  private maxGrains = DEFAULT_MAX_GRAINS;
  private minGrainDuration = DEFAULT_MIN_GRAIN_DURATION;
  private attackTime = DEFAULT_ATTACK_TIME;
  private releaseTime = DEFAULT_RELEASE_TIME;
  private sustainLevel = DEFAULT_SUSTAIN_LEVEL;
  private attenuation = DEFAULT_ATTENUATION;
  private readonly selectionStart = new LazyParam(0);
  private readonly selectionSize = new LazyParam(0);
  private readonly grainDurationCoeff = new LazyParam(1);
  private readonly tempBuffer: Float32Array;

  constructor() {
    super();
    this.tempBuffer = new Float32Array(128);

    this.port.onmessage = (event: MessageEvent<GranularWorkletInputMessage>) => {
      this.handleMessage(event.data);
    };
  }

  private handleMessage(message: GranularWorkletInputMessage): void {
    switch (message.type) {
      case "setBuffer":
        this.setBuffer(message.buffer);
        break;
      case "setSelection":
        this.selectionStart.set(message.startSample);
        this.selectionSize.set(message.sizeSamples);
        break;
      case "noteOn":
        this.handleNoteOn(message.midiNote, message.rate);
        break;
      case "noteOff":
        this.handleNoteOff(message.midiNote);
        break;
      case "setLooping":
        if (message.enabled) {
          this.loopVoice?.noteOn(1.0);
        } else {
          this.loopVoice?.noteOff();
        }
        break;
      case "setGrainDurationCoeff":
        this.grainDurationCoeff.set(message.coeff);
        break;
      case "setAttenuation":
        this.attenuation = message.value;
        this.applyAttenuation();
        break;
      case "updateConfig":
        this.updateConfig(message);
        break;
    }
  }

  private setBuffer(buffer: Float32Array | SharedArrayBuffer): void {
    this.buffer = buffer instanceof SharedArrayBuffer ? new Float32Array(buffer) : buffer;
    this.ensureVoices();
    this.applyBufferToVoices();
  }

  private ensureVoices(): void {
    if (this.loopVoice) {
      return;
    }

    const triggerCallback = (msgType: "t" | "e", voiceId: number, samplePosition?: number) => {
      const message: GranularWorkletOutputMessage =
        msgType === "t"
          ? { type: "cursorTrigger", voiceId, samplePosition: samplePosition ?? 0 }
          : { type: "cursorEnd", voiceId };
      this.port.postMessage(message);
    };

    this.loopVoice = new PGranular(
      sampleRate,
      LOOP_VOICE_ID,
      triggerCallback,
      this.maxGrains,
      this.minGrainDuration,
      this.attackTime,
      this.releaseTime,
      this.sustainLevel,
    );

    this.noteVoices = [];
    this.midiNotes = [];
    for (let i = 0; i < this.maxVoices; i++) {
      this.noteVoices.push(
        new PGranular(
          sampleRate,
          i,
          triggerCallback,
          this.maxGrains,
          this.minGrainDuration,
          this.attackTime,
          this.releaseTime,
          this.sustainLevel,
        ),
      );
      this.midiNotes.push(NO_MIDI_NOTE);
    }
  }

  private applyBufferToVoices(): void {
    if (!this.buffer) {
      return;
    }
    this.loopVoice?.setBuffer(this.buffer);
    for (const voice of this.noteVoices) {
      voice.setBuffer(this.buffer);
    }
  }

  private applyAttenuation(): void {
    this.loopVoice?.setAttenuation(this.attenuation);
    for (const voice of this.noteVoices) {
      voice.setAttenuation(this.attenuation);
    }
  }

  private updateConfig(message: {
    maxGrains: number;
    minGrainDuration: number;
    maxVoices: number;
    attackTime: number;
    releaseTime: number;
    sustainLevel: number;
  }): void {
    this.maxGrains = message.maxGrains;
    this.minGrainDuration = message.minGrainDuration;
    this.maxVoices = message.maxVoices;
    this.attackTime = message.attackTime;
    this.releaseTime = message.releaseTime;
    this.sustainLevel = message.sustainLevel;
    this.loopVoice = null;
    this.noteVoices = [];
    this.midiNotes = [];
    this.selectionStart.invalidate();
    this.selectionSize.invalidate();
    this.grainDurationCoeff.invalidate();
    this.ensureVoices();
    this.applyBufferToVoices();
    this.applyAttenuation();
  }

  private applySelectionParams(): void {
    const size = this.selectionSize.get();
    if (size !== null) {
      this.loopVoice?.setSelectionSize(size);
      for (const voice of this.noteVoices) {
        voice.setSelectionSize(size);
      }
    }

    const start = this.selectionStart.get();
    if (start !== null) {
      this.loopVoice?.setSelectionStart(start);
      for (const voice of this.noteVoices) {
        voice.setSelectionStart(start);
      }
    }

    const coeff = this.grainDurationCoeff.get();
    if (coeff !== null) {
      this.loopVoice?.setGrainsDurationCoeff(coeff);
      for (const voice of this.noteVoices) {
        voice.setGrainsDurationCoeff(coeff);
      }
    }
  }

  private handleNoteOn(midiNote: number, rate: number): void {
    for (let i = 0; i < this.maxVoices; i++) {
      if (this.midiNotes[i] === midiNote) {
        this.noteVoices[i]?.noteOn(rate);
        return;
      }
    }

    for (let i = 0; i < this.maxVoices; i++) {
      if (this.midiNotes[i] === NO_MIDI_NOTE) {
        this.noteVoices[i]?.noteOn(rate);
        this.midiNotes[i] = midiNote;
        return;
      }
    }
  }

  private handleNoteOff(midiNote: number): void {
    for (let i = 0; i < this.maxVoices; i++) {
      const voice = this.noteVoices[i];
      if (voice && !voice.isIdle() && this.midiNotes[i] === midiNote) {
        voice.noteOff();
        return;
      }
    }
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const output = outputs[0]?.[0];
    if (!output || !this.buffer || !this.loopVoice) {
      return true;
    }

    output.fill(0);
    this.applySelectionParams();

    if (!this.loopVoice.isIdle()) {
      this.loopVoice.process(output, this.tempBuffer, output.length);
    }

    for (let i = 0; i < this.maxVoices; i++) {
      const voice = this.noteVoices[i];
      if (!voice || voice.isIdle()) {
        continue;
      }

      voice.process(output, this.tempBuffer, output.length);

      if (voice.isIdle()) {
        this.midiNotes[i] = NO_MIDI_NOTE;
      }
    }

    return true;
  }
}

registerProcessor("granular-processor", GranularProcessor);
