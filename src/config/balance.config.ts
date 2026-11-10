/** Spec starting points, not tuned economy; ink pricing intentionally awaits GAP-002. */
export const balanceConfig = {
  startMoney: 100,
  simulationHz: 30,
  food: {
    pellet: { count: 5, price: 10, hunger: 20, growthPoints: 12, rewardBelowHunger: 80 },
    flake: { count: 8, price: 8 },
    algae: { count: 4, price: 12 },
  },
  tools: { cleaner: 15, medicine: 20, oxygen: 30 },
  passive: { perHealthyFishPerMinute: 0.4, maximumPerMinute: 6, healthAbove: 70, hungerAbove: 30 },
  stages: [
    { name: 'Hatchling', points: 0, reward: 0, scale: 1 },
    { name: 'Juvenile', points: 60, reward: 15, scale: 1.25 },
    { name: 'Young', points: 180, reward: 20, scale: 1.55 },
    { name: 'Adult', points: 420, reward: 28, scale: 1.9 },
    { name: 'Elder', points: 900, reward: 38, scale: 2.3 },
  ],
  eras: { pointsMultiplier: 2, rewardMultiplier: 1.2, rewardCap: 150 },
} as const;
