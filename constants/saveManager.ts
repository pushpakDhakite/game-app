import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_SAVES = '@lemonade_tycoon_saves';

export interface SaveData {
  id: string;
  name: string;
  money: number;
  stock: number;
  maxStock: number;
  lemonPrice: number;
  restockCost: number;
  upgradeCost: number;
  upgradeLevel: number;
  goalReached: boolean;
  hasManager: boolean;
  createdAt: string;
  updatedAt: string;
  // Phase & manager state
  currentPhase?: 1 | 2;
  hasFreeRestockManager?: boolean;
  hasDoubleIncomeManager?: boolean;
  activeRestockManager?: 'auto' | 'free' | null;
  // Phase 2 state
  ownedRecipes?: string[];
  tables?: number;
  chairs?: number;
  phase2GoalReached?: boolean;
  // Phase 1 features
  ownedFlavors?: string[];
  cups?: number;
  pitchers?: number;
  fridges?: number;
  speedLevel?: number;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function getAllSaves(): Promise<SaveData[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_SAVES);
    if (!raw) return [];
    const saves: SaveData[] = JSON.parse(raw);
    return saves.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

export async function saveGame(data: SaveData): Promise<void> {
  try {
    const saves = await getAllSaves();
    const index = saves.findIndex((s) => s.id === data.id);
    if (index >= 0) {
      saves[index] = data;
    } else {
      saves.push(data);
    }
    await AsyncStorage.setItem(STORAGE_KEY_SAVES, JSON.stringify(saves));
  } catch {
    // Silent fail
  }
}

export async function loadGame(id: string): Promise<SaveData | null> {
  try {
    const saves = await getAllSaves();
    return saves.find((s) => s.id === id) ?? null;
  } catch {
    return null;
  }
}

export async function deleteSave(id: string): Promise<void> {
  try {
    const saves = await getAllSaves();
    const filtered = saves.filter((s) => s.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY_SAVES, JSON.stringify(filtered));
  } catch {
    // Silent fail
  }
}
