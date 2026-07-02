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

export const collidoscopeConfigSchema = z.object({
  audio: audioConfigSchema,
  granular: granularConfigSchema,
  envelope: envelopeConfigSchema,
  filter: filterConfigSchema,
  visual: visualConfigSchema,
  midi: midiConfigSchema,
});

export type CollidoscopeConfig = z.infer<typeof collidoscopeConfigSchema>;
export type PartialCollidoscopeConfig = {
  audio?: Partial<CollidoscopeConfig["audio"]>;
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
}

export function mergeCollidoscopeConfig(
  base: CollidoscopeConfig,
  updates: PartialCollidoscopeConfig,
): CollidoscopeConfig {
  return {
    audio: { ...base.audio, ...updates.audio },
    granular: {
      ...base.granular,
      ...updates.granular,
      grainDurationRange: {
        ...base.granular.grainDurationRange,
        ...updates.granular?.grainDurationRange,
      },
    },
    envelope: { ...base.envelope, ...updates.envelope },
    filter: { ...base.filter, ...updates.filter },
    visual: {
      ...base.visual,
      ...updates.visual,
      colors: {
        ...base.visual.colors,
        ...updates.visual?.colors,
      },
    },
    midi: {
      ...base.midi,
      ...updates.midi,
      pitchBendRange: {
        ...base.midi.pitchBendRange,
        ...updates.midi?.pitchBendRange,
      },
      ccMappings: {
        ...base.midi.ccMappings,
        ...updates.midi?.ccMappings,
      },
    },
  };
}
