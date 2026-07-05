import {
  MIDI_CC_MAX,
  MIDI_CHANNEL_MASK,
  MIDI_PITCH_BEND_LSB_SHIFT,
  MidiStatusNibble,
} from "../../consts/midi.ts";
import type { ParsedMidiMessage } from "./midi-message.ts";

export function voiceNibble(status: number): number {
  return status >> 4;
}

export function channelNibble(status: number): number {
  return status & MIDI_CHANNEL_MASK;
}

export function decodePitchBend(data1: number, data2: number): number {
  return (data2 << MIDI_PITCH_BEND_LSB_SHIFT) | data1;
}

export function parseMidiMessage(data: Uint8Array): ParsedMidiMessage | null {
  if (data.length < 2) {
    return null;
  }

  const status = data[0];
  if (status === undefined) {
    return null;
  }

  const voice = voiceNibble(status);
  const channel = channelNibble(status);
  const data1 = data[1] ?? 0;
  const data2 = data.length >= 3 ? (data[2] ?? 0) : 0;

  switch (voice) {
    case MidiStatusNibble.NoteOn: {
      if (data2 === 0) {
        return { voice: "noteOff", channel, data1, data2: 0 };
      }
      return { voice: "noteOn", channel, data1, data2 };
    }
    case MidiStatusNibble.NoteOff:
      return { voice: "noteOff", channel, data1, data2 };
    case MidiStatusNibble.ControlChange:
      return { voice: "controlChange", channel, data1, data2 };
    case MidiStatusNibble.PitchBend:
      return { voice: "pitchBend", channel, data1, data2 };
    default:
      return { voice: "ignore", channel, data1, data2 };
  }
}

/** @deprecated pitchBendValue のエイリアス。decodePitchBend を使用してください。 */
export function pitchBendValue(data1: number, data2: number): number {
  return decodePitchBend(data1, data2);
}

/** Processing/Arduino 互換の線形マップ */
export function linearMap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) {
    return outMin;
  }
  const ratio = (value - inMin) / (inMax - inMin);
  return outMin + ratio * (outMax - outMin);
}

/** @deprecated linearMap のエイリアス */
export function lmap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return linearMap(value, inMin, inMax, outMin, outMax);
}

export { MIDI_CC_MAX };
