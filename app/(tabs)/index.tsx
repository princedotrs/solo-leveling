import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, rankColors, space } from '../../lib/theme';
import { Panel } from '../../components/Panel';
import { XpBar } from '../../components/XpBar';
import { RankBadge } from '../../components/RankBadge';
import { SystemHeader } from '../../components/SystemHeader';
import { Heatmap } from '../../components/Heatmap';
import { HunterLicense } from '../../components/HunterLicense';
import { UpdaterPanel } from '../../components/UpdaterPanel';
import { useStore } from '../../lib/store';
import {
  levelFromTotalXp,
  rankFromLevel,
  todayKey,
  totalXpToReachLevel,
  xpForLevel,
} from '../../lib/leveling';

export default function HunterScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const licenseWidth = screenWidth > 0
    ? Math.min(Math.max(screenWidth - space.lg * 2, 280), 520)
    : 360;
  const hunterName = useStore((s) => s.hunterName);
  const setHunterName = useStore((s) => s.setHunterName);
  const totalXp = useStore((s) => s.totalXp);
  const streak = useStore((s) => s.streak);
  const penaltyEnabled = useStore((s) => s.penaltyEnabled);
  const togglePenalty = useStore((s) => s.togglePenalty);
  const dailyQuests = useStore((s) => s.dailyQuests);
  const sideQuests = useStore((s) => s.sideQuests);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(hunterName);

  const { level, xpIntoLevel, xpForNext } = useMemo(
    () => levelFromTotalXp(totalXp),
    [totalXp]
  );
  const rank = rankFromLevel(level);
  const nextRankInfo = useMemo(() => {
    const thresholds: [string, number][] = [
      ['D', 8],
      ['C', 18],
      ['B', 30],
      ['A', 45],
      ['S', 60],
    ];
    const next = thresholds.find(([, lv]) => lv > level);
    if (!next) return null;
    return { rank: next[0], levelsAway: next[1] - level };
  }, [level]);

  const dailyDoneToday = dailyQuests.filter(
    (q) => q.lastCompletedDay === todayKey()
  ).length;
  const sideDone = sideQuests.filter((q) => q.completedAt).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: space.xxl, paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      <SystemHeader title="Hunter Profile" subtitle="status window" />

      <View style={styles.body}>
        <HunterLicense width={licenseWidth} />

        <Panel style={styles.headerPanel}>
          <View style={styles.headerRow}>
            <RankBadge rank={rank} size={56} />
            <View style={{ flex: 1, marginLeft: space.md }}>
              <View style={styles.nameRow}>
                {editing ? (
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    onBlur={() => {
                      setHunterName(draft);
                      setEditing(false);
                    }}
                    onSubmitEditing={() => {
                      setHunterName(draft);
                      setEditing(false);
                    }}
                    autoFocus
                    style={styles.nameInput}
                    placeholderTextColor={colors.textFaint}
                    maxLength={24}
                  />
                ) : (
                  <Pressable
                    onPress={() => {
                      setDraft(hunterName);
                      setEditing(true);
                    }}
                  >
                    <Text style={styles.name}>{hunterName}</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => {
                    setDraft(hunterName);
                    setEditing(true);
                  }}
                  hitSlop={8}
                >
                  <Ionicons name="pencil" size={14} color={colors.textFaint} />
                </Pressable>
              </View>
              <Text style={[styles.rankLabel, { color: rankColors[rank] }]}>
                {rank}-Rank Hunter
              </Text>
              <Text style={styles.levelLabel}>LEVEL {level}</Text>
            </View>
          </View>
          <XpBar current={xpIntoLevel} max={xpForNext} />
        </Panel>

        <View style={styles.statGrid}>
          <StatTile icon="flame" label="Streak" value={`${streak}`} sub="days" />
          <StatTile icon="trophy" label="Total XP" value={`${totalXp}`} />
          <StatTile
            icon="flash"
            label="Daily Done"
            value={`${dailyDoneToday}/${dailyQuests.length}`}
            sub="today"
          />
          <StatTile
            icon="list"
            label="Side Done"
            value={`${sideDone}/${sideQuests.length}`}
          />
        </View>

        <Panel>
          <Text style={styles.sectionTitle}>QUEST LOG</Text>
          <View style={{ marginTop: space.sm }}>
            <Heatmap />
          </View>
        </Panel>

        <Panel>
          <Text style={styles.sectionTitle}>PROGRESSION</Text>
          <InfoRow label="Current Rank" value={`${rank}-Rank`} tint={rankColors[rank]} />
          <InfoRow
            label="XP to next level"
            value={`${Math.max(0, xpForNext - xpIntoLevel)}`}
          />
          {nextRankInfo ? (
            <InfoRow
              label={`To ${nextRankInfo.rank}-Rank`}
              value={`${nextRankInfo.levelsAway} lv`}
              tint={rankColors[nextRankInfo.rank]}
            />
          ) : (
            <InfoRow label="Rank" value="MAX — S-Rank" tint={rankColors.S} />
          )}
          <InfoRow
            label="Lifetime XP"
            value={`${totalXp} (lv ${level} @ ${totalXpToReachLevel(level)})`}
          />
        </Panel>

        <Panel>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Penalty Quest</Text>
              <Text style={styles.settingHint}>
                Lose XP each midnight for uncompleted Daily Quests.
              </Text>
            </View>
            <Switch
              value={penaltyEnabled}
              onValueChange={togglePenalty}
              trackColor={{ false: colors.panelBorder, true: colors.cyanDim }}
              thumbColor={penaltyEnabled ? colors.cyan : colors.textFaint}
            />
          </View>

          <Pressable
            onPress={() =>
              Alert.alert(
                'About',
                'Solo Leveling habit tracker.\nAll data is stored on-device.\nLong-press any quest to delete.'
              )
            }
            style={styles.aboutBtn}
          >
            <Text style={styles.aboutText}>ABOUT</Text>
          </Pressable>
        </Panel>

        <UpdaterPanel />
      </View>
    </ScrollView>
  );
}

function StatTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Panel style={styles.tile} glow={false}>
      <Ionicons name={icon} size={16} color={colors.cyan} />
      <Text style={styles.tileLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={styles.tileValue}>{value}</Text>
        {sub ? <Text style={styles.tileSub}> {sub}</Text> : null}
      </View>
    </Panel>
  );
}

function InfoRow({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, tint ? { color: tint } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: space.lg, gap: space.lg },
  headerPanel: {},
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  name: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 20,
    fontWeight: '700',
  },
  nameInput: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 20,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: colors.cyan,
    minWidth: 120,
    paddingVertical: 0,
  },
  rankLabel: {
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 2,
  },
  levelLabel: {
    color: colors.cyan,
    fontFamily: 'Menlo',
    fontSize: 14,
    letterSpacing: 3,
    marginTop: 2,
  },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    width: '47.5%',
    padding: space.md,
    gap: space.xs,
  },
  tileLabel: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 10,
    letterSpacing: 2,
  },
  tileValue: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 22,
    fontWeight: '700',
  },
  tileSub: {
    color: colors.textFaint,
    fontFamily: 'Menlo',
    fontSize: 10,
    letterSpacing: 1,
    marginLeft: 2,
  },
  sectionTitle: {
    color: colors.cyan,
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: space.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42,75,138,0.3)',
  },
  infoLabel: { color: colors.textDim, fontFamily: 'Menlo', fontSize: 12 },
  infoValue: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 12,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm,
    gap: space.md,
  },
  settingLabel: { color: colors.text, fontFamily: 'Menlo', fontSize: 13 },
  settingHint: {
    color: colors.textFaint,
    fontFamily: 'Menlo',
    fontSize: 10,
    marginTop: 2,
  },
  aboutBtn: {
    marginTop: space.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  aboutText: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 3,
  },
});
