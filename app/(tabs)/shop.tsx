import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameColors } from '@/constants/gameColors';
import { useGame } from '@/contexts/GameContext';
import { MANAGER_PRICE_USD, FREE_RESTOCK_MANAGER_COST, DOUBLE_INCOME_MANAGER_COST } from '@/constants/game';

// Memoized Manager Card
const ManagerCard = React.memo(function ManagerCard({
  emoji,
  title,
  subtitle,
  features,
  owned,
  active,
  onBuy,
  onActivate,
  price,
  priceType,
  canAfford,
  backgroundColor,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  features: { emoji: string; text: string }[];
  owned: boolean;
  active: boolean;
  onBuy: () => void;
  onActivate: () => void;
  price: string;
  priceType: 'real' | 'game';
  canAfford: boolean;
  backgroundColor: string;
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardImage, { backgroundColor }]}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
        <Text style={styles.cardImageTitle}>{title}</Text>
        {owned && (
          <View style={styles.ownedBadge}>
            <Text style={styles.ownedText}>✓ Owned</Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
        <View style={styles.features}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>
        {!owned ? (
          <TouchableOpacity
            style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
            onPress={onBuy}
            activeOpacity={0.7}
            disabled={!canAfford}
          >
            <Text style={styles.buyBtnText}>
              {priceType === 'real' ? 'Buy Now' : 'Purchase'}
            </Text>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{price}</Text>
            </View>
          </TouchableOpacity>
        ) : active ? (
          <View style={[styles.buyBtn, styles.activeBtn]}>
            <Text style={styles.buyBtnText}>✓ Active</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.buyBtn, styles.activateBtn]}
            onPress={onActivate}
            activeOpacity={0.7}
          >
            <Text style={styles.buyBtnText}>Activate</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

export default function ShopScreen() {
  const {
    hasAutoManager,
    hasFreeRestockManager,
    hasDoubleIncomeManager,
    activeRestockManager,
    purchaseAutoManager,
    purchaseFreeRestockManager,
    purchaseDoubleIncomeManager,
    setActiveRestockManager,
    money,
    formatMoney,
  } = useGame();

  // Memoize formatted money
  const formattedMoney = useMemo(() => formatMoney(money), [formatMoney, money]);
  const formattedFreeCost = useMemo(() => formatMoney(FREE_RESTOCK_MANAGER_COST), [formatMoney]);
  const formattedDoubleCost = useMemo(() => formatMoney(DOUBLE_INCOME_MANAGER_COST), [formatMoney]);

  // Stable callbacks
  const handlePurchaseAuto = useCallback(() => {
    if (hasAutoManager) return;
    Alert.alert(
      'Purchase Auto-Restock Manager',
      `This will activate the Auto-Restock Manager. (IAP placeholder - ${MANAGER_PRICE_USD})`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Activate', onPress: () => purchaseAutoManager() },
      ]
    );
  }, [hasAutoManager, purchaseAutoManager]);

  const handlePurchaseFree = useCallback(() => {
    if (hasFreeRestockManager) return;
    if (money < FREE_RESTOCK_MANAGER_COST) {
      Alert.alert('Not Enough Money', `You need ${formattedFreeCost} 💰 to buy this manager.`);
      return;
    }
    Alert.alert(
      'Purchase Free Restock Manager',
      `This will cost ${formattedFreeCost} 💰 and allow free restocking.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Buy', onPress: () => purchaseFreeRestockManager() },
      ]
    );
  }, [hasFreeRestockManager, money, formattedFreeCost, purchaseFreeRestockManager]);

  const handlePurchaseDouble = useCallback(() => {
    if (hasDoubleIncomeManager) return;
    if (money < DOUBLE_INCOME_MANAGER_COST) {
      Alert.alert('Not Enough Money', `You need ${formattedDoubleCost} 💰 to buy this manager.`);
      return;
    }
    Alert.alert(
      'Purchase 2x Income Manager',
      `This will cost ${formattedDoubleCost} 💰 and permanently double your income.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Buy', onPress: () => purchaseDoubleIncomeManager() },
      ]
    );
  }, [hasDoubleIncomeManager, money, formattedDoubleCost, purchaseDoubleIncomeManager]);

  const handleActivateAuto = useCallback(() => setActiveRestockManager('auto'), [setActiveRestockManager]);
  const handleActivateFree = useCallback(() => setActiveRestockManager('free'), [setActiveRestockManager]);
  const handleActivateNone = useCallback(() => setActiveRestockManager(null), [setActiveRestockManager]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛒 Shop</Text>
        <View style={styles.moneyBadge}>
          <Text style={styles.moneyIcon}>💰</Text>
          <Text style={styles.headerMoney}>{formattedMoney}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Phase 1 Managers (always show) */}
        <Text style={styles.sectionTitle}>Managers</Text>

        <ManagerCard
          emoji="🔄"
          title="Auto-Restock"
          subtitle="Automatically restocks when stock runs out"
          features={[
            { emoji: '⚡', text: 'Instant auto-restock' },
            { emoji: '🔄', text: 'Works even with debt' },
          ]}
          owned={hasAutoManager}
          active={activeRestockManager === 'auto'}
          onBuy={handlePurchaseAuto}
          onActivate={handleActivateAuto}
          price={`${MANAGER_PRICE_USD}`}
          priceType="real"
          canAfford={true}
          backgroundColor={GameColors.pastelBlue}
        />

        <ManagerCard
          emoji="🆓"
          title="Free Restock"
          subtitle="Restock your stand for free! No money required"
          features={[
            { emoji: '💰', text: 'Restock costs 0 💰' },
            { emoji: '📦', text: 'Unlimited restocks' },
          ]}
          owned={hasFreeRestockManager}
          active={activeRestockManager === 'free'}
          onBuy={handlePurchaseFree}
          onActivate={handleActivateFree}
          price={`${formattedFreeCost} 💰`}
          priceType="game"
          canAfford={money >= FREE_RESTOCK_MANAGER_COST}
          backgroundColor={GameColors.pastelGreen}
        />

        <Text style={styles.sectionTitle}>Income Boosts</Text>

        <ManagerCard
          emoji="⚡"
          title="2x Income"
          subtitle="Permanently double all your earnings!"
          features={[
            { emoji: '📈', text: '2x earnings per sale' },
            { emoji: '✨', text: 'Stacks with everything' },
          ]}
          owned={hasDoubleIncomeManager}
          active={hasDoubleIncomeManager}
          onBuy={handlePurchaseDouble}
          onActivate={() => {}}
          price={`${formattedDoubleCost} 💰`}
          priceType="game"
          canAfford={money >= DOUBLE_INCOME_MANAGER_COST}
          backgroundColor={GameColors.pastelOrange}
        />

        {/* Manager Selection */}
        {(hasAutoManager || hasFreeRestockManager) && (
          <View style={styles.selectionCard}>
            <Text style={styles.selectionTitle}>Active Restock Manager</Text>
            <View style={styles.selectionRow}>
              {hasAutoManager && (
                <TouchableOpacity
                  style={[styles.selectionBtn, activeRestockManager === 'auto' && styles.selectionBtnActive]}
                  onPress={handleActivateAuto}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.selectionBtnText, activeRestockManager === 'auto' && styles.selectionBtnTextActive]}>
                    🔄 Auto
                  </Text>
                </TouchableOpacity>
              )}
              {hasFreeRestockManager && (
                <TouchableOpacity
                  style={[styles.selectionBtn, activeRestockManager === 'free' && styles.selectionBtnActive]}
                  onPress={handleActivateFree}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.selectionBtnText, activeRestockManager === 'free' && styles.selectionBtnTextActive]}>
                    🆓 Free
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.selectionBtn, activeRestockManager === null && styles.selectionBtnActive]}
                onPress={handleActivateNone}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectionBtnText, activeRestockManager === null && styles.selectionBtnTextActive]}>
                  ✕ None
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipsText}>
            Purchase managers to automate restocking and boost income!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.contentBg,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: GameColors.topBarBg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: GameColors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: GameColors.textPrimary,
  },
  moneyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GameColors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: GameColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moneyIcon: {
    fontSize: 16,
  },
  headerMoney: {
    fontSize: 16,
    fontWeight: '800',
    color: GameColors.woodBrown,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: GameColors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },

  // Manager Card
  card: {
    backgroundColor: GameColors.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: GameColors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: GameColors.borderLight,
  },
  cardImage: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardEmoji: {
    fontSize: 40,
  },
  cardImageTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: GameColors.textPrimary,
    marginTop: 4,
  },
  ownedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: GameColors.buttonPrimary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ownedText: {
    fontSize: 11,
    fontWeight: '700',
    color: GameColors.white,
  },
  cardContent: {
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GameColors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: GameColors.textSecondary,
    lineHeight: 18,
  },
  features: {
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureEmoji: {
    fontSize: 14,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: GameColors.textPrimary,
  },
  buyBtn: {
    backgroundColor: GameColors.buttonSecondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
    shadowColor: GameColors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  buyBtnDisabled: {
    backgroundColor: GameColors.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  buyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: GameColors.white,
  },
  priceTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
    color: GameColors.white,
  },
  activeBtn: {
    backgroundColor: GameColors.buttonPrimary,
  },
  activateBtn: {
    backgroundColor: GameColors.woodBrown,
  },

  // Selection Card
  selectionCard: {
    backgroundColor: GameColors.pastelPurple,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  selectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GameColors.textPrimary,
    textAlign: 'center',
  },
  selectionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  selectionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: GameColors.white,
    borderWidth: 2,
    borderColor: GameColors.borderMedium,
  },
  selectionBtnActive: {
    borderColor: GameColors.buttonPrimary,
    backgroundColor: GameColors.pastelGreen,
  },
  selectionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: GameColors.textSecondary,
  },
  selectionBtnTextActive: {
    color: GameColors.buttonPrimary,
  },

  // Tips Card
  tipsCard: {
    backgroundColor: GameColors.pastelYellow,
    borderRadius: 14,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: GameColors.lemonYellow,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GameColors.textPrimary,
  },
  tipsText: {
    fontSize: 13,
    color: GameColors.textSecondary,
    lineHeight: 18,
  },
});
