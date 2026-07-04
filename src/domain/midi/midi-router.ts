import type { CollidoscopeConfig } from "../config/index.ts";
import type { ParsedMidiMessage } from "./midi-message.ts";
import { lmap, pitchBendValue } from "./midi-parser.ts";

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

export function routeMidiMessage(message: ParsedMidiMessage, options: MidiRouterOptions): void {
  if (message.voice === "ignore") {
    return;
  }

  if (message.channel !== options.waveChannel) {
    return;
  }

  const { ccMappings } = options.config.midi;
  const { actions } = options;
  const maxSelectionSize = options.config.audio.maxSelectionSize;
  const maxDuration = options.config.granular.grainDurationRange.max;

  switch (message.voice) {
    case "noteOn":
      actions.noteOn(message.data1);
      break;
    case "noteOff":
      actions.noteOff(message.data1);
      break;
    case "pitchBend": {
      const value = pitchBendValue(message.data1, message.data2);
      if (value > options.config.midi.pitchBendRange.max) {
        return;
      }
      actions.setSelectionStart(Math.round(value));
      break;
    }
    case "controlChange": {
      const controller = message.data1;
      const midiVal = message.data2;

      if (controller === ccMappings.selectionSize) {
        const size = Math.round(lmap(midiVal, 0, 127, 1, maxSelectionSize));
        actions.setSelectionSize(size);
        return;
      }
      if (controller === ccMappings.grainDuration) {
        const coeff = lmap(midiVal, 0, 127, 1, maxDuration);
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
      break;
    }
    default:
      break;
  }
}
