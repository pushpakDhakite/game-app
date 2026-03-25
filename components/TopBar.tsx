import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameColors } from '@/constants/gameColors';
import { useGame } from '@/contexts/GameContext';

export function TopBar() {
  const { money, playerName, upgradeLevel, stock, maxStock, formatMoney } = useGame();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.playerIcon}>
          <Text style={styles.playerIconText}>👤</Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName} numberOfLines={1}>{playerName}</Text>
          <View style={styles.miniStats}>
            <Text style={styles.miniStat}>⬆️ Lv{upgradeLevel}</Text>
            <Text style={styles.miniStatDot}>•</Text>
            <Text style={styles.miniStat}>📦 {stock}/{maxStock}</Text>
          </View>
        </View>
      </View>
      <View style={styles.moneyBadge}>
        <Text style={styles.moneyIcon}>💰</Text>
        <Text style={styles.moneyText}>{formatMoney(money)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  playerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GameColors.pastelBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: GameColors.white,
    shadowColor: GameColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerIconText: {
    fontSize: 22,
  },
  playerInfo: {
    flex: 1,
    gap: 2,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '800',
    color: GameColors.textPrimary,
  },
  miniStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniStat: {
    fontSize: 12,
    fontWeight: '600',
    color: GameColors.textSecondary,
  },
  miniStatDot: {
    fontSize: 12,
    color: GameColors.textLight,
  },
  moneyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GameColors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: GameColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: GameColors.borderLight,
  },
  moneyIcon: {
    fontSize: 18,
  },
  moneyText: {
    fontSize: 18,
    fontWeight: '800',
    color: GameColors.woodBrown,
  },
});
