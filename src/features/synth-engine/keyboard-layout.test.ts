import { describe, expect, it } from "vitest";

import {
  buildKeyboardLayout,
  clampKeyboardOctaveOffset,
  KEYBOARD_BASE_MIDI,
  KEYBOARD_CENTER_MIDI,
  KEYBOARD_CENTER_RELATIVE_SEMITONE,
  KEYBOARD_TOP_MIDI,
  keyboardTopMidi,
  pcKeyToRelativeSemitone,
  relativeToMidiNote,
} from "./keyboard-layout.ts";

describe("buildKeyboardLayout", () => {
  it("25 鍵（白 15 + 黒 10）を生成する", () => {
    const { whiteKeys, blackKeys } = buildKeyboardLayout();
    expect(whiteKeys).toHaveLength(15);
    expect(blackKeys).toHaveLength(10);
    expect(whiteKeys[0]?.relativeSemitone).toBe(0);
    expect(whiteKeys.at(-1)?.relativeSemitone).toBe(24);
  });

  it("37 鍵（白 22 + 黒 15）を octaveCount=3 で生成する", () => {
    const { whiteKeys, blackKeys } = buildKeyboardLayout(3);
    expect(whiteKeys).toHaveLength(22);
    expect(blackKeys).toHaveLength(15);
    expect(whiteKeys[0]?.relativeSemitone).toBe(0);
    expect(whiteKeys.at(-1)?.relativeSemitone).toBe(36);
    expect(keyboardTopMidi(3)).toBe(KEYBOARD_BASE_MIDI + 36);
  });

  it("E-F / B-C の黒鍵なし区間に黒鍵を置かない", () => {
    const { blackKeys } = buildKeyboardLayout();
    const offsets = blackKeys.map((key) => key.whiteOffset);

    expect(offsets).not.toContain(3);
    expect(offsets).not.toContain(7);
    expect(offsets).not.toContain(10);
    expect(offsets).not.toContain(14);
    expect(offsets).toEqual([1, 2, 4, 5, 6, 8, 9, 11, 12, 13]);
  });

  it("PC キーボード: Z 行=白鍵、A 行=黒鍵、C キー=C4", () => {
    const { whiteKeys, blackKeys } = buildKeyboardLayout();
    const whiteByPc = Object.fromEntries(
      whiteKeys.filter((key) => key.pcKey).map((key) => [key.pcKey, key.relativeSemitone]),
    );
    const blackByPc = Object.fromEntries(
      blackKeys.filter((key) => key.pcKey).map((key) => [key.pcKey, key.relativeSemitone]),
    );

    expect(whiteByPc).toEqual({
      z: 9,
      x: 11,
      c: 12,
      v: 14,
      b: 16,
      n: 17,
      m: 19,
      ",": 21,
      ".": 23,
      "/": 24,
    });
    expect(blackByPc).toEqual({
      a: 8,
      s: 10,
      f: 13,
      g: 15,
      j: 18,
      k: 20,
      l: 22,
    });
    expect(relativeToMidiNote(pcKeyToRelativeSemitone("c") ?? 0, 0)).toBe(KEYBOARD_CENTER_MIDI);
    expect(relativeToMidiNote(pcKeyToRelativeSemitone("a") ?? 0, 0)).toBe(56);
  });
});

describe("relativeToMidiNote", () => {
  it("デフォルトオフセットで C3-C5、中央が C4（原音）", () => {
    expect(relativeToMidiNote(0, 0)).toBe(KEYBOARD_BASE_MIDI);
    expect(relativeToMidiNote(24, 0)).toBe(KEYBOARD_TOP_MIDI);
    expect(relativeToMidiNote(KEYBOARD_CENTER_RELATIVE_SEMITONE, 0)).toBe(KEYBOARD_CENTER_MIDI);
  });

  it("白鍵中央が C4", () => {
    const { whiteKeys } = buildKeyboardLayout();
    const centerKey = whiteKeys[Math.floor(whiteKeys.length / 2)];
    expect(centerKey?.relativeSemitone).toBe(KEYBOARD_CENTER_RELATIVE_SEMITONE);
    expect(relativeToMidiNote(centerKey?.relativeSemitone ?? 0, 0)).toBe(KEYBOARD_CENTER_MIDI);
  });

  it("オクターブシフトで ±12 半音", () => {
    expect(relativeToMidiNote(0, 1)).toBe(KEYBOARD_BASE_MIDI + 12);
    expect(relativeToMidiNote(0, -1)).toBe(KEYBOARD_BASE_MIDI - 12);
  });
});

describe("clampKeyboardOctaveOffset", () => {
  it("範囲外をクランプする", () => {
    expect(clampKeyboardOctaveOffset(-99)).toBe(-2);
    expect(clampKeyboardOctaveOffset(99)).toBe(2);
  });
});
