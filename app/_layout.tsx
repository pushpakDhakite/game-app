import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GameColors } from '@/constants/gameColors';

export const unstable_settings = {
  anchor: '(tabs)',
};

const GameTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: GameColors.woodBrown,
    background: GameColors.contentBg,
    card: GameColors.bottomBarBg,
    text: GameColors.textPrimary,
    border: GameColors.pastelOrange,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={GameTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
