import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameColors } from '@/constants/gameColors';
import { useGame } from '@/contexts/GameContext';
import { SaveLoadModal } from '@/components/SaveLoadModal';

export default function SettingsScreen() {
  const {
    playerName,
    money,
    currentPhase,
    formatMoney,
    setShowSaveLoadModal,
    restartGame,
  } = useGame();

  const handleRestart = () => {
    Alert.alert(
      'Restart Game',
      'This will reset ALL progress and start fresh. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          style: 'destructive',
          onPress: () => restartGame(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Game Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Current Game</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>👤</Text>
            <Text style={styles.infoText}>{playerName || 'Not started'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>💰</Text>
            <Text style={styles.infoText}>{formatMoney(money)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>🎮</Text>
            <Text style={styles.infoText}>Phase {currentPhase}</Text>
          </View>
        </View>

        {/* Save/Load Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowSaveLoadModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionEmoji}>💾</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Save / Load Settings</Text>
            <Text style={styles.actionSubtitle}>Manage your game saves</Text>
          </View>
        </TouchableOpacity>

        {/* Restart Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.restartButton]}
          onPress={handleRestart}
          activeOpacity={0.7}
        >
          <Text style={styles.actionEmoji}>🔄</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Restart Game</Text>
            <Text style={styles.actionSubtitle}>Reset all progress (temporary)</Text>
          </View>
        </TouchableOpacity>

        {/* Version Info */}
        <View style={styles.versionCard}>
          <Text style={styles.versionText}>Lemonade Tycoon</Text>
          <Text style={styles.versionNumber}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      <SaveLoadModal />
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: GameColors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },

  // Info Card
  infoCard: {
    backgroundColor: GameColors.pastelYellow,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: GameColors.lemonYellow,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GameColors.textPrimary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoEmoji: {
    fontSize: 20,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
    color: GameColors.textPrimary,
  },

  // Action Buttons
  actionButton: {
    backgroundColor: GameColors.cardBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: GameColors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: GameColors.borderLight,
  },
  restartButton: {
    borderColor: GameColors.progressLow,
    borderWidth: 1,
  },
  actionEmoji: {
    fontSize: 32,
  },
  actionInfo: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GameColors.textPrimary,
  },
  actionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: GameColors.textSecondary,
  },

  // Version Card
  versionCard: {
    alignItems: 'center',
    gap: 4,
    marginTop: 16,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '700',
    color: GameColors.textSecondary,
  },
  versionNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: GameColors.textLight,
  },
});
