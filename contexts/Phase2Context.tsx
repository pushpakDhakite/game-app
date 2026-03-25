import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  RECIPE_MAP,
  PHASE2_GOAL,
  INITIAL_TABLES,
  INITIAL_CHAIRS,
  MAX_TABLES,
  MAX_CHAIRS,
  TAP_BONUS_PERCENT,
  TAP_COOLDOWN_MS,
  calculateTableCost,
  calculateChairCost,
  calculateEarningInterval,
  calculateEarnings,
  calculateBaseEarnings,
} from '@/constants/phase2';
import { TOAST_DURATION_MS } from '@/constants/game';
import { phase2StateRef, Phase2SaveState } from '@/constants/phase2Ref';
import { useGame } from '@/contexts/GameContext';

interface Phase2State {
  ownedRecipes: string[];
  tables: number;
  chairs: number;
  earningsPerSecond: number;
  takeoutPerSecond: number;
  dineinPerSecond: number;
  earningIntervalMs: number;
  canTap: boolean;
  phase2GoalReached: boolean;
  showPhase2GoalPopup: boolean;
}

interface Phase2ContextType extends Phase2State {
  addMoney: (amount: number) => void;
  purchaseRecipe: (recipeId: string) => void;
  purchaseTable: () => void;
  purchaseChair: () => void;
  tapBonus: () => void;
  getTableCost: () => number;
  getChairCost: () => number;
  canAffordRecipe: (recipeId: string) => boolean;
  canAffordTable: () => boolean;
  canAffordChair: () => boolean;
  dismissPhase2GoalPopup: () => void;
  triggerToast: (message: string) => void;
}

const Phase2Context = createContext<Phase2ContextType | undefined>(undefined);

function Phase2ProviderInner({
  children,
  money,
  setMoney,
  setToastMessage,
  setShowToast,
  toastTimerRef,
  hasDoubleIncomeManager,
  currentSaveId,
  manualSave,
}: {
  children: React.ReactNode;
  money: number;
  setMoney: React.Dispatch<React.SetStateAction<number>>;
  setToastMessage: (msg: string | null) => void;
  setShowToast: (show: boolean) => void;
  toastTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  hasDoubleIncomeManager: boolean;
  currentSaveId: string | null;
  manualSave: () => void;
}) {
  const [ownedRecipes, setOwnedRecipes] = useState<string[]>(['lemonade']);
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [chairs, setChairs] = useState(INITIAL_CHAIRS);
  const [canTap, setCanTap] = useState(true);
  const [phase2GoalReached, setPhase2GoalReached] = useState(false);
  const [showPhase2GoalPopup, setShowPhase2GoalPopup] = useState(false);

  const earningIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tapCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moneyRef = useRef(money);
  const phase2GoalReachedRef = useRef(phase2GoalReached);

  // Keep refs in sync
  useEffect(() => {
    moneyRef.current = money;
  }, [money]);

  useEffect(() => {
    phase2GoalReachedRef.current = phase2GoalReached;
  }, [phase2GoalReached]);

  // Register getter + loader into shared ref for GameContext to access
  useEffect(() => {
    phase2StateRef.current = {
      getSaveState: () => ({
        ownedRecipes,
        tables,
        chairs,
        phase2GoalReached,
      }),
      loadFromSave: (data: Phase2SaveState) => {
        setOwnedRecipes(data.ownedRecipes?.length ? data.ownedRecipes : ['lemonade']);
        setTables(data.tables ?? INITIAL_TABLES);
        setChairs(data.chairs ?? INITIAL_CHAIRS);
        setPhase2GoalReached(data.phase2GoalReached ?? false);
      },
    };
    return () => {
      phase2StateRef.current = null;
    };
  }, [ownedRecipes, tables, chairs, phase2GoalReached]);

  // Load Phase 2 state from save when currentSaveId changes
  useEffect(() => {
    if (!currentSaveId) return;
    (async () => {
      const { loadGame: loadFromStorage } = await import('@/constants/saveManager');
      const save = await loadFromStorage(currentSaveId);
      if (save?.ownedRecipes) {
        setOwnedRecipes(save.ownedRecipes.length ? save.ownedRecipes : ['lemonade']);
        setTables(save.tables ?? INITIAL_TABLES);
        setChairs(save.chairs ?? INITIAL_CHAIRS);
        setPhase2GoalReached(save.phase2GoalReached ?? false);
      }
    })();
  }, [currentSaveId]);

  // Use Set for O(1) ownership checks
  const ownedRecipesSet = useMemo(() => new Set(ownedRecipes), [ownedRecipes]);

  // Memoize base earnings calculation
  const baseEarnings = useMemo(() => {
    return calculateBaseEarnings(ownedRecipesSet);
  }, [ownedRecipesSet]);

  // Memoize earnings calculation
  const { takeout: takeoutPerSecond, dinein: dineinPerSecond, total: earningsPerSecond } = useMemo(() => {
    return calculateEarnings(baseEarnings, tables, chairs);
  }, [baseEarnings, tables, chairs]);

  // Memoize earning interval
  const earningIntervalMs = useMemo(() => {
    return calculateEarningInterval(tables, chairs);
  }, [tables, chairs]);

  // Memoize table cost
  const tableCost = useMemo(() => calculateTableCost(tables), [tables]);

  // Memoize chair cost
  const chairCost = useMemo(() => calculateChairCost(tables), [tables]);

  // Stable addMoney callback
  const addMoney = useCallback((amount: number) => {
    let earned = amount;
    if (hasDoubleIncomeManager) {
      earned *= 2;
    }
    setMoney((prev) => {
      const newMoney = prev + earned;
      if (newMoney >= PHASE2_GOAL && !phase2GoalReachedRef.current) {
        setPhase2GoalReached(true);
        setShowPhase2GoalPopup(true);
      }
      return newMoney;
    });
  }, [hasDoubleIncomeManager, setMoney]);

  // Stable triggerToast callback
  const triggerToast = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, TOAST_DURATION_MS);
  }, [setToastMessage, setShowToast, toastTimerRef]);

  // Earning interval with stable callback
  useEffect(() => {
    if (earningIntervalRef.current) {
      clearInterval(earningIntervalRef.current);
    }

    const intervalEarnings = earningsPerSecond * (earningIntervalMs / 1000);
    if (intervalEarnings > 0) {
      earningIntervalRef.current = setInterval(() => {
        addMoney(intervalEarnings);
      }, earningIntervalMs);
    }

    return () => {
      if (earningIntervalRef.current) {
        clearInterval(earningIntervalRef.current);
      }
    };
  }, [earningIntervalMs, earningsPerSecond, addMoney]);

  // Stable purchase callbacks
  const purchaseRecipe = useCallback((recipeId: string) => {
    if (ownedRecipesSet.has(recipeId)) return;
    const recipe = RECIPE_MAP.get(recipeId);
    if (!recipe || moneyRef.current < recipe.cost) return;

    setMoney((prev) => prev - recipe.cost);
    setOwnedRecipes((prev) => [...prev, recipeId]);
    triggerToast(`🍳 ${recipe.name} unlocked!`);
  }, [ownedRecipesSet, setMoney, triggerToast]);

  const getTableCost = useCallback(() => tableCost, [tableCost]);
  const getChairCost = useCallback(() => chairCost, [chairCost]);

  const purchaseTable = useCallback(() => {
    if (tables >= MAX_TABLES) return;
    if (moneyRef.current < tableCost) return;

    setMoney((prev) => prev - tableCost);
    setTables((prev) => prev + 1);
    triggerToast('🪑 Table purchased!');
  }, [tables, tableCost, setMoney, triggerToast]);

  const purchaseChair = useCallback(() => {
    if (chairs >= MAX_CHAIRS) return;
    if (moneyRef.current < chairCost) return;

    setMoney((prev) => prev - chairCost);
    setChairs((prev) => prev + 1);
    triggerToast('💺 Chair purchased!');
  }, [chairs, chairCost, setMoney, triggerToast]);

  const tapBonus = useCallback(() => {
    if (!canTap) return;
    const bonus = earningsPerSecond * TAP_BONUS_PERCENT;
    addMoney(bonus);
    setCanTap(false);
    triggerToast(`+${Math.floor(bonus)} 💰`);

    tapCooldownRef.current = setTimeout(() => {
      setCanTap(true);
    }, TAP_COOLDOWN_MS);
  }, [canTap, earningsPerSecond, addMoney, triggerToast]);

  const canAffordRecipe = useCallback((recipeId: string) => {
    if (ownedRecipesSet.has(recipeId)) return false;
    const recipe = RECIPE_MAP.get(recipeId);
    return recipe ? money >= recipe.cost : false;
  }, [ownedRecipesSet, money]);

  const canAffordTable = useCallback(() => {
    return tables < MAX_TABLES && money >= tableCost;
  }, [tables, money, tableCost]);

  const canAffordChair = useCallback(() => {
    return chairs < MAX_CHAIRS && money >= chairCost;
  }, [chairs, money, chairCost]);

  const dismissPhase2GoalPopup = useCallback(() => {
    setShowPhase2GoalPopup(false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (earningIntervalRef.current) {
        clearInterval(earningIntervalRef.current);
      }
      if (tapCooldownRef.current) {
        clearTimeout(tapCooldownRef.current);
      }
    };
  }, []);

  const value = useMemo(() => ({
    ownedRecipes,
    tables,
    chairs,
    earningsPerSecond,
    takeoutPerSecond,
    dineinPerSecond,
    earningIntervalMs,
    canTap,
    phase2GoalReached,
    showPhase2GoalPopup,
    addMoney,
    purchaseRecipe,
    purchaseTable,
    purchaseChair,
    tapBonus,
    getTableCost,
    getChairCost,
    canAffordRecipe,
    canAffordTable,
    canAffordChair,
    dismissPhase2GoalPopup,
    triggerToast,
  }), [
    ownedRecipes,
    tables,
    chairs,
    earningsPerSecond,
    takeoutPerSecond,
    dineinPerSecond,
    earningIntervalMs,
    canTap,
    phase2GoalReached,
    showPhase2GoalPopup,
    addMoney,
    purchaseRecipe,
    purchaseTable,
    purchaseChair,
    tapBonus,
    getTableCost,
    getChairCost,
    canAffordRecipe,
    canAffordTable,
    canAffordChair,
    dismissPhase2GoalPopup,
    triggerToast,
  ]);

  return (
    <Phase2Context.Provider value={value}>
      {children}
    </Phase2Context.Provider>
  );
}

export function Phase2Provider({ children }: { children: React.ReactNode }) {
  const {
    money,
    setMoney,
    setToastMessage,
    setShowToast,
    toastTimerRef,
    hasDoubleIncomeManager,
    currentSaveId,
    manualSave,
  } = useGame();

  return (
    <Phase2ProviderInner
      money={money}
      setMoney={setMoney}
      setToastMessage={setToastMessage}
      setShowToast={setShowToast}
      toastTimerRef={toastTimerRef}
      hasDoubleIncomeManager={hasDoubleIncomeManager}
      currentSaveId={currentSaveId}
      manualSave={manualSave}
    >
      {children}
    </Phase2ProviderInner>
  );
}

export function usePhase2() {
  const context = useContext(Phase2Context);
  if (context === undefined) {
    throw new Error('usePhase2 must be used within a Phase2Provider');
  }
  return context;
}
