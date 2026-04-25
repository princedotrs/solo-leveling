import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, space } from '../lib/theme';
import { Panel } from './Panel';
import { useStore } from '../lib/store';
import { findBonusQuest, formatRemaining } from '../lib/bonusQuests';

export function ActiveBonusQuestCard() {
  const active = useStore((s) => s.activeBonusQuest);
  const complete = useStore((s) => s.completeBonusQuest);
  const forfeit = useStore((s) => s.forfeitBonusQuest);
  const expireIfNeeded = useStore((s) => s.expireBonusQuestIfNeeded);

  const [, setNow] = useState(Date.now());

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= active.deadline) {
        expireIfNeeded();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [active, expireIfNeeded]);

  if (!active) return null;
  const quest = findBonusQuest(active.questId);
  if (!quest) return null;

  const remainingMs = active.deadline - Date.now();
  const totalMs = active.deadline - active.acceptedAt;
  const elapsedRatio = Math.max(0, Math.min(1, 1 - remainingMs / totalMs));
  const urgent = remainingMs > 0 && remainingMs < 3600_000;

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    complete();
  };

  const handleForfeit = () => {
    Alert.alert(
      'Forfeit bonus quest?',
      `You will lose XP. The quest "${quest.title}" will be marked failed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Forfeit', style: 'destructive', onPress: forfeit },
      ]
    );
  };

  return (
    <Panel style={[styles.panel, urgent && styles.panelUrgent]}>
      <View style={styles.headerRow}>
        <View style={styles.tag}>
          <Ionicons name="flash" size={12} color={colors.gold} />
          <Text style={styles.tagText}>BONUS</Text>
        </View>
        <Text style={styles.category}>{quest.category}</Text>
      </View>

      <Text style={styles.title}>{quest.title}</Text>
      <Text style={styles.desc}>{quest.description}</Text>

      <View style={styles.timerRow}>
        <Text style={styles.timerLabel}>TIME LEFT</Text>
        <Text style={[styles.timerValue, urgent && { color: colors.danger }]}>
          {formatRemaining(remainingMs)}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${elapsedRatio * 100}%` },
            urgent && { backgroundColor: colors.danger },
          ]}
        />
      </View>

      <View style={styles.btnRow}>
        <Pressable onPress={handleForfeit} style={[styles.btn, styles.btnSecondary]}>
          <Text style={[styles.btnText, { color: colors.danger }]}>FORFEIT</Text>
        </Pressable>
        <Pressable onPress={handleComplete} style={[styles.btn, styles.btnPrimary]}>
          <Ionicons name="checkmark" size={16} color={colors.cyan} />
          <Text style={[styles.btnText, { color: colors.cyan, marginLeft: 4 }]}>
            CLEAR  +{quest.xpReward} XP
          </Text>
        </Pressable>
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderColor: colors.gold,
    shadowColor: colors.gold,
  },
  panelUrgent: {
    borderColor: colors.danger,
    shadowColor: colors.danger,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: 'rgba(255,217,106,0.08)',
  },
  tagText: {
    color: colors.gold,
    fontFamily: 'Menlo',
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '900',
  },
  category: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 10,
    letterSpacing: 2,
  },
  title: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: space.xs,
  },
  desc: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: space.md,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: space.sm,
  },
  timerLabel: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 10,
    letterSpacing: 2,
  },
  timerValue: {
    color: colors.gold,
    fontFamily: 'Menlo',
    fontSize: 14,
    fontWeight: '900',
  },
  barTrack: {
    height: 4,
    backgroundColor: '#08122b',
    borderRadius: 2,
    marginTop: space.xs,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.gold,
  },
  btnRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
  },
  btn: {
    flex: 1,
    paddingVertical: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  btnSecondary: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(255,90,120,0.05)',
  },
  btnPrimary: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(94,225,255,0.08)',
  },
  btnText: {
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '900',
  },
});
