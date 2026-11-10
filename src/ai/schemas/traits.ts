import { z } from 'zod';
import { behaviorRanges, domainConfig, personalityKeys } from '../../config/domain.config';

export const finite = z.number();
export const unit = finite.min(0).max(1);
export const text = z.string().max(domainConfig.maxText);
const words = z.array(text).max(20);
const shape = <T extends string>(keys: readonly T[], schema: z.ZodNumber) =>
  Object.fromEntries(keys.map((key) => [key, schema])) as Record<T, z.ZodNumber>;
const behaviorShape = Object.fromEntries(
  Object.entries(behaviorRanges).map(([key, [min, max]]) => [key, finite.min(min).max(max)]),
) as Record<keyof typeof behaviorRanges, z.ZodNumber>;
export const BehaviorSchema = z
  .strictObject({
    ...behaviorShape,
    swimPattern: z.enum(domainConfig.swimPatterns),
    predator: z.boolean(),
    huntStyle: z.enum(['ambush', 'chase', 'stalk']),
  })
  .refine((value) => value.maxSpeed >= value.baseSpeed, {
    message: 'maxSpeed must be >= baseSpeed',
  });
export const TraitCardSchema = z.strictObject({
  version: z.literal(1),
  visual: z.strictObject({
    bodyShape: text,
    silhouetteNotes: text,
    dominantColors: words.max(5),
    patterns: words,
    fins: words,
    eyes: text,
    texture: text,
    distinctiveFeatures: words.max(5),
    artStyleNotes: text,
    facing: z.enum(['right', 'left']),
  }),
  personality: z.strictObject({
    summary: text.max(280),
    traits: z.strictObject(shape(personalityKeys, unit)),
  }),
  behavior: BehaviorSchema,
  ecology: z.strictObject({
    diet: z
      .array(z.enum(['pellet', 'algae', 'plant', 'smallfish', 'any']))
      .min(1)
      .max(5),
    dietPreference: text,
    preferredZones: z.array(z.enum(['open', 'plants', 'rocks', 'corners'])).max(4),
    size: finite.min(domainConfig.creatureSize.min).max(domainConfig.creatureSize.max),
  }),
  growth: z.strictObject({
    growthRate: finite.min(0.5).max(2),
    maxScaleMultiplier: finite.min(1).max(6),
    morphTendency: words,
    lifespanKind: z.enum(['unlimited', 'long', 'medium']),
    stageNamingStyle: text,
  }),
  mating: z.strictObject({
    matureAtStage: finite.int().min(1).max(3),
    drive: unit,
    selectivity: unit,
    preferredTraits: words,
    courtshipStyle: z.enum(['circle', 'dance', 'chase', 'display', 'nuzzle']),
    clutchSize: z
      .strictObject({ min: finite.int().min(1).max(4), max: finite.int().min(1).max(4) })
      .refine((v) => v.min <= v.max),
    cooldownMinutes: finite.min(10).max(120),
  }),
  story: text,
});
export type TraitCard = z.infer<typeof TraitCardSchema>;

/** Schema-guided AI normalization: missing fields get defaults, finite numbers clamp.
 * Wrong types, unknown fields and nonfinite numbers still reject, unlike permissive coercion.
 */
const aiNumber = (min: number, max: number, fallback: number) =>
  finite.transform((v) => Math.max(min, Math.min(max, v))).prefault(fallback);
const aiField = (schema: z.ZodNumber, fallback: number) =>
  aiNumber(schema.minValue ?? -Number.MAX_VALUE, schema.maxValue ?? Number.MAX_VALUE, fallback);
const aiBehavior = Object.fromEntries(
  Object.entries(behaviorRanges).map(([key, [min, max, fallback]]) => [
    key,
    aiNumber(min, max, fallback),
  ]),
) as Record<keyof typeof behaviorRanges, ReturnType<typeof aiNumber>>;
export const defaultTraitCard: TraitCard = TraitCardSchema.parse({
  version: 1,
  visual: {
    bodyShape: '',
    silhouetteNotes: '',
    dominantColors: [],
    patterns: [],
    fins: [],
    eyes: '',
    texture: '',
    distinctiveFeatures: [],
    artStyleNotes: '',
    facing: 'right',
  },
  personality: {
    summary: '',
    traits: Object.fromEntries(
      personalityKeys.map((key) => [key, domainConfig.defaultTraitNumber]),
    ),
  },
  behavior: {
    ...Object.fromEntries(Object.entries(behaviorRanges).map(([key, range]) => [key, range[2]])),
    swimPattern: 'glide',
    predator: false,
    huntStyle: 'chase',
  },
  ecology: { diet: ['pellet'], dietPreference: '', preferredZones: ['open'], size: 48 },
  growth: {
    growthRate: 1,
    maxScaleMultiplier: 3,
    morphTendency: [],
    lifespanKind: 'unlimited',
    stageNamingStyle: '',
  },
  mating: {
    matureAtStage: 2,
    drive: 0.5,
    selectivity: 0.5,
    preferredTraits: [],
    courtshipStyle: 'circle',
    clutchSize: { min: 1, max: 2 },
    cooldownMinutes: 60,
  },
  story: '',
});
const AiTraitSchema = TraitCardSchema.extend({
  visual: TraitCardSchema.shape.visual,
  personality: z
    .strictObject({
      summary: text.max(280).prefault(''),
      traits: z
        .strictObject(
          Object.fromEntries(
            personalityKeys.map((key) => [key, aiField(unit, domainConfig.defaultTraitNumber)]),
          ),
        )
        .transform((v) => ({ ...defaultTraitCard.personality.traits, ...v }))
        .prefault({}),
    })
    .prefault({}),
  behavior: z
    .strictObject({
      ...aiBehavior,
      swimPattern: z.enum(domainConfig.swimPatterns).prefault('glide'),
      predator: z.boolean().prefault(false),
      huntStyle: z.enum(['ambush', 'chase', 'stalk']).prefault('chase'),
    })
    .transform((v) => ({ ...v, maxSpeed: Math.max(v.baseSpeed, v.maxSpeed) }))
    .prefault({}),
  ecology: TraitCardSchema.shape.ecology.extend({
    size: aiField(TraitCardSchema.shape.ecology.shape.size, defaultTraitCard.ecology.size),
  }),
  growth: TraitCardSchema.shape.growth.extend({
    growthRate: aiField(
      TraitCardSchema.shape.growth.shape.growthRate,
      defaultTraitCard.growth.growthRate,
    ),
    maxScaleMultiplier: aiField(
      TraitCardSchema.shape.growth.shape.maxScaleMultiplier,
      defaultTraitCard.growth.maxScaleMultiplier,
    ),
  }),
  mating: TraitCardSchema.shape.mating.extend({
    drive: aiField(TraitCardSchema.shape.mating.shape.drive, defaultTraitCard.mating.drive),
    selectivity: aiField(
      TraitCardSchema.shape.mating.shape.selectivity,
      defaultTraitCard.mating.selectivity,
    ),
    matureAtStage: aiField(
      TraitCardSchema.shape.mating.shape.matureAtStage,
      defaultTraitCard.mating.matureAtStage,
    ).transform(Math.round),
    cooldownMinutes: aiField(
      TraitCardSchema.shape.mating.shape.cooldownMinutes,
      defaultTraitCard.mating.cooldownMinutes,
    ),
    clutchSize: z
      .strictObject({
        min: aiField(
          TraitCardSchema.shape.mating.shape.clutchSize.shape.min,
          defaultTraitCard.mating.clutchSize.min,
        ).transform(Math.round),
        max: aiField(
          TraitCardSchema.shape.mating.shape.clutchSize.shape.max,
          defaultTraitCard.mating.clutchSize.max,
        ).transform(Math.round),
      })
      .transform((v) => ({ min: Math.min(v.min, v.max), max: Math.max(v.min, v.max) })),
  }),
  version: z.literal(1).prefault(1),
  story: text.prefault(''),
});
export function parseAiTraitCard(input: unknown): TraitCard {
  return TraitCardSchema.parse(AiTraitSchema.parse(withDefaults(input, defaultTraitCard)));
}

function withDefaults(input: unknown, defaults: unknown): unknown {
  if (input === undefined) return structuredClone(defaults);
  if (
    input === null ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    defaults === null ||
    typeof defaults !== 'object' ||
    Array.isArray(defaults)
  )
    return input;
  const values = { ...input } as Record<string, unknown>;
  for (const [key, value] of Object.entries(defaults))
    values[key] = withDefaults(values[key], value);
  return values;
}
