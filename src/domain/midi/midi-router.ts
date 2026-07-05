import { MIDI_CC_MAX } from "../../consts/midi.ts";
import type { CollidoscopeConfig } from "../config/index.ts";
import type { ParsedMidiMessage } from "./midi-message.ts";
import { decodePitchBend, linearMap } from "./midi-parser.ts";

export interface MidiRouterActions {
  noteOn: (midiNote: number) => void;
  noteOff: (midiNote: number) => void;
  setSelectionStart: (start: number) => void;
  setSelectionSize: (size: number) => void;
  setGrainDurationCoeff: (coeff: number) => void;
  setLoopEnabled: (enabled: boolean) => void;
  triggerRecord: () => void;
  setFilterCutoff: (value: number) => void;
}

export interface MidiRouterOptions {
  waveChannel: number;
  config: CollidoscopeConfig;
  actions: MidiRouterActions;
}

type MidiVoiceHandler = (message: ParsedMidiMessage, options: MidiRouterOptions) => void;

function handleNoteOn(message: ParsedMidiMessage, { actions }: MidiRouterOptions): void {
  actions.noteOn(message.data1);
}

function handleNoteOff(message: ParsedMidiMessage, { actions }: MidiRouterOptions): void {
  actions.noteOff(message.data1);
}

function handlePitchBend(message: ParsedMidiMessage, options: MidiRouterOptions): void {
  const value = decodePitchBend(message.data1, message.data2);
  if (value > options.config.midi.pitchBendRange.max) {
    return;
  }
  options.actions.setSelectionStart(Math.round(value));
}

function handleControlChange(message: ParsedMidiMessage, options: MidiRouterOptions): void {
  const { ccMappings } = options.config.midi;
  const { actions } = options;
  const maxSelectionSize = options.config.audio.maxSelectionSize;
  const maxDuration = options.config.granular.grainDurationRange.max;
  const controller = message.data1;
  const midiVal = message.data2;

  if (controller === ccMappings.selectionSize) {
    const size = Math.round(linearMap(midiVal, 0, MIDI_CC_MAX, 1, maxSelectionSize));
    actions.setSelectionSize(size);
    return;
  }
  if (controller === ccMappings.grainDuration) {
    const coeff = linearMap(midiVal, 0, MIDI_CC_MAX, 1, maxDuration);
    actions.setGrainDurationCoeff(coeff);
    return;
  }
  if (controller === ccMappings.loopToggle) {
    actions.setLoopEnabled(midiVal > 0);
    return;
  }
  if (controller === ccMappings.recordTrigger) {
    if (midiVal > 0) {
      actions.triggerRecord();
    }
    return;
  }
  if (controller === ccMappings.filterCutoff) {
    actions.setFilterCutoff(midiVal);
  }
}

const MIDI_VOICE_HANDLERS: Record<
  Exclude<ParsedMidiMessage["voice"], "ignore">,
  MidiVoiceHandler
> = {
  noteOn: handleNoteOn,
  noteOff: handleNoteOff,
  pitchBend: handlePitchBend,
  controlChange: handleControlChange,
};

export function routeMidiMessage(message: ParsedMidiMessage, options: MidiRouterOptions): void {
  if (message.voice === "ignore") {
    return;
  }

  if (message.channel !== options.waveChannel) {
    return;
  }

  MIDI_VOICE_HANDLERS[message.voice](message, options);
}
