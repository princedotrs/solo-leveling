import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { colors, space } from '../lib/theme';
import { useStore } from '../lib/store';
import { rankFromLevel } from '../lib/leveling';

export function LevelUpModal() {
  const pendingLevelUp = useStore((s) => s.pendingLevelUp);
  const consume = useStore((s) => s.consumeLevelUp);
  const visible = pendingLevelUp != null;

  const scale = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      scale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.4)) });
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      scale.value = 0;
      pulse.value = 1;
    }
  }, [visible, scale, pulse]);

  const enterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!visible) return null;
  const rank = rankFromLevel(pendingLevelUp);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={consume}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, enterStyle]}>
          <Animated.View style={[styles.badge, pulseStyle]}>
            <Text style={styles.badgeText}>LEVEL UP</Text>
          </Animated.View>

          <Text style={styles.congrats}>You have leveled up.</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>LEVEL</Text>
              <Text style={styles.statValue}>{pendingLevelUp}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>RANK</Text>
              <Text style={styles.statValue}>{rank}</Text>
            </View>
          </View>

          <Pressable onPress={consume} style={styles.btn}>
            <Text style={styles.btnText}>ACCEPT</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 2,
    borderColor: colors.cyan,
    backgroundColor: '#070b20',
    padding: space.xl,
    alignItems: 'center',
    shadowColor: colors.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  badge: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderWidth: 1,
    borderColor: colors.cyan,
    backgroundColor: 'rgba(94,225,255,0.1)',
    marginBottom: space.lg,
  },
  badgeText: {
    color: colors.cyan,
    fontFamily: 'Menlo',
    fontSize: 20,
    letterSpacing: 6,
    fontWeight: '900',
  },
  congrats: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: space.lg,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: space.lg,
  },
  stat: { alignItems: 'center', paddingHorizontal: space.lg },
  statLabel: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 10,
    letterSpacing: 3,
  },
  statValue: {
    color: colors.cyan,
    fontFamily: 'Menlo',
    fontSize: 32,
    fontWeight: '900',
    marginTop: space.xs,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.panelBorder,
  },
  btn: {
    marginTop: space.lg,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderWidth: 1,
    borderColor: colors.cyan,
    backgroundColor: 'rgba(94,225,255,0.08)',
  },
  btnText: {
    color: colors.cyan,
    fontFamily: 'Menlo',
    fontSize: 13,
    letterSpacing: 4,
    fontWeight: '700',
  },
});
