import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameColors } from '@/constants/gameColors';
import { RECIPES } from '@/constants/phase2';
import { usePhase2 } from '@/contexts/Phase2Context';
import { useGame } from '@/contexts/GameContext';
import { BuyRow } from '@/components/BuyRow';
import { sharedStyles } from '@/constants/sharedStyles';

export const BuyRecipesSection = React.memo(function BuyRecipesSection() {
  const { ownedRecipes, purchaseRecipe, canAffordRecipe } = usePhase2();
  const { formatMoney } = useGame();

  const ownedSet = useMemo(() => new Set(ownedRecipes), [ownedRecipes]);
  const available = useMemo(() => RECIPES.filter((r) => !ownedSet.has(r.id)), [ownedSet]);

  if (available.length === 0) return null;

  return (
    <View style={sharedStyles.cardBase}>
      <Text style={sharedStyles.sectionTitle}>Buy Recipes</Text>
      {available.map((recipe) => (
        <BuyRow
          key={recipe.id}
          emoji={recipe.emoji}
          name={recipe.name}
          effect={`+${recipe.earningsPerSecond} 💰/sec`}
          cost={`${formatMoney(recipe.cost)} 💰`}
          affordable={canAffordRecipe(recipe.id)}
          onPress={() => purchaseRecipe(recipe.id)}
        />
      ))}
    </View>
  );
});
