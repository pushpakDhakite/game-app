import React from 'react';
import { View, Text } from 'react-native';
import { SPEED_BOOST_LEVELS, MAX_SPEED_LEVEL } from '@/constants/phase1';
import { useGame } from '@/contexts/GameContext';
import { BuyRow } from '@/components/BuyRow';
import { sharedStyles } from '@/constants/sharedStyles';

export const SpeedSection = React.memo(function SpeedSection() {
  const { speedLevel, formatMoney, buySpeedBoost, canAffordSpeedBoost } = useGame();
  const maxed = speedLevel >= MAX_SPEED_LEVEL;

  return (
    <View style={sharedStyles.cardBase}>
      <Text style={sharedStyles.sectionTitle}>Selling Speed</Text>
      <BuyRow
        emoji="⚡"
        name={`Speed Level ${speedLevel}/${MAX_SPEED_LEVEL}`}
        effect={maxed ? 'MAX SPEED!' : `${SPEED_BOOST_LEVELS[speedLevel].interval}ms → ${SPEED_BOOST_LEVELS[speedLevel + 1].interval}ms`}
        cost={maxed ? undefined : `${formatMoney(SPEED_BOOST_LEVELS[speedLevel + 1].cost)} 💰`}
        affordable={canAffordSpeedBoost()}
        maxed={maxed}
        onPress={buySpeedBoost}
      />
    </View>
  );
});
