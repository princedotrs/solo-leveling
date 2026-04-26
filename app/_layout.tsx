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
import { BonusQuestOfferModal } from '../components/BonusQuestOfferModal';
import {
  UpdatePromptModal,
  useAutoUpdateCheck,
} from '../components/UpdatePromptModal';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const rolloverIfNeeded = useStore((s) => s.rolloverIfNeeded);
  const expireBonusQuestIfNeeded = useStore((s) => s.expireBonusQuestIfNeeded);

  useEffect(() => {
    rolloverIfNeeded();
    expireBonusQuestIfNeeded();
  }, [rolloverIfNeeded, expireBonusQuestIfNeeded]);

  useAutoUpdateCheck();

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
          <BonusQuestOfferModal />
          <UpdatePromptModal />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
