import { useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '../lib/theme';
import { useStore } from '../lib/store';
import { findBonusQuest, formatRemaining } from '../lib/bonusQuests';

export function BonusQuestOfferModal() {
  const offer = useStore((s) => s.pendingBonusOffer);
  const accept = useStore((s) => s.acceptBonusQuest);
  const reject = useStore((s) => s.rejectBonusQuest);

  const visible = offer != null;
  const quest = offer ? findBonusQuest(offer.questId) : null;

  const scale = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (visible && quest) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      scale.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.back(1.3)) });
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 700 }),
          withTiming(1, { duration: 700 })
        ),
        -1,
        true
      );
    } else {
      scale.value = 0;
      pulse.value = 1;
    }
  }, [visible, quest, scale, pulse]);

  const enterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!visible || !quest) return null;

  const deadlineMs = quest.durationHours * 3600_000;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={reject}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, enterStyle]}>
          <Animated.View style={[styles.banner, pulseStyle]}>
            <Ionicons name="alert-circle" size={16} color={colors.gold} />
            <Text style={styles.bannerText}>BONUS QUEST</Text>
            <Ionicons name="alert-circle" size={16} color={colors.gold} />
          </Animated.View>

          <ScrollView contentContainerStyle={{ padding: space.lg }} bounces={false}>
            <Text style={styles.category}>[{quest.category.toUpperCase()}]</Text>
            <Text style={styles.title}>{quest.title}</Text>
            <Text style={styles.desc}>{quest.description}</Text>

            <View style={styles.stats}>
              <Stat label="REWARD" value={`+${quest.xpReward} XP`} tint={colors.cyan} />
              <View style={styles.divider} />
              <Stat label="DEADLINE" value={formatRemaining(deadlineMs)} />
            </View>

            <Text style={styles.warn}>
              Failure forfeits a portion of the reward as XP penalty.
            </Text>
          </ScrollView>

          <View style={styles.btnRow}>
            <Pressable onPress={reject} style={[styles.btn, styles.btnReject]}>
              <Text style={[styles.btnText, { color: colors.danger }]}>REJECT</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                accept();
              }}
              style={[styles.btn, styles.btnAccept]}
            >
              <Text style={[styles.btnText, { color: colors.cyan }]}>ACCEPT</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Stat({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, tint ? { color: tint } : null]}>{value}</Text>
    </View>
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
    maxWidth: 380,
    borderWidth: 2,
    borderColor: colors.cyan,
    backgroundColor: '#070b20',
    shadowColor: colors.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: space.md,
    backgroundColor: 'rgba(255,217,106,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: colors.gold,
  },
  bannerText: {
    color: colors.gold,
    fontFamily: 'Menlo',
    fontSize: 16,
    letterSpacing: 5,
    fontWeight: '900',
  },
  category: {
    color: colors.cyanSoft,
    fontFamily: 'Menlo',
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: space.sm,
  },
  title: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: space.sm,
  },
  desc: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: space.lg,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: space.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.panelBorder,
  },
  stat: { alignItems: 'center', paddingHorizontal: space.md },
  statLabel: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 4,
  },
  statValue: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 16,
    fontWeight: '900',
  },
  divider: { width: 1, height: 36, backgroundColor: colors.panelBorder },
  warn: {
    color: colors.textFaint,
    fontFamily: 'Menlo',
    fontSize: 10,
    marginTop: space.md,
    textAlign: 'center',
    lineHeight: 14,
  },
  btnRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.panelBorder,
  },
  btn: {
    flex: 1,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  btnReject: {
    borderRightWidth: 1,
    borderRightColor: colors.panelBorder,
    backgroundColor: 'rgba(255,90,120,0.05)',
  },
  btnAccept: {
    backgroundColor: 'rgba(94,225,255,0.08)',
  },
  btnText: {
    fontFamily: 'Menlo',
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: '900',
  },
});
