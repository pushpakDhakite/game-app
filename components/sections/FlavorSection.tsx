import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameColors } from '@/constants/gameColors';
import { FLAVOR_MAP } from '@/constants/phase1';
import { useGame } from '@/contexts/GameContext';
import { BuyRow } from '@/components/BuyRow';
import { sharedStyles } from '@/constants/sharedStyles';

export const FlavorSection = React.memo(function FlavorSection() {
  const { ownedFlavors, formatMoney, buyFlavor, canAffordFlavor } = useGame();
  const availableFlavors = FLAVOR_MAP;

  return (
    <>
      {/* Active Flavors */}
      <View style={[sharedStyles.cardNoShadow, { backgroundColor: GameColors.pastelGreen, borderColor: '#A5D6A7' }]}>
        <Text style={sharedStyles.sectionTitle}>Active Flavors</Text>
        <View style={styles.badges}>
          {ownedFlavors.map((id) => {
            const flavor = availableFlavors.get(id);
            if (!flavor) return null;
            return (
              <View key={id} style={styles.badge}>
                <Text style={styles.badgeEmoji}>{flavor.emoji}</Text>
                <Text style={styles.badgeName}>{flavor.name}</Text>
              </View>
            );
          })}
        </View>
        {ownedFlavors.length > 1 && (
          <Text style={styles.boostText}>
            +{Array.from(ownedFlavors).reduce((sum, id) => sum + (availableFlavors.get(id)?.sellPriceBoost ?? 0), 0)} 💰/lemon from flavors
          </Text>
        )}
      </View>

      {/* Buy Flavors */}
      {FLAVOR_MAP.size > ownedFlavors.length && (
        <View style={sharedStyles.cardBase}>
          <Text style={sharedStyles.sectionTitle}>Buy Flavors</Text>
          {Array.from(FLAVOR_MAP.values()).filter((f) => !ownedFlavors.includes(f.id)).map((flavor) => (
            <BuyRow
              key={flavor.id}
              emoji={flavor.emoji}
              name={flavor.name}
              effect={`+${flavor.sellPriceBoost} 💰/lemon`}
              cost={`${formatMoney(flavor.cost)} 💰`}
              affordable={canAffordFlavor(flavor.id)}
              onPress={() => buyFlavor(flavor.id)}
            />
          ))}
        </View>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    backgroundColor: GameColors.white,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  badgeEmoji: { fontSize: 18 },
  badgeName: { fontSize: 13, fontWeight: '600', color: GameColors.textPrimary },
  boostText: { fontSize: 12, fontWeight: '600', color: GameColors.textSecondary, textAlign: 'center' },
});
