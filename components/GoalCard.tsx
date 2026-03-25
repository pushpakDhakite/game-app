import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameColors } from '@/constants/gameColors';
import { sharedStyles } from '@/constants/sharedStyles';

interface GoalCardProps {
  title: string;
  current: string;
  target: string;
  progress: number;
}

export const GoalCard = React.memo(function GoalCard({ title, current, target, progress }: GoalCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={sharedStyles.goalProgressBg}>
        <View style={[sharedStyles.goalProgressFill, { width: `${Math.min(progress, 100)}%` }]} />
      </View>
      <View style={sharedStyles.goalStats}>
        <Text style={styles.current}>{current} 💰</Text>
        <Text style={styles.target}>/ {target} 💰</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: GameColors.pastelYellow,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: GameColors.lemonYellow,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: GameColors.textPrimary,
    textAlign: 'center',
  },
  current: {
    fontSize: 16,
    fontWeight: '800',
    color: GameColors.woodBrown,
  },
  target: {
    fontSize: 16,
    fontWeight: '600',
    color: GameColors.textSecondary,
  },
});
