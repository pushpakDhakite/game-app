import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  INITIAL_MONEY, INITIAL_STOCK, INITIAL_MAX_STOCK, INITIAL_LEMON_PRICE,
  INITIAL_RESTOCK_COST, INITIAL_UPGRADE_COST, GOAL_AMOUNT, MAX_NEGATIVE_MONEY,
  UPGRADE_MULTIPLIERS, BONUS_PRICE_INCREASE,
  FAMILY_DISCOUNT_CHANCE, PREMIUM_CUSTOMER_CHANCE, PREMIUM_CUSTOMER_MULTIPLIER, TOAST_DURATION_MS,
} from '@/constants/game';
import { getRandomName } from '@/constants/names';
import { SaveData, getAllSaves, saveGame as saveGameToStorage, loadGame as loadGameFromStorage, deleteSave as deleteSaveFromStorage, generateId } from '@/constants/saveManager';
import { phase2StateRef } from '@/constants/phase2Ref';
import { FLAVOR_MAP, EQUIPMENT_MAP, SPEED_BOOST_LEVELS, MAX_SPEED_LEVEL, TAP_BONUS_PERCENT_P1, TAP_COOLDOWN_MS_P1, calculateEquipmentCost, calculateFlavorBoost } from '@/constants/phase1';
import { triggerToast } from '@/utils/toast';

type RestockManagerType = 'auto' | 'free' | null;
type GamePhase = 1 | 2;

interface GameState {
  money: number; stock: number; maxStock: number;
  lemonPrice: number; restockCost: number; upgradeCost: number; upgradeLevel: number;
  goalReached: boolean; showGoalPopup: boolean; isSelling: boolean;
  playerName: string; isGameStarted: boolean; isLoading: boolean;
  showNamePopup: boolean; showSaveLoadModal: boolean;
  hasAutoManager: boolean; hasFreeRestockManager: boolean; hasDoubleIncomeManager: boolean;
  activeRestockManager: RestockManagerType;
  saves: SaveData[]; currentSaveId: string | null;
  toastMessage: string | null; showToast: boolean;
  currentPhase: GamePhase;
  ownedFlavors: string[]; cups: number; pitchers: number; fridges: number;
  speedLevel: number; canTapP1: boolean;
}

type Action =
  | { type: 'SET_SAVES'; saves: SaveData[] }
  | { type: 'START_GAME'; payload: { name: string; id: string } }
  | { type: 'LOAD_GAME'; save: SaveData }
  | { type: 'RESTART_GAME' }
  | { type: 'SELL'; effectiveSellPrice: number; hasDouble: boolean }
  | { type: 'RESTOCK'; cost: number; stock: number }
  | { type: 'UPGRADE'; cost: number; stockInc: number; priceInc: number; restockInc: number; newCost: number; newLevel: number }
  | { type: 'DISMISS_GOAL' }
  | { type: 'PURCHASE_AUTO' }
  | { type: 'PURCHASE_FREE' }
  | { type: 'PURCHASE_DOUBLE' }
  | { type: 'SET_ACTIVE_RESTOCK'; active: RestockManagerType }
  | { type: 'BUY_FLAVOR'; id: string; cost: number }
  | { type: 'BUY_EQUIPMENT'; id: string; cost: number }
  | { type: 'BUY_SPEED'; cost: number }
  | { type: 'TAP_BONUS'; amount: number }
  | { type: 'SET_CAN_TAP'; value: boolean }
  | { type: 'SET_TOAST'; message: string | null }
  | { type: 'SHOW_SAVE_MODAL'; show: boolean }
  | { type: 'UPDATE_MONEY'; amount: number };

const INITIAL_STATE: GameState = {
  money: INITIAL_MONEY, stock: INITIAL_STOCK, maxStock: INITIAL_MAX_STOCK,
  lemonPrice: INITIAL_LEMON_PRICE, restockCost: INITIAL_RESTOCK_COST,
  upgradeCost: INITIAL_UPGRADE_COST, upgradeLevel: 1,
  goalReached: false, showGoalPopup: false, isSelling: false,
  playerName: '', isGameStarted: false, isLoading: true,
  showNamePopup: false, showSaveLoadModal: false,
  hasAutoManager: false, hasFreeRestockManager: false, hasDoubleIncomeManager: false,
  activeRestockManager: null,
  saves: [], currentSaveId: null,
  toastMessage: null, showToast: false,
  currentPhase: 1,
  ownedFlavors: ['classic'], cups: 0, pitchers: 0, fridges: 0,
  speedLevel: 0, canTapP1: true,
};

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_SAVES':
      return { ...state, saves: action.saves };

    case 'START_GAME':
      return {
        ...INITIAL_STATE,
        playerName: action.payload.name,
        currentSaveId: action.payload.id,
        isGameStarted: true,
        isSelling: true,
        isLoading: false,
        showNamePopup: false,
      };

    case 'LOAD_GAME': {
      const s = action.save;
      return {
        ...state,
        money: s.money, stock: s.stock, maxStock: s.maxStock,
        lemonPrice: s.lemonPrice, restockCost: s.restockCost,
        upgradeCost: s.upgradeCost, upgradeLevel: s.upgradeLevel,
        goalReached: s.goalReached, hasAutoManager: s.hasManager,
        hasFreeRestockManager: s.hasFreeRestockManager ?? false,
        hasDoubleIncomeManager: s.hasDoubleIncomeManager ?? false,
        activeRestockManager: s.activeRestockManager ?? null,
        currentPhase: s.currentPhase ?? 1,
        ownedFlavors: s.ownedFlavors?.length ? s.ownedFlavors : ['classic'],
        cups: s.cups ?? 0, pitchers: s.pitchers ?? 0,
        fridges: s.fridges ?? 0, speedLevel: s.speedLevel ?? 0,
        playerName: s.name, currentSaveId: s.id,
        showNamePopup: false, isGameStarted: true, isSelling: true,
        isLoading: false,
      };
    }

    case 'RESTART_GAME':
      return { ...INITIAL_STATE, isLoading: false, showNamePopup: true };

    case 'SELL': {
      const isFamilyDiscount = Math.random() < FAMILY_DISCOUNT_CHANCE;
      const isPremium = !isFamilyDiscount && Math.random() < PREMIUM_CUSTOMER_CHANCE;
      let earned: number;
      let toastMsg: string | null = null;

      if (isFamilyDiscount) {
        earned = Math.floor(action.effectiveSellPrice / 2);
        toastMsg = '👨‍💼 Family Discount!';
      } else if (isPremium) {
        earned = Math.floor(action.effectiveSellPrice * PREMIUM_CUSTOMER_MULTIPLIER);
        toastMsg = '⭐ Premium Customer!';
      } else {
        earned = action.effectiveSellPrice;
      }
      if (action.hasDouble) earned *= 2;

      const newStock = state.stock - 1;
      const newMoney = state.money + earned;
      return {
        ...state,
        stock: newStock,
        money: newMoney,
        isSelling: newStock > 0,
        goalReached: newMoney >= GOAL_AMOUNT ? true : state.goalReached,
        showGoalPopup: newMoney >= GOAL_AMOUNT && !state.goalReached ? true : state.showGoalPopup,
        toastMessage: toastMsg ?? state.toastMessage,
        showToast: toastMsg !== null,
      };
    }

    case 'RESTOCK':
      return { ...state, money: state.money - action.cost, stock: action.stock, isSelling: true };

    case 'UPGRADE':
      return {
        ...state,
        money: state.money - action.cost,
        maxStock: state.maxStock + action.stockInc,
        lemonPrice: state.lemonPrice + action.priceInc,
        restockCost: state.restockCost + action.restockInc,
        upgradeCost: action.newCost,
        upgradeLevel: action.newLevel,
        stock: state.stock + action.stockInc,
      };

    case 'DISMISS_GOAL':
      return { ...state, showGoalPopup: false, money: 0, currentPhase: 2 };

    case 'PURCHASE_AUTO':
      return { ...state, hasAutoManager: true, activeRestockManager: 'auto' };

    case 'PURCHASE_FREE':
      return { ...state, money: state.money - 10000, hasFreeRestockManager: true, activeRestockManager: 'free' };

    case 'PURCHASE_DOUBLE':
      return { ...state, money: state.money - 25000, hasDoubleIncomeManager: true };

    case 'SET_ACTIVE_RESTOCK':
      return { ...state, activeRestockManager: action.active };

    case 'BUY_FLAVOR':
      return { ...state, money: state.money - action.cost, ownedFlavors: [...state.ownedFlavors, action.id] };

    case 'BUY_EQUIPMENT': {
      const updates: Partial<GameState> = { money: state.money - action.cost };
      if (action.id === 'cups') updates.cups = state.cups + 1;
      else if (action.id === 'pitcher') updates.pitchers = state.pitchers + 1;
      else updates.fridges = state.fridges + 1;
      return { ...state, ...updates };
    }

    case 'BUY_SPEED':
      return { ...state, money: state.money - action.cost, speedLevel: state.speedLevel + 1 };

    case 'TAP_BONUS':
      return { ...state, money: state.money + action.amount, canTapP1: false };

    case 'SET_CAN_TAP':
      return { ...state, canTapP1: action.value };

    case 'SET_TOAST':
      return { ...state, toastMessage: action.message };

    case 'SHOW_SAVE_MODAL':
      return { ...state, showSaveLoadModal: action.show };

    case 'UPDATE_MONEY': {
      const newMoney = state.money + action.amount;
      return {
        ...state,
        money: newMoney,
        goalReached: newMoney >= GOAL_AMOUNT ? true : state.goalReached,
        showGoalPopup: newMoney >= GOAL_AMOUNT && !state.goalReached ? true : state.showGoalPopup,
      };
    }

    default:
      return state;
  }
}

// Context types
interface GameContextType extends GameState {
  effectiveSellPrice: number;
  effectiveSellInterval: number;
  effectiveRestockCost: number;
  canRestock: boolean;
  canUpgrade: boolean;
  canRestockWithDebt: boolean;
  formatMoney: (amount: number) => string;
  sellLemonade: () => void;
  restock: () => void;
  upgrade: () => void;
  dismissGoalPopup: () => void;
  startGame: (name: string) => void;
  purchaseAutoManager: () => void;
  purchaseFreeRestockManager: () => void;
  purchaseDoubleIncomeManager: () => void;
  setActiveRestockManager: (type: RestockManagerType) => void;
  manualSave: () => void;
  loadGame: (saveId: string) => void;
  deleteSave: (saveId: string) => void;
  restartGame: () => void;
  buyFlavor: (flavorId: string) => void;
  buyEquipment: (equipId: string) => void;
  buySpeedBoost: () => void;
  tapBonusP1: () => void;
  getEquipmentCost: (equipId: string) => number;
  canAffordFlavor: (flavorId: string) => boolean;
  canAffordEquipment: (equipId: string) => boolean;
  canAffordSpeedBoost: () => boolean;
  setToastMessage: (msg: string | null) => void;
  setShowToast: (show: boolean) => void;
  setShowSaveLoadModal: (show: boolean) => void;
  setMoney: React.Dispatch<React.SetStateAction<number>>;
  toastTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  startPhase2: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  const sellIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Computed values (recompute on state change)
  const flavorBoost = useMemo(() => calculateFlavorBoost(state.ownedFlavors), [state.ownedFlavors]);
  const effectiveSellPrice = state.lemonPrice + flavorBoost;
  const effectiveSellInterval = SPEED_BOOST_LEVELS[Math.min(state.speedLevel, MAX_SPEED_LEVEL)].interval;
  const effectiveRestockCost = useMemo(() =>
    state.activeRestockManager === 'free' ? 0 : state.restockCost,
    [state.activeRestockManager, state.restockCost]
  );
  const canRestock = useMemo(() =>
    state.stock < state.maxStock && (state.activeRestockManager === 'free' || state.money >= state.restockCost || state.money - state.restockCost >= MAX_NEGATIVE_MONEY),
    [state.stock, state.maxStock, state.activeRestockManager, state.money, state.restockCost]
  );
  const canUpgrade = useMemo(() => state.money >= state.upgradeCost, [state.money, state.upgradeCost]);
  const canRestockWithDebt = useMemo(() =>
    state.stock < state.maxStock && (state.activeRestockManager === 'free' || state.money - state.restockCost >= MAX_NEGATIVE_MONEY),
    [state.stock, state.maxStock, state.activeRestockManager, state.money, state.restockCost]
  );

  // Stable helpers
  const formatMoney = useCallback((amount: number): string => {
    if (amount == null || isNaN(amount)) return '0';
    if (amount < 0) return `-${formatMoney(-amount)}`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return Math.floor(amount).toString();
  }, []);

  const showToastMsg = useCallback((msg: string) => {
    triggerToast(msg, (m) => dispatch({ type: 'SET_TOAST', message: m }), (s) => { if (!s) dispatch({ type: 'SET_TOAST', message: null }); }, toastTimerRef);
  }, []);

  // Save data helper
  const getCurrentSaveData = useCallback((): SaveData => {
    const p2 = phase2StateRef.current?.getSaveState();
    return {
      id: state.currentSaveId || generateId(), name: state.playerName,
      money: state.money, stock: state.stock, maxStock: state.maxStock,
      lemonPrice: state.lemonPrice, restockCost: state.restockCost,
      upgradeCost: state.upgradeCost, upgradeLevel: state.upgradeLevel,
      goalReached: state.goalReached, hasManager: state.hasAutoManager,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      currentPhase: state.currentPhase,
      hasFreeRestockManager: state.hasFreeRestockManager,
      hasDoubleIncomeManager: state.hasDoubleIncomeManager,
      activeRestockManager: state.activeRestockManager,
      ownedRecipes: p2?.ownedRecipes, tables: p2?.tables, chairs: p2?.chairs, phase2GoalReached: p2?.phase2GoalReached,
      ownedFlavors: state.ownedFlavors, cups: state.cups, pitchers: state.pitchers, fridges: state.fridges, speedLevel: state.speedLevel,
    };
  }, [state]);

  // Auto-save on state snapshot
  const triggerAutoSave = useCallback(() => {
    if (!state.isGameStarted || !state.playerName) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      const data = getCurrentSaveData();
      await saveGameToStorage(data);
      const updatedSaves = await getAllSaves();
      dispatch({ type: 'SET_SAVES', saves: updatedSaves });
    }, 60000);
  }, [state.isGameStarted, state.playerName, getCurrentSaveData]);

  // Load saves on startup
  useEffect(() => {
    const timer = setTimeout(async () => {
      const loadedSaves = await getAllSaves();
      dispatch({ type: 'SET_SAVES', saves: loadedSaves });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Selling interval
  useEffect(() => {
    if (sellIntervalRef.current) clearInterval(sellIntervalRef.current);
    if (state.isSelling && state.stock > 0) {
      sellIntervalRef.current = setInterval(() => {
        dispatch({ type: 'SELL', effectiveSellPrice, hasDouble: state.hasDoubleIncomeManager });
      }, effectiveSellInterval);
    }
    return () => { if (sellIntervalRef.current) clearInterval(sellIntervalRef.current); };
  }, [state.isSelling, state.stock, effectiveSellPrice, effectiveSellInterval, state.hasDoubleIncomeManager]);

  // Auto-restock
  useEffect(() => {
    if (state.activeRestockManager === 'auto' && state.stock === 0 && state.isGameStarted && canRestockWithDebt) {
      dispatch({ type: 'RESTOCK', cost: state.restockCost, stock: state.maxStock });
      triggerAutoSave();
    }
  }, [state.activeRestockManager, state.stock, state.isGameStarted, canRestockWithDebt, state.restockCost, state.maxStock, triggerAutoSave]);

  // Toast auto-hide
  useEffect(() => {
    if (!state.showToast) return;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => dispatch({ type: 'SET_TOAST', message: null }), TOAST_DURATION_MS);
  }, [state.showToast]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (tapCooldownRef.current) clearTimeout(tapCooldownRef.current);
      if (sellIntervalRef.current) clearInterval(sellIntervalRef.current);
    };
  }, []);

  // Stable action callbacks
  const startGame = useCallback(async (name: string) => {
    const finalName = name.length > 0 ? name : getRandomName();
    const newId = generateId();
    dispatch({ type: 'START_GAME', payload: { name: finalName, id: newId } });
    const newSave: SaveData = {
      id: newId, name: finalName,
      money: INITIAL_MONEY, stock: INITIAL_STOCK, maxStock: INITIAL_MAX_STOCK,
      lemonPrice: INITIAL_LEMON_PRICE, restockCost: INITIAL_RESTOCK_COST,
      upgradeCost: INITIAL_UPGRADE_COST, upgradeLevel: 1,
      goalReached: false, hasManager: false,
      currentPhase: 1, hasFreeRestockManager: false, hasDoubleIncomeManager: false, activeRestockManager: null,
      ownedRecipes: ['lemonade'], tables: 0, chairs: 0, phase2GoalReached: false,
      ownedFlavors: ['classic'], cups: 0, pitchers: 0, fridges: 0, speedLevel: 0,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await saveGameToStorage(newSave);
    const updatedSaves = await getAllSaves();
    dispatch({ type: 'SET_SAVES', saves: updatedSaves });
  }, []);

  const loadGameFn = useCallback(async (saveId: string) => {
    const save = await loadGameFromStorage(saveId);
    if (save) dispatch({ type: 'LOAD_GAME', save });
  }, []);

  const deleteSaveFn = useCallback(async (saveId: string) => {
    await deleteSaveFromStorage(saveId);
    const updatedSaves = await getAllSaves();
    dispatch({ type: 'SET_SAVES', saves: updatedSaves });
  }, []);

  const restartGame = useCallback(async () => {
    dispatch({ type: 'RESTART_GAME' });
    const loadedSaves = await getAllSaves();
    dispatch({ type: 'SET_SAVES', saves: loadedSaves });
  }, []);

  const sellLemonade = useCallback(() => {
    dispatch({ type: 'SELL', effectiveSellPrice, hasDouble: state.hasDoubleIncomeManager });
  }, [effectiveSellPrice, state.hasDoubleIncomeManager]);

  const restock = useCallback(() => {
    if (canRestockWithDebt) {
      const cost = state.activeRestockManager === 'free' ? 0 : state.restockCost;
      dispatch({ type: 'RESTOCK', cost, stock: state.maxStock });
      triggerAutoSave();
    }
  }, [canRestockWithDebt, state.activeRestockManager, state.restockCost, state.maxStock, triggerAutoSave]);

  const upgrade = useCallback(() => {
    if (state.money >= state.upgradeCost) {
      const newLevel = state.upgradeLevel + 1;
      const tierBonus = Math.floor((newLevel - 1) / 5) * BONUS_PRICE_INCREASE;
      const priceIncrease = UPGRADE_MULTIPLIERS.priceIncrease + tierBonus;
      dispatch({
        type: 'UPGRADE',
        cost: state.upgradeCost, stockInc: UPGRADE_MULTIPLIERS.stockIncrease,
        priceInc: priceIncrease, restockInc: UPGRADE_MULTIPLIERS.restockCostIncrease,
        newCost: Math.floor(state.upgradeCost * UPGRADE_MULTIPLIERS.upgradeCostMultiplier),
        newLevel,
      });
      triggerAutoSave();
    }
  }, [state.money, state.upgradeCost, state.upgradeLevel, triggerAutoSave]);

  const dismissGoalPopup = useCallback(() => {
    dispatch({ type: 'DISMISS_GOAL' });
    triggerAutoSave();
  }, [triggerAutoSave]);

  const purchaseAutoManager = useCallback(() => { dispatch({ type: 'PURCHASE_AUTO' }); triggerAutoSave(); }, [triggerAutoSave]);
  const purchaseFreeRestockManager = useCallback(() => {
    if (state.money >= 10000) { dispatch({ type: 'PURCHASE_FREE' }); triggerAutoSave(); }
  }, [state.money, triggerAutoSave]);
  const purchaseDoubleIncomeManager = useCallback(() => {
    if (state.money >= 25000) { dispatch({ type: 'PURCHASE_DOUBLE' }); triggerAutoSave(); }
  }, [state.money, triggerAutoSave]);

  const setActiveRestockManager = useCallback((type: RestockManagerType) => {
    if (type === 'auto' && !state.hasAutoManager) return;
    if (type === 'free' && !state.hasFreeRestockManager) return;
    dispatch({ type: 'SET_ACTIVE_RESTOCK', active: type });
  }, [state.hasAutoManager, state.hasFreeRestockManager]);

  const manualSave = useCallback(async () => {
    if (!state.isGameStarted || !state.playerName) return;
    const data = getCurrentSaveData();
    await saveGameToStorage(data);
    const updatedSaves = await getAllSaves();
    dispatch({ type: 'SET_SAVES', saves: updatedSaves });
  }, [state.isGameStarted, state.playerName, getCurrentSaveData]);

  const buyFlavor = useCallback((flavorId: string) => {
    const flavor = FLAVOR_MAP.get(flavorId);
    if (!flavor || state.ownedFlavors.includes(flavorId) || state.money < flavor.cost) return;
    dispatch({ type: 'BUY_FLAVOR', id: flavorId, cost: flavor.cost });
    showToastMsg(`${flavor.emoji} ${flavor.name} unlocked!`);
    triggerAutoSave();
  }, [state.ownedFlavors, state.money, showToastMsg, triggerAutoSave]);

  const buyEquipment = useCallback((equipId: string) => {
    const equip = EQUIPMENT_MAP.get(equipId);
    if (!equip) return;
    const owned = equipId === 'cups' ? state.cups : equipId === 'pitcher' ? state.pitchers : state.fridges;
    if (owned >= equip.maxCount) return;
    const cost = calculateEquipmentCost(equip, owned);
    if (state.money < cost) return;
    dispatch({ type: 'BUY_EQUIPMENT', id: equipId, cost });
    showToastMsg(`${equip.emoji} ${equip.name} purchased!`);
    triggerAutoSave();
  }, [state.cups, state.pitchers, state.fridges, state.money, showToastMsg, triggerAutoSave]);

  const buySpeedBoost = useCallback(() => {
    if (state.speedLevel >= MAX_SPEED_LEVEL) return;
    const cost = SPEED_BOOST_LEVELS[state.speedLevel + 1].cost;
    if (state.money < cost) return;
    dispatch({ type: 'BUY_SPEED', cost });
    showToastMsg(`⚡ Speed Level ${state.speedLevel + 1}!`);
    triggerAutoSave();
  }, [state.speedLevel, state.money, showToastMsg, triggerAutoSave]);

  const tapBonusP1 = useCallback(() => {
    if (!state.canTapP1) return;
    const bonus = Math.floor(effectiveSellPrice * TAP_BONUS_PERCENT_P1);
    if (bonus <= 0) return;
    dispatch({ type: 'TAP_BONUS', amount: bonus });
    showToastMsg(`+${bonus} 💰`);
    if (tapCooldownRef.current) clearTimeout(tapCooldownRef.current);
    tapCooldownRef.current = setTimeout(() => dispatch({ type: 'SET_CAN_TAP', value: true }), TAP_COOLDOWN_MS_P1);
  }, [state.canTapP1, effectiveSellPrice, showToastMsg]);

  const getEquipmentCost = useCallback((equipId: string): number => {
    const equip = EQUIPMENT_MAP.get(equipId);
    if (!equip) return 0;
    const owned = equipId === 'cups' ? state.cups : equipId === 'pitcher' ? state.pitchers : state.fridges;
    return calculateEquipmentCost(equip, owned);
  }, [state.cups, state.pitchers, state.fridges]);

  const canAffordFlavor = useCallback((flavorId: string): boolean => {
    if (state.ownedFlavors.includes(flavorId)) return false;
    const flavor = FLAVOR_MAP.get(flavorId);
    return flavor ? state.money >= flavor.cost : false;
  }, [state.ownedFlavors, state.money]);

  const canAffordEquipment = useCallback((equipId: string): boolean => {
    const equip = EQUIPMENT_MAP.get(equipId);
    if (!equip) return false;
    const owned = equipId === 'cups' ? state.cups : equipId === 'pitcher' ? state.pitchers : state.fridges;
    if (owned >= equip.maxCount) return false;
    return state.money >= calculateEquipmentCost(equip, owned);
  }, [state.cups, state.pitchers, state.fridges, state.money]);

  const canAffordSpeedBoost = useCallback((): boolean => {
    if (state.speedLevel >= MAX_SPEED_LEVEL) return false;
    return state.money >= SPEED_BOOST_LEVELS[state.speedLevel + 1].cost;
  }, [state.speedLevel, state.money]);

  // Stable refs for latest state (for updater functions)
  const stateRef = useRef(state);
  stateRef.current = state;

  const setMoney = useCallback((value: React.SetStateAction<number>) => {
    const newValue = typeof value === 'function' ? value(stateRef.current.money) : value;
    const diff = newValue - stateRef.current.money;
    if (diff !== 0) {
      dispatch({ type: 'UPDATE_MONEY', amount: diff });
    }
  }, []);

  const setShowSaveLoadModal = useCallback((show: boolean) => {
    dispatch({ type: 'SHOW_SAVE_MODAL', show });
  }, []);

  const startPhase2 = useCallback(() => {
    // This is handled by dismissGoalPopup which sets phase to 2
    // Kept for backward compat
  }, []);

  const value = useMemo(() => ({
    ...state,
    effectiveSellPrice, effectiveSellInterval, effectiveRestockCost,
    canRestock, canUpgrade, canRestockWithDebt,
    formatMoney, sellLemonade, restock, upgrade, dismissGoalPopup,
    startGame, purchaseAutoManager, purchaseFreeRestockManager,
    purchaseDoubleIncomeManager, setActiveRestockManager,
    manualSave, loadGame: loadGameFn, deleteSave: deleteSaveFn, restartGame,
    buyFlavor, buyEquipment, buySpeedBoost, tapBonusP1,
    getEquipmentCost, canAffordFlavor, canAffordEquipment, canAffordSpeedBoost,
    setToastMessage: (msg: string | null) => dispatch({ type: 'SET_TOAST', message: msg }),
    setShowToast: () => {}, // Toast handled by reducer
    setShowSaveLoadModal, setMoney, toastTimerRef, startPhase2,
  }), [
    state, effectiveSellPrice, effectiveSellInterval, effectiveRestockCost,
    canRestock, canUpgrade, canRestockWithDebt,
    formatMoney, sellLemonade, restock, upgrade, dismissGoalPopup,
    startGame, purchaseAutoManager, purchaseFreeRestockManager,
    purchaseDoubleIncomeManager, setActiveRestockManager,
    manualSave, loadGameFn, deleteSaveFn, restartGame,
    buyFlavor, buyEquipment, buySpeedBoost, tapBonusP1,
    getEquipmentCost, canAffordFlavor, canAffordEquipment, canAffordSpeedBoost,
    setShowSaveLoadModal, setMoney, startPhase2,
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
