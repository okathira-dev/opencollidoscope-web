/**
 * Configuration constants for Open Collidoscope Web
 * Based on the original C++ Config.h file
 */

// Wave configuration
export const NUM_WAVES = 2; // Inferred from original code usage
export const NUM_CHUNKS = 150; // From original Config.h getNumChunks()
export const WAVE_LENGTH_SECONDS = 2.0; // Default wave length in seconds
export const MAX_SELECTION_NUM_CHUNKS = 37; // From original Config.h getMaxSelectionNumChunks()

// Audio configuration
export const MAX_GRAIN_DURATION_COEFF = 8.0; // From original Config.h getMaxGrainDurationCoeff()
export const MAX_FILTER_CUTOFF_FREQ = 22050; // From original Config.h getMaxFilterCutoffFreq()
export const MIN_FILTER_CUTOFF_FREQ = 200; // From original Config.h getMinFilterCutoffFreq()
export const MAX_KEYBOARD_VOICES = 6; // From original Config.h getMaxKeyboardVoices()

// Visual configuration
export const OSCILLOSCOPE_NUM_POINTS_DIVIDER = 4; // From original Config.h getOscilloscopeNumPointsDivider()
export const CURSOR_TRIGGER_MESSAGE_BUF_SIZE = 512; // From original Config.h getCursorTriggerMessageBufSize()
export const PARTICLE_SIZE_COEFF = 1.0; // Particle size coefficient for visual effects

// Colors (based on original getWaveSelectionColor)
export const WAVE_COLORS = {
  WAVE_1: { r: 243, g: 6, b: 62 }, // RGB(243, 6, 62) - Red
  WAVE_2: { r: 255, g: 204, b: 0 }, // RGB(255, 204, 0) - Yellow/Gold
} as const;

// Canvas configuration
export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 200;

// Selection calculation constants
export const SELECTION_SCALE_FACTOR = NUM_CHUNKS - 1; // 149, used for normalizing selection values

// MIDI configuration
export const MIDDLE_C_MIDI_NOTE = 60; // C4 in MIDI

// Audio processing
export const DEFAULT_SAMPLE_RATE = 48000;
export const DEFAULT_CHANNEL_COUNT = 1; // Mono

// UI defaults
export const DEFAULT_MASTER_VOLUME = 0.7;
export const DEFAULT_GRAIN_DURATION = 1.0;
export const DEFAULT_SELECTION_SIZE = 30; // Reasonable default within MAX_SELECTION_NUM_CHUNKS
export const DEFAULT_SELECTION_START = 0;
