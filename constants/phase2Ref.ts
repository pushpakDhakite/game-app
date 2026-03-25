export interface Phase2SaveState {
  ownedRecipes: string[];
  tables: number;
  chairs: number;
  phase2GoalReached: boolean;
}

// Shared ref for communication between Phase2Context and GameContext
// Phase2Context registers getter/loaders, GameContext calls them for save/load
export const phase2StateRef: {
  current: {
    getSaveState: () => Phase2SaveState;
    loadFromSave: (data: Phase2SaveState) => void;
  } | null;
} = { current: null };
