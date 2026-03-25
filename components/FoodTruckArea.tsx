import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { GameColors } from '@/constants/gameColors';
import { usePhase2 } from '@/contexts/Phase2Context';
import { useGame } from '@/contexts/GameContext';
import { RECIPE_MAP, PHASE2_GOAL } from '@/constants/phase2';
import { Toast } from '@/components/Toast';
import { GoalCard } from '@/components/GoalCard';
import { BuyRecipesSection } from '@/components/sections/BuyRecipesSection';
import { CapacitySection } from '@/components/sections/CapacitySection';

const RecipeBadge = React.memo(({ recipeId }: { recipeId: string }) => {
  const recipe = RECIPE_MAP.get(recipeId);
  if (!recipe) return null;
  return (
    <View style={styles.recipeBadge}>
      <Text style={styles.recipeBadgeEmoji}>{recipe.emoji}</Text>
      <Text style={styles.recipeBadgeName}>{recipe.name}</Text>
    </View>
  );
});
RecipeBadge.displayName = 'RecipeBadge';

export function FoodTruckArea() {
  const { ownedRecipes, earningsPerSecond, takeoutPerSecond, dineinPerSecond, canTap, tapBonus } = usePhase2();
  const { money, formatMoney, toastMessage, showToast, manualSave } = useGame();

  const formattedTakeout = useMemo(() => formatMoney(takeoutPerSecond), [formatMoney, takeoutPerSecond]);
  const formattedDinein = useMemo(() => formatMoney(dineinPerSecond), [formatMoney, dineinPerSecond]);
  const formattedTotal = useMemo(() => formatMoney(earningsPerSecond), [formatMoney, earningsPerSecond]);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Toast message={toastMessage} visible={showToast} />

      {/* Food Truck */}
      <TouchableOpacity style={styles.truckCard} onPress={tapBonus} activeOpacity={0.8} disabled={!canTap}>
        <View style={styles.truckImage}>
          <Text style={styles.truckEmoji}>🚚</Text>
          <Text style={styles.truckTitle}>Food Truck</Text>
        </View>
        <View style={[styles.tapBadge, !canTap && styles.tapBadgeCooldown]}>
          <Text style={styles.tapText}>{canTap ? 'TAP FOR BONUS!' : '⏳ Cooling down...'}</Text>
        </View>
      </TouchableOpacity>

      {/* Earnings Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Earnings</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>📦</Text>
            <Text style={styles.statValue}>{formattedTakeout}</Text>
            <Text style={styles.statLabel}>Take-out/sec</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🪑</Text>
            <Text style={styles.statValue}>{formattedDinein}</Text>
            <Text style={styles.statLabel}>Dine-in/sec</Text>
          </View>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalText}>Total: {formattedTotal} 💰/sec</Text>
        </View>
      </View>

      {/* Active Recipes */}
      <View style={styles.recipesCard}>
        <Text style={styles.recipesTitle}>Active Recipes</Text>
        <View style={styles.recipesGrid}>
          {ownedRecipes.map((id) => <RecipeBadge key={id} recipeId={id} />)}
        </View>
      </View>

      {/* Sections */}
      <BuyRecipesSection />
      <CapacitySection />

      {/* Goal Progress */}
      <GoalCard title="🎯 Phase 2 Goal" current={formatMoney(money)} target={formatMoney(PHASE2_GOAL)} progress={(money / PHASE2_GOAL) * 100} />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={manualSave} activeOpacity={0.7}>
        <Text style={styles.saveButtonText}>💾 Save Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: GameColors.contentBg },
  container: { padding: 16, gap: 14, paddingBottom: 32 },

  truckCard: {
    backgroundColor: GameColors.cardBg, borderRadius: 20, padding: 16, alignItems: 'center', gap: 12,
    shadowColor: GameColors.shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
    borderWidth: 1, borderColor: GameColors.borderLight,
  },
  truckImage: {
    width: 180, height: 120, backgroundColor: GameColors.pastelOrange, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  truckEmoji: { fontSize: 56 },
  truckTitle: { fontSize: 14, fontWeight: '700', color: GameColors.textPrimary },
  tapBadge: { backgroundColor: GameColors.buttonPrimary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  tapBadgeCooldown: { backgroundColor: GameColors.buttonDisabled },
  tapText: { fontSize: 14, fontWeight: '700', color: GameColors.white },

  statsCard: {
    backgroundColor: GameColors.pastelGreen, borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: '#A5D6A7',
  },
  statsTitle: { fontSize: 15, fontWeight: '700', color: GameColors.textPrimary, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4, flex: 1 },
  statDivider: { width: 1, height: 50, backgroundColor: '#A5D6A7' },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: 18, fontWeight: '800', color: GameColors.textPrimary },
  statLabel: { fontSize: 11, fontWeight: '600', color: GameColors.textSecondary },
  totalBadge: { backgroundColor: GameColors.white, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, alignSelf: 'center' },
  totalText: { fontSize: 16, fontWeight: '800', color: GameColors.buttonPrimary },

  recipesCard: {
    backgroundColor: GameColors.pastelPurple, borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: '#E1BEE7',
  },
  recipesTitle: { fontSize: 15, fontWeight: '700', color: GameColors.textPrimary },
  recipesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recipeBadge: {
    backgroundColor: GameColors.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  recipeBadgeEmoji: { fontSize: 18 },
  recipeBadgeName: { fontSize: 13, fontWeight: '600', color: GameColors.textPrimary },

  saveButton: {
    backgroundColor: GameColors.cardBg, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
    borderWidth: 2, borderColor: GameColors.woodBrown, borderStyle: 'dashed',
  },
  saveButtonText: { fontSize: 15, fontWeight: '700', color: GameColors.woodBrown },
});
