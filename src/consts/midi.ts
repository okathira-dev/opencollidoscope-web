/** MIDI CC / 7-bit コントローラ値の最大 (0–127) */
export const MIDI_CC_MAX = 127;

/** MIDI ノート番号: Middle C (C4) */
export const MIDDLE_C_NOTE = 60;

/** 未使用ボイススロットのセンチネル (オリジナル kNoMidiNote) */
export const NO_MIDI_NOTE = -50;

/** MIDI ステータスバイトの voice ニブル (上位4bit) */
export enum MidiStatusNibble {
  NoteOff = 0x8,
  NoteOn = 0x9,
  ControlChange = 0xb,
  PitchBend = 0xe,
}

/** MIDI チャンネル番号のマスク (下位4bit) */
export const MIDI_CHANNEL_MASK = 0x0f;

/** ピッチベンド 14-bit 値の下位7bitシフト */
export const MIDI_PITCH_BEND_LSB_SHIFT = 7;
