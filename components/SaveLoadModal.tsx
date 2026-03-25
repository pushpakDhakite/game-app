import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView,
} from 'react-native';
import { GameColors } from '@/constants/gameColors';
import { useGame } from '@/contexts/GameContext';
import { SaveCard } from '@/components/SaveCard';
import { SaveData } from '@/constants/saveManager';

export function SaveLoadModal() {
  const { showSaveLoadModal, setShowSaveLoadModal, startGame, loadGame, deleteSave, saves, formatMoney } = useGame();
  const [name, setName] = useState('');

  const handleClose = () => setShowSaveLoadModal(false);

  const handleStart = () => {
    Keyboard.dismiss();
    startGame(name.trim());
    setShowSaveLoadModal(false);
  };

  const handleLoad = (saveId: string) => {
    loadGame(saveId);
    setShowSaveLoadModal(false);
  };

  const handleDelete = useCallback((save: SaveData) => {
    deleteSave(save.id);
  }, [deleteSave]);

  return (
    <Modal visible={showSaveLoadModal} transparent animationType="fade">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <View style={styles.popup}>
              <View style={styles.header}>
                <Text style={styles.emoji}>💾</Text>
                <Text style={styles.title}>Save / Load</Text>
                <Text style={styles.subtitle}>Manage your game saves</Text>
              </View>
              <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>NEW GAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name..."
                    placeholderTextColor={GameColors.textLight}
                    value={name}
                    onChangeText={setName}
                    maxLength={20}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleStart}
                  />
                  <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
                    <Text style={styles.startButtonText}>Start New Game</Text>
                  </TouchableOpacity>
                  <Text style={styles.hint}>Leave empty for a random name!</Text>
                </View>
                {saves.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.divider} />
                    <Text style={styles.sectionLabel}>LOAD SAVES</Text>
                    {saves.map((save) => (
                      <SaveCard key={save.id} save={save} formatMoney={formatMoney} onLoad={handleLoad} onDelete={handleDelete} />
                    ))}
                  </View>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.8}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  popup: {
    backgroundColor: GameColors.white, borderRadius: 28, width: '100%', maxWidth: 380, maxHeight: '85%',
    shadowColor: GameColors.shadowColor, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20,
    elevation: 15, overflow: 'hidden',
  },
  header: { backgroundColor: GameColors.pastelBlue, padding: 24, alignItems: 'center', gap: 4 },
  emoji: { fontSize: 48 },
  title: { fontSize: 24, fontWeight: '900', color: GameColors.textPrimary, marginTop: 8 },
  subtitle: { fontSize: 14, fontWeight: '600', color: GameColors.textSecondary },
  scrollArea: { width: '100%' },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 24 },
  section: { gap: 10 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: GameColors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    width: '100%', height: 52, borderWidth: 2, borderColor: GameColors.borderMedium, borderRadius: 14,
    paddingHorizontal: 16, fontSize: 16, fontWeight: '600', color: GameColors.textPrimary, backgroundColor: GameColors.pastelYellow,
  },
  startButton: {
    backgroundColor: GameColors.buttonPrimary, paddingVertical: 16, borderRadius: 14, width: '100%', alignItems: 'center',
    shadowColor: GameColors.buttonPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  startButtonText: { fontSize: 17, fontWeight: '800', color: GameColors.white },
  hint: { fontSize: 12, color: GameColors.textLight, fontStyle: 'italic', textAlign: 'center' },
  divider: { height: 1, backgroundColor: GameColors.borderLight },
  closeButton: {
    backgroundColor: GameColors.buttonDisabled, paddingVertical: 14, borderRadius: 14, width: '100%', alignItems: 'center', marginTop: 8,
  },
  closeButtonText: { fontSize: 16, fontWeight: '700', color: GameColors.textSecondary },
});
