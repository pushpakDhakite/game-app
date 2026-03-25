import React from 'react';
import { View, Text } from 'react-native';
import { GameColors } from '@/constants/gameColors';
import { EQUIPMENT } from '@/constants/phase1';
import { useGame } from '@/contexts/GameContext';
import { BuyRow } from '@/components/BuyRow';
import { sharedStyles } from '@/constants/sharedStyles';

export const EquipmentSection = React.memo(function EquipmentSection() {
  const { cups, pitchers, fridges, formatMoney, buyEquipment, getEquipmentCost, canAffordEquipment } = useGame();

  return (
    <View style={sharedStyles.cardBase}>
      <Text style={sharedStyles.sectionTitle}>Equipment</Text>
      {EQUIPMENT.map((equip) => {
        const owned = equip.id === 'cups' ? cups : equip.id === 'pitcher' ? pitchers : fridges;
        const maxed = owned >= equip.maxCount;
        return (
          <BuyRow
            key={equip.id}
            emoji={equip.emoji}
            name={equip.name}
            effect={maxed ? `MAX (${owned}/${equip.maxCount})` : `${owned}/${equip.maxCount} • +${equip.stockBonus} stock each`}
            cost={maxed ? undefined : `${formatMoney(getEquipmentCost(equip.id))} 💰`}
            affordable={canAffordEquipment(equip.id)}
            maxed={maxed}
            onPress={() => buyEquipment(equip.id)}
          />
        );
      })}
    </View>
  );
});
