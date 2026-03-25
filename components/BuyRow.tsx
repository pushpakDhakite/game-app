import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GameColors } from '@/constants/gameColors';
import { sharedStyles } from '@/constants/sharedStyles';

interface BuyRowProps {
  emoji: string;
  name: string;
  effect: string;
  cost?: string;
  affordable: boolean;
  maxed?: boolean;
  onPress: () => void;
}

export const BuyRow = React.memo(function BuyRow({ emoji, name, effect, cost, affordable, maxed, onPress }: BuyRowProps) {
  const disabled = (!affordable && !maxed) || !!maxed;
  const bgColor = maxed ? GameColors.pastelGreen : GameColors.pastelPurple;
  const borderColor = maxed ? '#A5D6A7' : '#E1BEE7';

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: bgColor, borderColor }, !affordable && !maxed && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={sharedStyles.buyRowInfo}>
        <Text style={sharedStyles.buyRowEmoji}>{emoji}</Text>
        <View style={sharedStyles.buyRowDetails}>
          <Text style={sharedStyles.buyRowName}>{name}</Text>
          <Text style={sharedStyles.buyRowEffect}>{effect}</Text>
        </View>
      </View>
      {cost && !maxed && (
        <View style={sharedStyles.costBadge}>
          <Text style={sharedStyles.costText}>{cost}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  disabled: { opacity: 0.5 },
});
