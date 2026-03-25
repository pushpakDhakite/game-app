import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GameColors } from '@/constants/gameColors';
import { MAX_TABLES, MAX_CHAIRS } from '@/constants/phase2';
import { usePhase2 } from '@/contexts/Phase2Context';
import { useGame } from '@/contexts/GameContext';
import { sharedStyles } from '@/constants/sharedStyles';

export const CapacitySection = React.memo(function CapacitySection() {
  const { tables, chairs, getTableCost, getChairCost, canAffordTable, canAffordChair, purchaseTable, purchaseChair } = usePhase2();
  const { formatMoney } = useGame();

  const tableCost = useMemo(() => formatMoney(getTableCost()), [formatMoney, getTableCost]);
  const chairCost = useMemo(() => formatMoney(getChairCost()), [formatMoney, getChairCost]);

  return (
    <>
      {/* Capacity Display */}
      <View style={[styles.capacityCard]}>
        <Text style={styles.capacityTitle}>Capacity</Text>
        <View style={styles.capacityGrid}>
          <View style={styles.capacityItem}>
            <Text style={styles.capacityEmoji}>🪑</Text>
            <Text style={styles.capacityValue}>{tables} / {MAX_TABLES}</Text>
            <Text style={styles.capacityLabel}>Tables</Text>
          </View>
          <View style={styles.capacityDivider} />
          <View style={styles.capacityItem}>
            <Text style={styles.capacityEmoji}>💺</Text>
            <Text style={styles.capacityValue}>{chairs} / {MAX_CHAIRS}</Text>
            <Text style={styles.capacityLabel}>Chairs</Text>
          </View>
        </View>
      </View>

      {/* Buy Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.buyButton, styles.tableBtn, !canAffordTable() && sharedStyles.buttonDisabled]}
          onPress={purchaseTable}
          disabled={!canAffordTable()}
          activeOpacity={0.7}
        >
          <Text style={styles.buyEmoji}>🪑</Text>
          <Text style={styles.buyText}>Table</Text>
          <View style={sharedStyles.costBadgeSmall}>
            <Text style={sharedStyles.costTextSmall}>{tableCost} 💰</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyButton, styles.chairBtn, !canAffordChair() && sharedStyles.buttonDisabled]}
          onPress={purchaseChair}
          disabled={!canAffordChair()}
          activeOpacity={0.7}
        >
          <Text style={styles.buyEmoji}>💺</Text>
          <Text style={styles.buyText}>Chair</Text>
          <View style={sharedStyles.costBadgeSmall}>
            <Text style={sharedStyles.costTextSmall}>{chairCost} 💰</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  capacityCard: {
    backgroundColor: GameColors.pastelBlue, borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: '#90CAF9',
  },
  capacityTitle: { fontSize: 15, fontWeight: '700', color: GameColors.textPrimary, textAlign: 'center' },
  capacityGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  capacityItem: { alignItems: 'center', gap: 4, flex: 1 },
  capacityDivider: { width: 1, height: 50, backgroundColor: '#90CAF9' },
  capacityEmoji: { fontSize: 24 },
  capacityValue: { fontSize: 18, fontWeight: '800', color: GameColors.textPrimary },
  capacityLabel: { fontSize: 11, fontWeight: '600', color: GameColors.textSecondary },

  buttonRow: { flexDirection: 'row', gap: 12 },
  buyButton: {
    flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', gap: 6,
    shadowColor: GameColors.shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  tableBtn: { backgroundColor: GameColors.woodBrown },
  chairBtn: { backgroundColor: GameColors.buttonSecondary },
  buyEmoji: { fontSize: 28 },
  buyText: { fontSize: 16, fontWeight: '700', color: GameColors.white },
});
