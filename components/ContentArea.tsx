import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { GameColors } from '@/constants/gameColors';
import { useGame } from '@/contexts/GameContext';
import { UPGRADE_MULTIPLIERS, BONUS_PRICE_INCREASE, GOAL_AMOUNT } from '@/constants/game';
import { Toast } from '@/components/Toast';
import { GoalCard } from '@/components/GoalCard';
import { FlavorSection } from '@/components/sections/FlavorSection';
import { EquipmentSection } from '@/components/sections/EquipmentSection';
import { SpeedSection } from '@/components/sections/SpeedSection';
import { sharedStyles } from '@/constants/sharedStyles';

export function ContentArea() {
  const {
    money, stock, maxStock, restockCost, upgradeCost, upgradeLevel,
    lemonPrice, isSelling, activeRestockManager, canUpgrade, canRestockWithDebt,
    restock, upgrade, manualSave, formatMoney,
    toastMessage, showToast, effectiveRestockCost, effectiveSellPrice,
    canTapP1, tapBonusP1, hasDoubleIncomeManager,
  } = useGame();

  const stockPercent = stock / maxStock;
  const isOutOfStock = stock === 0;
  const willGoNegative = activeRestockManager !== 'free' && canRestockWithDebt && money < effectiveRestockCost;

  const nextLevel = upgradeLevel + 1;
  const nextTierBonus = Math.floor((nextLevel - 1) / 5) * BONUS_PRICE_INCREASE;
  const nextPriceIncrease = UPGRADE_MULTIPLIERS.priceIncrease + nextTierBonus;
  const currentTier = Math.floor((nextLevel - 1) / 5) + 1;
  const isTierChange = nextLevel % 5 === 1 && nextLevel > 1;

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Toast message={toastMessage} visible={showToast} />

      {/* Lemonade Stand */}
      <View style={styles.standCard}>
        <View style={styles.standImage}>
          <Text style={styles.standEmoji}>🍋</Text>
          <Text style={styles.standTitle}>Lemonade Stand</Text>
        </View>
      </View>

      {/* Stock */}
      <View style={styles.stockCard}>
        <View style={styles.stockHeader}>
          <Text style={styles.stockLabel}>Stock Remaining</Text>
          <View style={styles.stockBadge}>
            <Text style={styles.stockValue}>{stock} / {maxStock}</Text>
          </View>
        </View>
        <View style={sharedStyles.goalProgressBg}>
          <View style={[sharedStyles.goalProgressFill, {
            width: `${stockPercent * 100}%`,
            backgroundColor: stockPercent <= 0.25 ? GameColors.progressLow : stockPercent <= 0.5 ? GameColors.progressMid : GameColors.progressFill,
          }]} />
        </View>
        {isOutOfStock && (
          <View style={styles.statusBadge}>
            <Text style={styles.outOfStockText}>⚠️ Out of stock! Restock to continue.</Text>
          </View>
        )}
        {isSelling && !isOutOfStock && (
          <View style={[styles.statusBadge, styles.sellingBadge]}>
            <Text style={styles.sellingText}>Selling... +{effectiveSellPrice} 💰/lemon</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[sharedStyles.actionButton, styles.restockBtn, (!canRestockWithDebt || stock === maxStock) && sharedStyles.buttonDisabled]}
          onPress={restock}
          disabled={!canRestockWithDebt || stock === maxStock}
          activeOpacity={0.7}
        >
          <Text style={styles.btnEmoji}>📦</Text>
          <Text style={styles.btnText}>Restock</Text>
          <View style={sharedStyles.costBadgeSmall}>
            <Text style={sharedStyles.costTextSmall}>
              {effectiveRestockCost === 0 ? 'FREE' : `${formatMoney(effectiveRestockCost)} 💰`}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[sharedStyles.actionButton, styles.upgradeBtn, !canUpgrade && sharedStyles.buttonDisabled]}
          onPress={upgrade}
          disabled={!canUpgrade}
          activeOpacity={0.7}
        >
          <Text style={styles.btnEmoji}>⬆️</Text>
          <Text style={styles.btnText}>Upgrade</Text>
          <View style={sharedStyles.costBadgeSmall}>
            <Text style={sharedStyles.costTextSmall}>{formatMoney(upgradeCost)} 💰</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Warnings & Status */}
      {willGoNegative && (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>⚠️ Restocking will put you in debt! You will earn it back by selling.</Text>
        </View>
      )}
      {activeRestockManager === 'auto' && <View style={styles.statusCard}><Text style={styles.statusText}>🔄 Auto-Restock Active</Text></View>}
      {activeRestockManager === 'free' && <View style={[styles.statusCard, styles.statusGreen]}><Text style={styles.statusText}>🆓 Free Restock Active</Text></View>}
      {hasDoubleIncomeManager && <View style={[styles.statusCard, styles.statusOrange]}><Text style={styles.statusText}>⚡ 2x Income Active</Text></View>}

      {/* Upgrade Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Text style={sharedStyles.sectionTitle}>Next Upgrade</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv {nextLevel} • Tier {currentTier}</Text>
          </View>
        </View>
        {isTierChange && <View style={styles.tierBadge}><Text style={styles.tierText}>⭐ NEW TIER!</Text></View>}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>📦</Text>
            <Text style={styles.infoValue}>+{UPGRADE_MULTIPLIERS.stockIncrease}</Text>
            <Text style={styles.infoLabel}>Max Stock</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>💰</Text>
            <Text style={styles.infoValue}>+{nextPriceIncrease}</Text>
            <Text style={styles.infoLabel}>Per Lemon</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>💵</Text>
            <Text style={styles.infoValue}>{formatMoney(restockCost + UPGRADE_MULTIPLIERS.restockCostIncrease)}</Text>
            <Text style={styles.infoLabel}>Restock Cost</Text>
          </View>
        </View>
      </View>

      {/* Lemon Squeeze */}
      <TouchableOpacity
        style={[styles.squeezeBtn, !canTapP1 && styles.squeezeCooldown]}
        onPress={tapBonusP1}
        disabled={!canTapP1}
        activeOpacity={0.7}
      >
        <Text style={styles.squeezeEmoji}>🍋</Text>
        <Text style={styles.squeezeText}>{canTapP1 ? 'SQUEEZE FOR BONUS!' : '⏳ Cooling down...'}</Text>
      </TouchableOpacity>

      {/* Phase 1 Feature Sections */}
      <FlavorSection />
      <EquipmentSection />
      <SpeedSection />

      {/* Goal Progress */}
      <GoalCard title="🎯 Goal Progress" current={formatMoney(money)} target={formatMoney(GOAL_AMOUNT)} progress={(money / GOAL_AMOUNT) * 100} />

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

  standCard: {
    backgroundColor: GameColors.cardBg, borderRadius: 20, padding: 16, alignItems: 'center',
    shadowColor: GameColors.shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: GameColors.borderLight,
  },
  standImage: {
    width: 180, height: 140, backgroundColor: GameColors.pastelOrange, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  standEmoji: { fontSize: 56 },
  standTitle: { fontSize: 14, fontWeight: '700', color: GameColors.textPrimary },

  stockCard: {
    backgroundColor: GameColors.cardBg, borderRadius: 16, padding: 16, gap: 10,
    shadowColor: GameColors.shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: GameColors.borderLight,
  },
  stockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockLabel: { fontSize: 14, fontWeight: '600', color: GameColors.textSecondary },
  stockBadge: { backgroundColor: GameColors.pastelGreen, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  stockValue: { fontSize: 14, fontWeight: '700', color: GameColors.buttonPrimary },
  statusBadge: { backgroundColor: GameColors.pastelRed, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  sellingBadge: { backgroundColor: GameColors.pastelGreen },
  outOfStockText: { fontSize: 13, fontWeight: '600', color: GameColors.progressLow, textAlign: 'center' },
  sellingText: { fontSize: 13, fontWeight: '600', color: GameColors.buttonPrimary, textAlign: 'center' },

  buttonRow: { flexDirection: 'row', gap: 12 },
  restockBtn: { backgroundColor: GameColors.buttonPrimary },
  upgradeBtn: { backgroundColor: GameColors.buttonSecondary },
  btnEmoji: { fontSize: 28 },
  btnText: { fontSize: 16, fontWeight: '700', color: GameColors.white },

  warningCard: { backgroundColor: GameColors.pastelRed, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: GameColors.progressLow },
  warningText: { fontSize: 13, fontWeight: '600', color: GameColors.progressLow, textAlign: 'center' },
  statusCard: { backgroundColor: GameColors.pastelBlue, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: GameColors.buttonSecondary },
  statusGreen: { backgroundColor: GameColors.pastelGreen, borderColor: GameColors.buttonPrimary },
  statusOrange: { backgroundColor: GameColors.pastelOrange, borderColor: GameColors.lemonYellow },
  statusText: { fontSize: 14, fontWeight: '700', color: GameColors.textPrimary, textAlign: 'center' },

  infoCard: {
    backgroundColor: GameColors.pastelPurple, borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: '#E1BEE7',
  },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelBadge: { backgroundColor: GameColors.white, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  levelText: { fontSize: 12, fontWeight: '700', color: GameColors.textSecondary },
  tierBadge: { backgroundColor: GameColors.lemonYellow, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start' },
  tierText: { fontSize: 13, fontWeight: '800', color: GameColors.woodBrown },
  infoGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 4 },
  infoItem: { alignItems: 'center', gap: 4, flex: 1 },
  infoDivider: { width: 1, height: 40, backgroundColor: '#CE93D8' },
  infoEmoji: { fontSize: 20 },
  infoValue: { fontSize: 16, fontWeight: '800', color: GameColors.textPrimary },
  infoLabel: { fontSize: 11, fontWeight: '600', color: GameColors.textSecondary },

  squeezeBtn: {
    backgroundColor: GameColors.pastelOrange, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: GameColors.lemonYellow,
  },
  squeezeCooldown: { opacity: 0.5 },
  squeezeEmoji: { fontSize: 40 },
  squeezeText: { fontSize: 14, fontWeight: '700', color: GameColors.textPrimary },

  saveButton: {
    backgroundColor: GameColors.cardBg, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
    borderWidth: 2, borderColor: GameColors.woodBrown, borderStyle: 'dashed',
  },
  saveButtonText: { fontSize: 15, fontWeight: '700', color: GameColors.woodBrown },
});
