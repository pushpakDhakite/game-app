export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  earningsPerSecond: number;
}

export const RECIPES: Recipe[] = [
  { id: 'lemonade', name: 'Lemonade', emoji: '🍋', cost: 0, earningsPerSecond: 3 },
  { id: 'hotdog', name: 'Hot Dog', emoji: '🌭', cost: 1250, earningsPerSecond: 7 },
  { id: 'burger', name: 'Burger', emoji: '🍔', cost: 2000, earningsPerSecond: 12 },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', cost: 2750, earningsPerSecond: 18 },
  { id: 'tacos', name: 'Tacos', emoji: '🌮', cost: 3500, earningsPerSecond: 25 },
  { id: 'sushi', name: 'Sushi', emoji: '🍣', cost: 4250, earningsPerSecond: 35 },
  { id: 'steak', name: 'Steak', emoji: '🥩', cost: 5000, earningsPerSecond: 50 },
];

// Map for O(1) recipe lookups
export const RECIPE_MAP = new Map<string, Recipe>(
  RECIPES.map((recipe) => [recipe.id, recipe])
);

// Helper to calculate base earnings from owned recipes
export function calculateBaseEarnings(ownedRecipes: Set<string>): number {
  let total = 0;
  ownedRecipes.forEach((id) => {
    const recipe = RECIPE_MAP.get(id);
    if (recipe) {
      total += recipe.earningsPerSecond;
    }
  });
  return total;
}

export const PHASE2_GOAL = 1000000;

export const INITIAL_TABLES = 0;
export const INITIAL_CHAIRS = 0;
export const MAX_TABLES = 20;
export const MAX_CHAIRS = MAX_TABLES * 4;

export const TABLE_BASE_COST = 250;
export const TABLE_COST_INCREASE = 125;
export const CHAIR_COST_MULTIPLIER = 0.5;

export const INITIAL_EARNING_INTERVAL_MS = 300;
export const MIN_EARNING_INTERVAL_MS = 50;
export const INTERVAL_DECREASE_PER_ITEM = 5;

export const TAKEOUT_RATIO = 0.5;
export const DINEIN_MULTIPLIER = 1.5;

export const TAP_BONUS_PERCENT = 0.1;
export const TAP_COOLDOWN_MS = 2000;

// Helper functions for costs
export function calculateTableCost(tables: number): number {
  return TABLE_BASE_COST + (tables * TABLE_COST_INCREASE);
}

export function calculateChairCost(tables: number): number {
  return calculateTableCost(tables) * CHAIR_COST_MULTIPLIER;
}

export function calculateEarningInterval(tables: number, chairs: number): number {
  const totalItems = tables + chairs;
  const decrease = totalItems * INTERVAL_DECREASE_PER_ITEM;
  return Math.max(MIN_EARNING_INTERVAL_MS, INITIAL_EARNING_INTERVAL_MS - decrease);
}

export function calculateEarnings(
  baseEarnings: number,
  tables: number,
  chairs: number
): { takeout: number; dinein: number; total: number } {
  const tableFactor = tables > 0 ? 1 + (tables * 0.1) : 0;
  const chairFactor = chairs > 0 ? 1 + (chairs * 0.05) : 0;
  const dineinBonus = tableFactor * chairFactor;

  const takeout = baseEarnings * TAKEOUT_RATIO;
  const dinein = baseEarnings * (1 - TAKEOUT_RATIO) * DINEIN_MULTIPLIER * dineinBonus;

  return {
    takeout,
    dinein,
    total: takeout + dinein,
  };
}
