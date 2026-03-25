export interface Flavor {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  sellPriceBoost: number;
}

const FLAVORS: Flavor[] = [
  { id: 'classic', name: 'Classic', emoji: '🍋', cost: 0, sellPriceBoost: 0 },
  { id: 'sugar', name: 'Sweet Sugar', emoji: '🧂', cost: 500, sellPriceBoost: 5 },
  { id: 'mint', name: 'Fresh Mint', emoji: '🌿', cost: 2000, sellPriceBoost: 10 },
  { id: 'honey', name: 'Golden Honey', emoji: '🍯', cost: 5000, sellPriceBoost: 20 },
];

export const FLAVOR_MAP = new Map<string, Flavor>(
  FLAVORS.map((f) => [f.id, f])
);

export interface Equipment {
  id: string;
  name: string;
  emoji: string;
  stockBonus: number;
  maxCount: number;
  baseCost: number;
  costIncrease: number;
}

export const EQUIPMENT: Equipment[] = [
  { id: 'cups', name: 'Cups', emoji: '🥤', stockBonus: 1, maxCount: 10, baseCost: 200, costIncrease: 100 },
  { id: 'pitcher', name: 'Pitcher', emoji: '🫗', stockBonus: 5, maxCount: 5, baseCost: 1000, costIncrease: 500 },
  { id: 'fridge', name: 'Fridge', emoji: '❄️', stockBonus: 20, maxCount: 3, baseCost: 5000, costIncrease: 2000 },
];

export const EQUIPMENT_MAP = new Map<string, Equipment>(
  EQUIPMENT.map((e) => [e.id, e])
);

export const SPEED_BOOST_LEVELS = [
  { interval: 100, cost: 0 },
  { interval: 90, cost: 1000 },
  { interval: 80, cost: 3000 },
  { interval: 70, cost: 6000 },
  { interval: 60, cost: 10000 },
  { interval: 50, cost: 15000 },
];

export const MAX_SPEED_LEVEL = SPEED_BOOST_LEVELS.length - 1;

export const TAP_BONUS_PERCENT_P1 = 0.1;
export const TAP_COOLDOWN_MS_P1 = 2000;

export function calculateEquipmentCost(equip: Equipment, owned: number): number {
  return equip.baseCost + (owned * equip.costIncrease);
}

export function calculateFlavorBoost(ownedFlavors: string[]): number {
  let total = 0;
  for (const id of ownedFlavors) {
    const flavor = FLAVOR_MAP.get(id);
    if (flavor) total += flavor.sellPriceBoost;
  }
  return total;
}
