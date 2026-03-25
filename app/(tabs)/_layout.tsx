import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { GameColors } from '@/constants/gameColors';
import { GameProvider } from '@/contexts/GameContext';
import { Phase2Provider } from '@/contexts/Phase2Context';

export default function TabLayout() {
  return (
    <GameProvider>
      <Phase2Provider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: GameColors.buttonPrimary,
          tabBarInactiveTintColor: GameColors.textLight,
          tabBarStyle: {
            backgroundColor: GameColors.bottomBarBg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: 70,
            paddingBottom: 12,
            paddingTop: 10,
            shadowColor: GameColors.shadowColor,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 10,
            borderTopWidth: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
          },
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}>
        <Tabs.Screen
          name="shop"
          options={{
            title: 'Shop',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🛒" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🏠" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="⚙️" focused={focused} />
            ),
          }}
        />
      </Tabs>
      </Phase2Provider>
    </GameProvider>
  );
}

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.emoji, focused && styles.emojiActive]}>{emoji}</Text>
      {focused && <View style={styles.indicator} />}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 22,
    opacity: 0.5,
  },
  emojiActive: {
    fontSize: 24,
    opacity: 1,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GameColors.buttonPrimary,
  },
});
