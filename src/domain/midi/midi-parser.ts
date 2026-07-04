import type { ParsedMidiMessage } from "./midi-message.ts";

export function parseMidiMessage(data: Uint8Array): ParsedMidiMessage | null {
  if (data.length < 2) {
    return null;
  }

  const status = data[0];
  if (status === undefined) {
    return null;
  }

  const voiceNibble = status >> 4;
  const channel = status & 0x0f;
  const data1 = data[1] ?? 0;
  const data2 = data.length >= 3 ? (data[2] ?? 0) : 0;

  switch (voiceNibble) {
    case 0x9: {
      if (data2 === 0) {
        return { voice: "noteOff", channel, data1, data2: 0 };
      }
      return { voice: "noteOn", channel, data1, data2 };
    }
    case 0x8:
      return { voice: "noteOff", channel, data1, data2 };
    case 0xb:
      return { voice: "controlChange", channel, data1, data2 };
    case 0xe:
      return { voice: "pitchBend", channel, data1, data2 };
    default:
      return { voice: "ignore", channel, data1, data2 };
  }
}

export function pitchBendValue(data1: number, data2: number): number {
  return (data2 << 7) | data1;
}

export function lmap(
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
