import { describe, expect, it } from 'vitest';
import { TraitCardSchema, defaultTraitCard, parseAiTraitCard } from '../../src/ai/schemas/traits';
import { createNewTank, FishSchema, parseSave, PlantTraitSchema } from '../../src/core/schemas';
import { createRandom } from '../../src/core/random';
import { createEvents } from '../../src/core/events';
import { behaviorRanges } from '../../src/config/domain.config';
const uuid = '550e8400-e29b-41d4-a716-446655440000';
const other = '550e8400-e29b-41d4-a716-446655440001';
const third = '550e8400-e29b-41d4-a716-446655440002';
function fish() {
  return FishSchema.parse({
    id: uuid,
    name: 'Ink',
    createdAt: 1,
    origin: 'drawn',
    parentIds: null,
    generation: 0,
    childIds: [],
    humanAncestry: [{ rootFishId: uuid, percentage: 100 }],
    sex: 'both',
    traitCard: defaultTraitCard,
    forms: [
      {
        id: other,
        stage: 0,
        createdAt: 1,
        source: 'human-drawing',
        imageBlobKey: 'drawing-1',
        paletteHex: ['#123456'],
        aspect: 1,
      },
    ],
    stage: 0,
    growthPoints: 0,
    ageSeconds: 0,
    needs: { hunger: 100, energy: 100, health: 100, stress: 0, happiness: 100 },
    state: 'alive',
    corpse: null,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    heading: 0,
    favorite: false,
    log: [],
  });
}
describe('trait validation and normalization', () => {
  it('defaults every nested field and preserves identity anchors', () => {
    expect(parseAiTraitCard({})).toEqual(defaultTraitCard);
    const result = parseAiTraitCard({
      visual: { distinctiveFeatures: ['ink fin'], artStyleNotes: 'crayon' },
    });
    expect(result.visual.distinctiveFeatures).toEqual(['ink fin']);
    expect(result.visual.artStyleNotes).toBe('crayon');
    expect(defaultTraitCard.visual.distinctiveFeatures).toEqual([]);
  });
  it.each(Object.entries(behaviorRanges))(
    'clamps both bounds of %s from the shared registry',
    (key, range) => {
      const low = parseAiTraitCard({ behavior: { [key]: -1e6 } }).behavior;
      const high = parseAiTraitCard({ behavior: { [key]: 1e6 } }).behavior;
      expect(low[key as keyof typeof behaviorRanges]).toBe(
        key === 'maxSpeed' ? defaultTraitCard.behavior.baseSpeed : range[0],
      );
      expect(high[key as keyof typeof behaviorRanges]).toBe(range[1]);
    },
  );
  it('repairs coupled AI ranges, not strict saves', () => {
    expect(parseAiTraitCard({ behavior: { baseSpeed: 3, maxSpeed: 0 } }).behavior.maxSpeed).toBe(3);
    expect(
      parseAiTraitCard({ mating: { clutchSize: { min: 4, max: 1 } } }).mating.clutchSize,
    ).toEqual({ min: 1, max: 4 });
    expect(
      TraitCardSchema.safeParse({
        ...defaultTraitCard,
        behavior: { ...defaultTraitCard.behavior, baseSpeed: 3, maxSpeed: 1 },
      }).success,
    ).toBe(false);
  });
  it.each([NaN, Infinity, -Infinity, '3', null])('rejects invalid AI numeric input %s', (value) => {
    expect(() => parseAiTraitCard({ behavior: { baseSpeed: value } })).toThrow();
  });
  it('clamps other AI sections and rejects extra/unsafe fields', () => {
    const value = parseAiTraitCard({
      personality: { traits: { boldness: 10 } },
      growth: { growthRate: -10 },
      ecology: { size: 1e6 },
      mating: { drive: -3 },
    });
    expect(value.personality.traits.boldness).toBe(1);
    expect(value.growth.growthRate).toBe(0.5);
    expect(value.ecology.size).toBe(512);
    expect(value.mating.drive).toBe(0);
    expect(() => parseAiTraitCard({ injectedCode: 'anything' })).toThrow();
    expect(() =>
      parseAiTraitCard({ visual: { distinctiveFeatures: Array<string>(6).fill('x') } }),
    ).toThrow();
  });
});
describe('save v1 contracts', () => {
  it('round-trips full runtime data and independent defaults without mutation', () => {
    const save = createNewTank(uuid, 0, 100);
    save.fish.push(fish());
    save.jobs.push({
      id: third,
      entityId: uuid,
      kind: 'growth',
      state: 'queued',
      inputsSummary: '',
      nextAttemptAt: null,
      result: null,
      createdAt: 100,
      attempts: 0,
    });
    save.inventory.pellet = 5;
    expect(parseSave(JSON.parse(JSON.stringify(save)))).toEqual(save);
    expect(createNewTank(uuid, 0, 100).inventory.pellet).toBe(0);
  });
  it.each([0, 2, -1, '1'])(
    'rejects unsupported schema version %s (no fictional migration)',
    (version) => {
      expect(() => parseSave({ ...createNewTank(uuid, 1, 100), schemaVersion: version })).toThrow();
    },
  );
  it.each([NaN, Infinity, -1, '100'])('rejects invalid money %s', (money) => {
    expect(() => parseSave({ ...createNewTank(uuid, 1, 100), money })).toThrow();
  });
  it('rejects duplicate entities, reward keys, orphan jobs and reversed timestamps', () => {
    const save = createNewTank(uuid, 1, 100);
    const a = fish();
    expect(() => parseSave({ ...save, fish: [a, a] })).toThrow();
    const reward = { fishId: uuid, stage: 1, amount: 15, at: 100 };
    expect(() => parseSave({ ...save, ledger: [reward, reward] })).toThrow();
    expect(() =>
      parseSave({
        ...save,
        jobs: [
          {
            id: third,
            entityId: other,
            kind: 'birth',
            state: 'queued',
            inputsSummary: '',
            nextAttemptAt: null,
            result: null,
            createdAt: 100,
            attempts: 0,
          },
        ],
      }),
    ).toThrow();
    expect(() => parseSave({ ...save, lastActiveAt: 0 })).toThrow();
    expect(() => parseSave({ ...save, apiKey: 'forbidden' })).toThrow();
  });
  it('rejects invalid ancestry, corpse/death state and embedded images', () => {
    const a = fish();
    for (const patch of [
      { humanAncestry: 0.5 },
      { origin: 'offspring' },
      { state: 'dead' },
      { corpse: { remainingSeconds: 1, nutrients: 1 } },
      { childIds: [uuid] },
    ]) {
      expect(FishSchema.safeParse({ ...a, ...patch }).success).toBe(false);
    }
    expect(
      FishSchema.safeParse({
        ...a,
        state: 'dead',
        deathInfo: { at: 10, cause: 'age' },
        corpse: { remainingSeconds: 5, nutrients: 1 },
      }).success,
    ).toBe(true);
    expect(
      FishSchema.safeParse({
        ...a,
        forms: [{ ...a.forms[0], imageBlobKey: 'data:image/png;base64,a' }],
      }).success,
    ).toBe(false);
  });
  it('caps procedural plant expansion parameters', () => {
    const plant = {
      version: 1,
      axiom: 'F',
      rules: { F: 'FF' },
      iterations: 4,
      angle: 30,
      segmentLength: 3,
      color: '#abcdef',
      ecology: { oxygen: 1, wasteAbsorption: 0.5, food: 0.2, shelter: 0.3 },
      story: '',
    };
    expect(PlantTraitSchema.safeParse(plant).success).toBe(true);
    expect(PlantTraitSchema.safeParse({ ...plant, iterations: 100 }).success).toBe(false);
  });
});
describe('seeded randomness', () => {
  it('matches known uint32 sequence and resumes exact state', () => {
    const rng = createRandom(1);
    expect(rng.next()).toBe(1015568748 / 0x100000000);
    const resumed = createRandom(rng.snapshot());
    expect(resumed.next()).toBe(rng.next());
    for (let i = 0; i < 1000; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
    expect(createRandom(0).next()).not.toBe(createRandom(1).next());
  });
  it.each([-1, 1.1, NaN, Infinity, 0x100000000])('rejects invalid seed %s', (seed) => {
    expect(() => createRandom(seed)).toThrow();
  });
});
it('events snapshot dispatch, unsubscribe, clear and instance isolation', () => {
  const bus = createEvents<{ tick: number }>();
  const seen: number[] = [];
  let off = () => {};
  bus.on('tick', (v) => {
    seen.push(v);
    off();
  });
  off = bus.on('tick', (v) => {
    seen.push(v * 2);
  });
  bus.emit('tick', 2);
  bus.emit('tick', 3);
  expect(seen).toEqual([2, 4, 3]);
  bus.clear();
  bus.emit('tick', 4);
  createEvents<{ tick: number }>().emit('tick', 10);
  expect(seen).toEqual([2, 4, 3]);
});

it('unsubscribe is idempotent even after re-subscribing to the same event', () => {
  const bus = createEvents<{ tick: number }>();
  const off = bus.on('tick', () => {});
  off();
  let result = 0;
  bus.on('tick', (value) => {
    result = value;
  });
  off();
  bus.emit('tick', 7);
  expect(result).toBe(7);
});
it('ancestry stores roots and percentages, not a lossy scalar', () => {
  const a = fish();
  const offspring = {
    ...a,
    id: third,
    origin: 'offspring',
    generation: 1,
    parentIds: [uuid, other],
    humanAncestry: [
      { rootFishId: uuid, percentage: 50 },
      { rootFishId: other, percentage: 50 },
    ],
  };
  expect(FishSchema.safeParse(offspring).success).toBe(true);
  expect(
    FishSchema.safeParse({ ...offspring, humanAncestry: [{ rootFishId: uuid, percentage: 60 }] })
      .success,
  ).toBe(false);
  expect(
    FishSchema.safeParse({
      ...offspring,
      humanAncestry: [
        { rootFishId: uuid, percentage: 50 },
        { rootFishId: uuid, percentage: 50 },
      ],
    }).success,
  ).toBe(false);
});
it('job completion requires a result and plant grammars cannot expand exponentially without bound', () => {
  const save = createNewTank(uuid, 1, 100);
  save.fish.push(fish());
  expect(() =>
    parseSave({
      ...save,
      jobs: [
        {
          id: third,
          entityId: uuid,
          kind: 'offspring',
          state: 'succeeded',
          createdAt: 100,
          attempts: 0,
          inputsSummary: 'parents',
          nextAttemptAt: null,
          result: null,
        },
      ],
    }),
  ).toThrow();
  expect(
    PlantTraitSchema.safeParse({
      version: 1,
      axiom: 'F',
      rules: { F: 'F'.repeat(100) },
      iterations: 6,
      angle: 30,
      segmentLength: 3,
      color: '#abcdef',
      ecology: { oxygen: 1, wasteAbsorption: 0.5, food: 0.2, shelter: 0.3 },
      story: '',
    }).success,
  ).toBe(false);
});
it('old unsubscribe cannot remove new subscribers after a clear', () => {
  const bus = createEvents<{ tick: number }>();
  const oldOff = bus.on('tick', () => {});
  bus.clear();
  let received = 0;
  bus.on('tick', (n) => {
    received = n;
  });
  oldOff();
  bus.emit('tick', 9);
  expect(received).toBe(9);
});

it('queue priorities cover the canonical job registry without enabling providers', async () => {
  const { aiConfig } = await import('../../src/config/ai.config');
  const { domainConfig } = await import('../../src/config/domain.config');
  expect(Object.keys(aiConfig.priorities)).toEqual([...domainConfig.jobKinds]);
  expect(aiConfig.providers).toContain(aiConfig.defaultProvider);
  expect(aiConfig.priorities.birth).toBeLessThan(aiConfig.priorities.growth);
});
