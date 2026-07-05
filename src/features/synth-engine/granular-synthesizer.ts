import { MIDI_CC_MAX } from "../../consts/midi.ts";
import { midiNoteToRate, midiToFilterCutoff } from "../../domain/audio/index.ts";
import type { CollidoscopeConfig } from "../../domain/config/index.ts";
import type {
  GranularWorkletInputMessage,
  GranularWorkletOutputMessage,
} from "./worklets/granular-messages.ts";
import granularProcessorUrl from "./worklets/granular-processor.ts?worker&url";

export type GranularMessageHandler = (message: GranularWorkletOutputMessage) => void;

export class GranularSynthesizer {
  private readonly audioContext: AudioContext;
  private workletNode: AudioWorkletNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private messageHandler: GranularMessageHandler | null = null;
  private isModuleLoaded = false;
  private minCutoff = 200;
  private maxCutoff = 22050;
  private qFactor = Math.SQRT1_2;
  private lastFilterMidi = MIDI_CC_MAX;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async initialize(): Promise<void> {
    if (this.isModuleLoaded) {
      return;
    }

    await this.audioContext.audioWorklet.addModule(granularProcessorUrl);
    this.isModuleLoaded = true;

    this.workletNode = new AudioWorkletNode(this.audioContext, "granular-processor", {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    });

    this.filterNode = this.audioContext.createBiquadFilter();
    this.filterNode.type = "lowpass";
    this.filterNode.Q.value = this.qFactor;
    this.filterNode.frequency.value = this.maxCutoff;

    this.gainNode = this.audioContext.createGain();

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;

    this.workletNode.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.connect(this.analyserNode);

    this.workletNode.port.onmessage = (event: MessageEvent<GranularWorkletOutputMessage>) => {
      this.messageHandler?.(event.data);
    };
  }

  setMessageHandler(handler: GranularMessageHandler | null): void {
    this.messageHandler = handler;
  }

  private postMessage(message: GranularWorkletInputMessage, transfer?: Transferable[]): void {
    if (!this.workletNode) {
      return;
    }
    if (transfer) {
      this.workletNode.port.postMessage(message, transfer);
    } else {
      this.workletNode.port.postMessage(message);
    }
  }

  setAudioBuffer(buffer: Float32Array): void {
    const copy = new Float32Array(buffer);
    this.postMessage({ type: "setBuffer", buffer: copy }, [copy.buffer]);
  }

  setSelection(startSample: number, sizeSamples: number): void {
    this.postMessage({ type: "setSelection", startSample, sizeSamples });
  }

  noteOn(midiNote: number): void {
    const rate = midiNoteToRate(midiNote);
    this.postMessage({ type: "noteOn", midiNote, rate });
  }

  noteOff(midiNote: number): void {
    this.postMessage({ type: "noteOff", midiNote });
  }

  setLooping(enabled: boolean): void {
    this.postMessage({ type: "setLooping", enabled });
  }

  setGrainDurationCoeff(coeff: number): void {
    this.postMessage({ type: "setGrainDurationCoeff", coeff });
  }

  setAttenuation(value: number): void {
    this.postMessage({ type: "setAttenuation", value });
  }

  setFilterCutoff(midiValue: number): void {
    this.lastFilterMidi = Math.max(0, Math.min(MIDI_CC_MAX, Math.round(midiValue)));
    this.applyFilterFrequency();
  }

  private applyFilterFrequency(): void {
    if (!this.filterNode) {
      return;
    }
    this.filterNode.frequency.value = midiToFilterCutoff(
      this.lastFilterMidi,
      this.minCutoff,
      this.maxCutoff,
    );
  }

  setFilterConfig(minCutoff: number, maxCutoff: number, qFactor: number): void {
    this.minCutoff = minCutoff;
    this.maxCutoff = maxCutoff;
    this.qFactor = qFactor;
    if (this.filterNode) {
      this.filterNode.Q.value = qFactor;
      this.applyFilterFrequency();
    }
  }

  updateConfig(config: CollidoscopeConfig): void {
    this.setFilterConfig(config.filter.minCutoff, config.filter.maxCutoff, config.filter.qFactor);
    this.postMessage({
      type: "updateConfig",
      maxGrains: config.granular.maxGrains,
      minGrainDuration: config.granular.minGrainDuration,
      maxVoices: config.granular.maxVoices,
      attackTime: config.envelope.attackTime,
      releaseTime: config.envelope.releaseTime,
      sustainLevel: config.envelope.sustainLevel,
    });
    this.setAttenuation(config.audio.attenuation);
  }

  get outputNode(): GainNode | null {
    return this.gainNode;
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  dispose(): void {
    this.workletNode?.disconnect();
    this.filterNode?.disconnect();
    this.gainNode?.disconnect();
    this.analyserNode?.disconnect();
    this.workletNode = null;
    this.filterNode = null;
    this.gainNode = null;
    this.analyserNode = null;
    this.messageHandler = null;
  }
}
