import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '@/components/TopBar';
import { ContentArea } from '@/components/ContentArea';
import { FoodTruckArea } from '@/components/FoodTruckArea';
import { GoalPopup } from '@/components/GoalPopup';
import { Phase2GoalPopup } from '@/components/Phase2GoalPopup';
import { LoadingScreen } from '@/components/LoadingScreen';
import { NamePopup } from '@/components/NamePopup';
import { useGame } from '@/contexts/GameContext';
import { GameColors } from '@/constants/gameColors';

function Phase1Screen() {
  return (
    <>
      <ContentArea />
      <GoalPopup />
    </>
  );
}

function Phase2Screen() {
  return (
    <>
      <FoodTruckArea />
      <Phase2GoalPopup />
    </>
  );
}

export default function HomeScreen() {
  const { isLoading, isGameStarted, currentPhase } = useGame();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <NamePopup />
      {isGameStarted && (
        <SafeAreaView style={styles.container} edges={['top']}>
          <TopBar />
          {currentPhase === 1 ? <Phase1Screen /> : <Phase2Screen />}
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.contentBg,
  },
});
