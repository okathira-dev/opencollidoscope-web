import { describe, expect, it, vi } from "vitest";
import { DEFAULT_CONFIG } from "../config/default-config.ts";
import { parseMidiMessage, pitchBendValue } from "./midi-parser.ts";
import { routeMidiMessage } from "./midi-router.ts";

describe("parseMidiMessage", () => {
  it("Note On をパースする", () => {
    expect(parseMidiMessage(new Uint8Array([0x90, 60, 100]))).toEqual({
      voice: "noteOn",
      channel: 0,
      data1: 60,
      data2: 100,
    });
  });

  it("velocity 0 の Note On を Note Off として扱う", () => {
    expect(parseMidiMessage(new Uint8Array([0x90, 60, 0]))?.voice).toBe("noteOff");
  });

  it("Control Change をパースする", () => {
    expect(parseMidiMessage(new Uint8Array([0xb0, 7, 64]))).toEqual({
      voice: "controlChange",
      channel: 0,
      data1: 7,
      data2: 64,
    });
  });

  it("Pitch Bend をパースする", () => {
    expect(parseMidiMessage(new Uint8Array([0xe0, 10, 1]))).toEqual({
      voice: "pitchBend",
      channel: 0,
      data1: 10,
      data2: 1,
    });
  });
});

describe("pitchBendValue", () => {
  it("14bit 値を合成する", () => {
    expect(pitchBendValue(10, 1)).toBe((1 << 7) | 10);
  });
});

describe("routeMidiMessage", () => {
  it("チャンネル 0 の CC7 を filter にルーティングする", () => {
    const setFilterCutoff = vi.fn();
    routeMidiMessage(
      { voice: "controlChange", channel: 0, data1: 7, data2: 64 },
      {
        waveChannel: 0,
        config: DEFAULT_CONFIG,
        actions: {
          noteOn: vi.fn(),
          noteOff: vi.fn(),
          setSelectionStart: vi.fn(),
          setSelectionSize: vi.fn(),
          setGrainDurationCoeff: vi.fn(),
          setLoopEnabled: vi.fn(),
          triggerRecord: vi.fn(),
          setFilterCutoff,
        },
      },
    );
    expect(setFilterCutoff).toHaveBeenCalledWith(64);
  });

  it("別チャンネルは無視する", () => {
    const noteOn = vi.fn();
    routeMidiMessage(
      { voice: "noteOn", channel: 1, data1: 60, data2: 100 },
      {
        waveChannel: 0,
        config: DEFAULT_CONFIG,
        actions: {
          noteOn,
          noteOff: vi.fn(),
          setSelectionStart: vi.fn(),
          setSelectionSize: vi.fn(),
          setGrainDurationCoeff: vi.fn(),
          setLoopEnabled: vi.fn(),
          triggerRecord: vi.fn(),
          setFilterCutoff: vi.fn(),
        },
      },
    );
    expect(noteOn).not.toHaveBeenCalled();
  });
});
