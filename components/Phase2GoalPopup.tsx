import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { GameColors } from '@/constants/gameColors';
import { usePhase2 } from '@/contexts/Phase2Context';

export function Phase2GoalPopup() {
  const { showPhase2GoalPopup, dismissPhase2GoalPopup } = usePhase2();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showPhase2GoalPopup) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
    }
  }, [showPhase2GoalPopup, scaleAnim, opacityAnim]);

  return (
    <Modal visible={showPhase2GoalPopup} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.popup,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>🚚</Text>
          </View>
          <Text style={styles.title}>Food Truck Empire!</Text>
          <View style={styles.amountBadge}>
            <Text style={styles.amountText}>1,000,000 💰</Text>
          </View>
          <Text style={styles.message}>Phase 2 Complete!</Text>
          <Text style={styles.subMessage}>You built a food truck empire!</Text>
          <TouchableOpacity style={styles.button} onPress={dismissPhase2GoalPopup} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Continue Playing</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: GameColors.white,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    width: '85%',
    maxWidth: 340,
    shadowColor: GameColors.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GameColors.pastelOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: GameColors.textPrimary,
    marginTop: 8,
  },
  amountBadge: {
    backgroundColor: GameColors.lemonYellow,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '800',
    color: GameColors.woodBrown,
  },
  message: {
    fontSize: 18,
    fontWeight: '700',
    color: GameColors.textPrimary,
  },
  subMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: GameColors.textSecondary,
  },
  button: {
    backgroundColor: GameColors.buttonPrimary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: GameColors.buttonPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: GameColors.white,
  },
});
