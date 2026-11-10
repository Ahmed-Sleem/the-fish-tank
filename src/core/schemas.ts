/** Version-1 save contract: strict imports, no AI clamping or silent save repair. */
import { z } from 'zod';
import { TraitCardSchema, finite, text, unit } from '../ai/schemas/traits';
import { domainConfig } from '../config/domain.config';
import { balanceConfig } from '../config/balance.config';
const id = z.uuid();
const nonnegative = finite.nonnegative();
const timestamp = nonnegative.int().max(Number.MAX_SAFE_INTEGER);
const stage = nonnegative.int().max(domainConfig.maxStage);
const vec = z.strictObject({ x: finite, y: finite });
const ids = z.array(id).max(domainConfig.maxEntities);
const hex = z.string().regex(/^#[0-9a-f]{6}$/i);
export const GameEventSchema = z.strictObject({
  id,
  at: timestamp,
  type: z.enum(['birth', 'growth', 'death', 'feeding', 'mating', 'system']),
  entityId: id.nullable(),
  message: text,
});
const log = z.array(GameEventSchema).max(domainConfig.maxHistory);
export const StrokeSchema = z.strictObject({
  points: z.array(vec).min(1).max(domainConfig.maxPoints),
  color: hex,
  width: finite.positive().max(100),
});
export const FormSchema = z.strictObject({
  id,
  stage,
  createdAt: timestamp,
  source: z.enum(['human-drawing', 'ai-image', 'fallback-procedural']),
  imageBlobKey: z
    .string()
    .min(1)
    .max(256)
    .refine((v) => !/^(data:|https?:)/i.test(v)),
  originalPromptSummary: text.optional(),
  aiNotes: text.optional(),
  paletteHex: z.array(hex).max(5),
  aspect: finite.positive().max(100),
  strokes: z.array(StrokeSchema).max(domainConfig.maxStrokes).optional(),
});
export const FishSchema = z
  .strictObject({
    id,
    name: text.max(120),
    createdAt: timestamp,
    origin: z.enum(['drawn', 'offspring']),
    parentIds: z.tuple([id, id]).nullable(),
    generation: stage,
    childIds: ids,
    humanAncestry: z
      .array(z.strictObject({ rootFishId: id, percentage: finite.min(0).max(100) }))
      .min(1)
      .max(domainConfig.maxEntities),
    sex: z.enum(['a', 'b', 'both']),
    traitCard: TraitCardSchema,
    forms: z.array(FormSchema).min(1).max(domainConfig.maxHistory),
    stage,
    growthPoints: nonnegative,
    ageSeconds: nonnegative,
    needs: z.strictObject({
      hunger: finite.min(0).max(100),
      energy: finite.min(0).max(100),
      health: finite.min(0).max(100),
      stress: finite.min(0).max(100),
      happiness: finite.min(0).max(100),
    }),
    state: z.enum(['alive', 'dead']),
    deathInfo: z.strictObject({ at: timestamp, cause: text }).optional(),
    corpse: z.strictObject({ remainingSeconds: nonnegative, nutrients: nonnegative }).nullable(),
    pos: vec,
    vel: vec,
    heading: finite,
    favorite: z.boolean(),
    log,
  })
  .superRefine((v, ctx) => {
    const fail = (message: string) => {
      ctx.addIssue({ code: 'custom', message });
    };
    if ((v.state === 'dead') !== Boolean(v.deathInfo))
      fail('Death state requires matching deathInfo');
    if (v.state === 'alive' && v.corpse !== null) fail('Living fish cannot be a corpse');
    if (
      v.origin === 'drawn' &&
      (v.parentIds !== null ||
        v.generation !== 0 ||
        v.humanAncestry.length !== 1 ||
        v.humanAncestry[0]?.rootFishId !== v.id ||
        v.humanAncestry[0].percentage !== 100)
    )
      fail('Drawn fish ancestry is inconsistent');
    if (
      new Set(v.humanAncestry.map((a) => a.rootFishId)).size !== v.humanAncestry.length ||
      Math.abs(v.humanAncestry.reduce((sum, a) => sum + a.percentage, 0) - 100) >
        domainConfig.ancestryTolerance
    )
      fail('Invalid ancestry contributions');
    if (v.origin === 'offspring' && (!v.parentIds || v.generation < 1))
      fail('Offspring require parents and generation');
    if (v.parentIds && (v.parentIds[0] === v.parentIds[1] || v.parentIds.includes(v.id)))
      fail('Invalid parents');
    if (v.childIds.includes(v.id) || new Set(v.childIds).size !== v.childIds.length)
      fail('Invalid children');
    if (
      v.forms.some(
        (form, i) => form.stage > v.stage || (i > 0 && form.stage < (v.forms[i - 1]?.stage ?? 0)),
      )
    )
      fail('Invalid form progression');
    if (v.forms[0]?.stage !== 0 || new Set(v.forms.map((f) => f.id)).size !== v.forms.length)
      fail('Invalid form identity/history');
  });
export const PlantTraitSchema = z
  .strictObject({
    version: z.literal(1),
    axiom: text.max(120),
    rules: z
      .record(z.string().regex(/^[A-Z]$/), z.string().max(120))
      .refine((v) => Object.keys(v).length <= 26),
    iterations: finite.int().min(0).max(6),
    angle: finite.min(0).max(180),
    segmentLength: finite.positive().max(100),
    color: hex,
    ecology: z.strictObject({ oxygen: unit, wasteAbsorption: unit, food: unit, shelter: unit }),
    story: text,
  })
  .refine(
    (value) => {
      // Count expansion without allocating expanded strings; reject exponential growth early.
      let counts = new Map<string, number>();
      for (const symbol of value.axiom) counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
      for (let iteration = 0; iteration < value.iterations; iteration++) {
        const next = new Map<string, number>();
        for (const [symbol, count] of counts) {
          for (const output of value.rules[symbol] ?? symbol)
            next.set(output, (next.get(output) ?? 0) + count);
        }
        if ([...next.values()].reduce((sum, n) => sum + n, 0) > domainConfig.maxPlantSymbols)
          return false;
        counts = next;
      }
      return true;
    },
    { message: 'Plant expansion exceeds symbol budget' },
  );
export const PlantSchema = z.strictObject({
  id,
  name: text.max(120),
  createdAt: timestamp,
  parentIds: ids.optional(),
  traitCard: PlantTraitSchema,
  forms: z
    .array(
      z.strictObject({
        id,
        createdAt: timestamp,
        traitCard: PlantTraitSchema,
        imageBlobKey: text.optional(),
      }),
    )
    .min(1)
    .max(domainConfig.maxHistory),
  anchor: vec,
  size: finite.min(domainConfig.plantSize.min).max(domainConfig.plantSize.max),
  health: finite.min(0).max(100),
  log,
});
export const ItemSchema = z.strictObject({
  id,
  kind: z.enum(['pellet', 'flake', 'algae', 'decoration', 'cleaner', 'medicine', 'oxygen']),
  pos: vec,
  createdAt: timestamp,
  remainingSeconds: nonnegative,
  quantity: nonnegative.int(),
});
export const JobSchema = z
  .strictObject({
    id,
    entityId: id,
    kind: z.enum(domainConfig.jobKinds),
    state: z.enum(domainConfig.jobStates),
    createdAt: timestamp,
    attempts: nonnegative.int().max(10),
    error: text.optional(),
    inputsSummary: text,
    nextAttemptAt: timestamp.nullable(),
    result: z
      .strictObject({
        traitCard: TraitCardSchema.optional(),
        plantTraitCard: PlantTraitSchema.optional(),
        imageBlobKey: text.optional(),
        notes: text,
      })
      .nullable(),
  })
  .superRefine((v, ctx) => {
    if (v.state === 'succeeded' && v.result === null)
      ctx.addIssue({ code: 'custom', message: 'Succeeded jobs require a result' });
    if (v.state === 'failed' && !v.error)
      ctx.addIssue({ code: 'custom', message: 'Failed jobs require an error' });
  });
export const TankSaveSchema = z
  .strictObject({
    schemaVersion: z.literal(domainConfig.schemaVersion),
    installId: id,
    tankSeed: nonnegative.int().max(0xffffffff),
    rngState: nonnegative.int().max(0xffffffff),
    createdAt: timestamp,
    lastActiveAt: timestamp,
    money: nonnegative.max(domainConfig.maxMoney),
    clock: z.strictObject({ simTime: nonnegative }),
    fish: z.array(FishSchema).max(domainConfig.maxEntities),
    plants: z.array(PlantSchema).max(domainConfig.maxEntities),
    items: z.array(ItemSchema).max(domainConfig.maxEntities),
    inventory: z.strictObject({
      pellet: nonnegative.int(),
      flake: nonnegative.int(),
      algae: nonnegative.int(),
      seeds: nonnegative.int(),
      cleaner: nonnegative.int(),
      medicine: nonnegative.int(),
      oxygen: nonnegative.int(),
    }),
    jobs: z.array(JobSchema).max(domainConfig.maxEntities),
    ledger: z
      .array(z.strictObject({ fishId: id, stage, amount: nonnegative, at: timestamp }))
      .max(domainConfig.maxHistory),
    tankStats: z.strictObject({
      births: nonnegative.int(),
      deaths: nonnegative.int(),
      maxGeneration: stage,
      waterQuality: unit,
      oxygen: unit,
      temperature: finite.min(0).max(50),
      light: unit,
      algae: unit,
    }),
    events: log,
  })
  .superRefine((v, ctx) => {
    const fail = (message: string) => {
      ctx.addIssue({ code: 'custom', message });
    };
    if (v.lastActiveAt < v.createdAt) fail('Activity predates tank');
    const entities = [...v.fish, ...v.plants, ...v.items];
    if (new Set(entities.map((e) => e.id)).size !== entities.length) fail('Duplicate entity id');
    if (new Set(v.ledger.map((r) => `${r.fishId}:${String(r.stage)}`)).size !== v.ledger.length)
      fail('Duplicate reward key');
    if (
      new Set(v.jobs.map((j) => j.id)).size !== v.jobs.length ||
      v.jobs.some((j) => !entities.some((e) => e.id === j.entityId))
    )
      fail('Invalid job identity/target');
  });
export type TankSave = z.infer<typeof TankSaveSchema>;
export type Fish = z.infer<typeof FishSchema>;
export type Plant = z.infer<typeof PlantSchema>;
export type Job = z.infer<typeof JobSchema>;
export function createNewTank(installId: string, tankSeed: number, now: number): TankSave {
  return TankSaveSchema.parse({
    schemaVersion: domainConfig.schemaVersion,
    installId,
    tankSeed,
    rngState: tankSeed,
    createdAt: now,
    lastActiveAt: now,
    money: balanceConfig.startMoney,
    clock: { simTime: 0 },
    fish: [],
    plants: [],
    items: [],
    jobs: [],
    ledger: [],
    events: [],
    inventory: { pellet: 0, flake: 0, algae: 0, seeds: 0, cleaner: 0, medicine: 0, oxygen: 0 },
    tankStats: {
      births: 0,
      deaths: 0,
      maxGeneration: 0,
      waterQuality: 1,
      oxygen: 1,
      temperature: 24,
      light: 0.5,
      algae: 0,
    },
  });
}
/** No historical saved-game format has shipped. Unsupported versions must not be guessed at. */
export function parseSave(input: unknown): TankSave {
  return TankSaveSchema.parse(input);
}
