import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';
import { useStore } from '../lib/store';
import { LevelUpModal } from '../components/LevelUpModal';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const rolloverIfNeeded = useStore((s) => s.rolloverIfNeeded);

  useEffect(() => {
    rolloverIfNeeded();
  }, [rolloverIfNeeded]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'fade',
            }}
          />
          <LevelUpModal />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
