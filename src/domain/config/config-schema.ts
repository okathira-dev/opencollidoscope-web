import { z } from "zod";

const hexColorSchema = z.string().regex(/^#[0-9A-F]{6}$/i);

const audioConfigSchema = z.object({
  sampleRate: z.number().positive().default(44100),
  chunkCount: z.number().int().min(1).max(1000).default(150),
  waveLength: z.number().positive().min(0.1).max(10).default(2.0),
  maxSelectionSize: z.number().int().min(1).max(1000).default(37),
  attenuation: z.number().min(0).max(1).default(0.25118864315096),
});

const grainDurationRangeSchema = z.object({
  min: z.number().positive().min(1).max(8).default(1.0),
  max: z.number().positive().min(1).max(8).default(8.0),
});

const granularConfigSchema = z.object({
  maxGrains: z.number().int().min(1).max(128).default(32),
  maxVoices: z.number().int().min(1).max(16).default(6),
  minGrainDuration: z.number().positive().default(640),
  grainDurationRange: grainDurationRangeSchema,
});

const envelopeConfigSchema = z.object({
  attackTime: z.number().positive().min(0.001).max(1).default(0.01),
  releaseTime: z.number().positive().min(0.001).max(1).default(0.05),
  sustainLevel: z.number().min(0).max(1).default(1.0),
});

const filterConfigSchema = z.object({
  minCutoff: z.number().positive().min(20).max(20000).default(200),
  maxCutoff: z.number().positive().min(200).max(22050).default(22050),
  qFactor: z.number().positive().min(0.1).max(30).default(Math.SQRT1_2),
});

const visualColorsSchema = z.object({
  wave1: hexColorSchema.default("#F3063E"),
  wave2: hexColorSchema.default("#FFCC00"),
  cursor: hexColorSchema.default("#FFFFFF"),
});

const visualConfigSchema = z.object({
  colors: visualColorsSchema,
  maxParticles: z.number().int().min(10).max(1000).default(150),
  chunkAnimationFrames: z.number().int().min(1).max(10).default(3),
});

const pitchBendRangeSchema = z.object({
  min: z.number().int().min(0).max(149).default(0),
  max: z.number().int().min(0).max(149).default(149),
});

const ccMappingsSchema = z.object({
  selectionSize: z.number().int().min(0).max(127).default(1),
  grainDuration: z.number().int().min(0).max(127).default(2),
  loopToggle: z.number().int().min(0).max(127).default(4),
  recordTrigger: z.number().int().min(0).max(127).default(5),
  filterCutoff: z.number().int().min(0).max(127).default(7),
});

const midiConfigSchema = z.object({
  pitchBendRange: pitchBendRangeSchema,
  ccMappings: ccMappingsSchema,
});

const micInputConfigSchema = z.object({
  inputGain: z.number().min(0).max(5).default(1.0),
  autoGainControl: z.boolean().default(false),
  noiseSuppression: z.boolean().default(false),
  echoCancellation: z.boolean().default(false),
  compressorEnabled: z.boolean().default(false),
  compressorThreshold: z.number().min(-100).max(0).default(-24),
  compressorKnee: z.number().min(0).max(40).default(30),
  compressorRatio: z.number().min(1).max(20).default(12),
  compressorAttack: z.number().min(0).max(1).default(0.003),
  compressorRelease: z.number().min(0).max(1).default(0.25),
  normalizeRecording: z.boolean().default(true),
  normalizeTargetPeak: z.number().min(0.01).max(1).default(1),
});

export const collidoscopeConfigSchema = z.object({
  audio: audioConfigSchema,
  micInput: micInputConfigSchema,
  granular: granularConfigSchema,
  envelope: envelopeConfigSchema,
  filter: filterConfigSchema,
  visual: visualConfigSchema,
  midi: midiConfigSchema,
});

export type CollidoscopeConfig = z.infer<typeof collidoscopeConfigSchema>;
export type PartialCollidoscopeConfig = {
  audio?: Partial<CollidoscopeConfig["audio"]>;
  micInput?: Partial<CollidoscopeConfig["micInput"]>;
  granular?: Omit<Partial<CollidoscopeConfig["granular"]>, "grainDurationRange"> & {
    grainDurationRange?: Partial<CollidoscopeConfig["granular"]["grainDurationRange"]>;
  };
  envelope?: Partial<CollidoscopeConfig["envelope"]>;
  filter?: Partial<CollidoscopeConfig["filter"]>;
  visual?: Omit<Partial<CollidoscopeConfig["visual"]>, "colors"> & {
    colors?: Partial<CollidoscopeConfig["visual"]["colors"]>;
  };
  midi?: Omit<Partial<CollidoscopeConfig["midi"]>, "pitchBendRange" | "ccMappings"> & {
    pitchBendRange?: Partial<CollidoscopeConfig["midi"]["pitchBendRange"]>;
    ccMappings?: Partial<CollidoscopeConfig["midi"]["ccMappings"]>;
  };
};

function createEmptyConfigInput(): Record<string, unknown> {
  return {
    audio: {},
    micInput: {},
    granular: { grainDurationRange: {} },
    envelope: {},
    filter: {},
    visual: { colors: {} },
    midi: { pitchBendRange: {}, ccMappings: {} },
  };
}

function deepMergeUnknown(
  base: Record<string, unknown>,
  updates: unknown,
): Record<string, unknown> {
  if (typeof updates !== "object" || updates === null) {
    return base;
  }

  const result = { ...base };

  for (const [key, value] of Object.entries(updates)) {
    const baseValue = result[key];

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof baseValue === "object" &&
      baseValue !== null &&
      !Array.isArray(baseValue)
    ) {
      result[key] = deepMergeUnknown(
        baseValue as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function parseCollidoscopeConfig(input: unknown): CollidoscopeConfig {
  const merged = deepMergeUnknown(createEmptyConfigInput(), input);
  return collidoscopeConfigSchema.parse(merged);
}

export function validateConfigDependencies(config: CollidoscopeConfig): void {
  if (config.audio.maxSelectionSize > config.audio.chunkCount) {
    throw new Error("最大選択サイズはチャンク数以下で設定してください");
  }
  if (config.filter.minCutoff >= config.filter.maxCutoff) {
    throw new Error("最小カットオフは最大カットオフより小さく設定してください");
  }
}

export function mergeCollidoscopeConfig(
  base: CollidoscopeConfig,
  updates: PartialCollidoscopeConfig,
): CollidoscopeConfig {
  const audio = updates.audio !== undefined ? { ...base.audio, ...updates.audio } : base.audio;

  const micInput =
    updates.micInput !== undefined ? { ...base.micInput, ...updates.micInput } : base.micInput;

  let granular = base.granular;
  if (updates.granular !== undefined) {
    granular = {
      ...base.granular,
      ...updates.granular,
      grainDurationRange:
        updates.granular.grainDurationRange !== undefined
          ? { ...base.granular.grainDurationRange, ...updates.granular.grainDurationRange }
          : base.granular.grainDurationRange,
    };
  }

  const envelope =
    updates.envelope !== undefined ? { ...base.envelope, ...updates.envelope } : base.envelope;

  const filter = updates.filter !== undefined ? { ...base.filter, ...updates.filter } : base.filter;

  let visual = base.visual;
  if (updates.visual !== undefined) {
    visual = {
      ...base.visual,
      ...updates.visual,
      colors:
        updates.visual.colors !== undefined
          ? { ...base.visual.colors, ...updates.visual.colors }
          : base.visual.colors,
    };
  }

  let midi = base.midi;
  if (updates.midi !== undefined) {
    midi = {
      ...base.midi,
      ...updates.midi,
      pitchBendRange:
        updates.midi.pitchBendRange !== undefined
          ? { ...base.midi.pitchBendRange, ...updates.midi.pitchBendRange }
          : base.midi.pitchBendRange,
      ccMappings:
        updates.midi.ccMappings !== undefined
          ? { ...base.midi.ccMappings, ...updates.midi.ccMappings }
          : base.midi.ccMappings,
    };
  }

  if (
    audio === base.audio &&
    micInput === base.micInput &&
    granular === base.granular &&
    envelope === base.envelope &&
    filter === base.filter &&
    visual === base.visual &&
    midi === base.midi
  ) {
    return base;
  }

  return { audio, micInput, granular, envelope, filter, visual, midi };
}
