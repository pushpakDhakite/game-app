import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { GameColors } from '@/constants/gameColors';
import { SaveData } from '@/constants/saveManager';

interface SaveCardProps {
  save: SaveData;
  formatMoney: (amount: number) => string;
  onLoad: (saveId: string) => void;
  onDelete: (save: SaveData) => void;
}

export const SaveCard = React.memo(function SaveCard({ save, formatMoney, onLoad, onDelete }: SaveCardProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Save',
      `Delete "${save.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(save) },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>👤</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{save.name}</Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>{formatMoney(save.money)} 💰</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.stat}>Lv{save.upgradeLevel}</Text>
          {save.hasManager && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.stat}>👨‍💼</Text>
            </>
          )}
          <Text style={styles.dot}>•</Text>
          <Text style={styles.stat}>{save.currentPhase === 2 ? '🚚 Phase 2' : '🍋 Phase 1'}</Text>
        </View>
        <Text style={styles.date}>{formatDate(save.updatedAt)}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.loadBtn} onPress={() => onLoad(save.id)} activeOpacity={0.8}>
          <Text style={styles.loadBtnText}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: GameColors.cardBgAlt,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: GameColors.borderLight,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GameColors.pastelBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 20 },
  info: { flex: 1, gap: 2 },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: GameColors.textPrimary,
  },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stat: {
    fontSize: 12,
    fontWeight: '600',
    color: GameColors.woodBrown,
  },
  dot: { fontSize: 10, color: GameColors.textLight },
  date: { fontSize: 11, color: GameColors.textLight },
  actions: { flexDirection: 'row', gap: 6 },
  loadBtn: {
    backgroundColor: GameColors.buttonPrimary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadBtnText: { fontSize: 16, color: GameColors.white },
  deleteBtn: {
    backgroundColor: GameColors.pastelRed,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: GameColors.progressLow,
  },
});
