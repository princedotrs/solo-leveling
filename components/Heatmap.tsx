import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import { colors, space } from '../lib/theme';
import { useStore } from '../lib/store';
import { todayKey } from '../lib/leveling';

const WEEKS = 14;
const DAYS = WEEKS * 7;
const GAP = 3;

type Tier = 0 | 1 | 2 | 3 | 4;

const tierStyles: Record<Tier, { bg: string; border: string; shadowOpacity: number; shadowRadius: number }> = {
  0: { bg: '#0a1028', border: 'rgba(42,75,138,0.55)', shadowOpacity: 0, shadowRadius: 0 },
  1: { bg: '#11304d', border: '#1d5a8a', shadowOpacity: 0.25, shadowRadius: 2 },
  2: { bg: '#1d6fa8', border: '#3aa0d6', shadowOpacity: 0.45, shadowRadius: 3 },
  3: { bg: '#3aa0d6', border: '#89e8ff', shadowOpacity: 0.7, shadowRadius: 5 },
  4: { bg: colors.cyan, border: '#ffffff', shadowOpacity: 1, shadowRadius: 8 },
};

function computeTier(
  dailyCompleted: number,
  dailyTotal: number,
  sideDone: number
): Tier {
  const dailyRatio = dailyTotal > 0 ? dailyCompleted / dailyTotal : 0;
  const sideBoost = Math.min(0.4, sideDone * 0.15);
  const score = dailyRatio + sideBoost;

  if (dailyTotal === 0) {
    if (sideDone >= 3) return 3;
    if (sideDone === 2) return 2;
    if (sideDone === 1) return 1;
    return 0;
  }
  if (dailyRatio >= 1) return 4;
  if (score >= 0.75) return 3;
  if (score >= 0.5) return 2;
  if (score > 0) return 1;
  return 0;
}

function dateFromKey(k: string): Date {
  return new Date(k + 'T00:00:00');
}
function keyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['M', '', 'W', '', 'F', '', ''];

export function Heatmap() {
  const dayLog = useStore((s) => s.dayLog);
  const sideQuests = useStore((s) => s.sideQuests);
  const [cellSize, setCellSize] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const sideByDay = useMemo(() => {
    const m: Record<string, number> = {};
    for (const q of sideQuests) {
      if (!q.completedAt) continue;
      const k = keyFromDate(new Date(q.completedAt));
      m[k] = (m[k] ?? 0) + 1;
    }
    return m;
  }, [sideQuests]);

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDow = today.getDay();
    const daysToAddForWeekEnd = 6 - endDow;
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + daysToAddForWeekEnd);

    const start = new Date(weekEnd);
    start.setDate(start.getDate() - (DAYS - 1));

    const weeks: { key: string; date: Date; tier: Tier; isFuture: boolean; dailyCompleted: number; dailyTotal: number; sideDone: number }[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      const col: typeof weeks[number] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        const key = keyFromDate(date);
        const isFuture = date > today;
        const stat = dayLog[key];
        const dailyCompleted = stat?.dailyCompleted ?? 0;
        const dailyTotal = stat?.dailyTotal ?? 0;
        const sideDone = sideByDay[key] ?? 0;
        const tier = isFuture ? 0 : computeTier(dailyCompleted, dailyTotal, sideDone);
        col.push({ key, date, tier, isFuture, dailyCompleted, dailyTotal, sideDone });
      }
      weeks.push(col);
    }

    const monthLabels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      const firstDate = weeks[w][0].date;
      const m = firstDate.getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ col: w, label: MONTHS[m] });
        lastMonth = m;
      }
    }

    return { weeks, monthLabels };
  }, [dayLog, sideByDay]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    const labelCol = 14;
    const size = Math.floor((w - labelCol - GAP * (WEEKS - 1)) / WEEKS);
    if (size !== cellSize) setCellSize(Math.max(8, size));
  };

  const selectedDay = selected
    ? weeks.flat().find((d) => d.key === selected)
    : null;

  return (
    <View onLayout={onLayout}>
      {cellSize > 0 && (
        <>
          <View style={styles.monthRow}>
            <View style={{ width: 14 }} />
            <View style={{ flex: 1, height: 12 }}>
              {monthLabels.map((m, i) => (
                <Text
                  key={i}
                  numberOfLines={1}
                  style={[
                    styles.monthText,
                    {
                      position: 'absolute',
                      left: m.col * (cellSize + GAP),
                    },
                  ]}
                >
                  {m.label}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.dayLabels}>
              {DAY_LABELS.map((l, i) => (
                <View key={i} style={{ height: cellSize, marginBottom: i < 6 ? GAP : 0, justifyContent: 'center' }}>
                  <Text style={styles.dayLabel}>{l}</Text>
                </View>
              ))}
            </View>

            <View style={styles.grid}>
              {weeks.map((col, ci) => (
                <View key={ci} style={{ marginRight: ci < WEEKS - 1 ? GAP : 0 }}>
                  {col.map((d) => {
                    const t = tierStyles[d.tier];
                    const isSelected = selected === d.key;
                    const isToday = d.key === todayKey();
                    return (
                      <Pressable
                        key={d.key}
                        onPress={() => setSelected(isSelected ? null : d.key)}
                        disabled={d.isFuture}
                        style={({ pressed }) => [
                          styles.cell,
                          {
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: d.isFuture ? 'transparent' : t.bg,
                            borderColor: d.isFuture
                              ? 'rgba(42,75,138,0.2)'
                              : isSelected || isToday
                              ? colors.cyan
                              : t.border,
                            borderWidth: isSelected || isToday ? 1.5 : 1,
                            shadowColor: colors.cyan,
                            shadowOpacity: d.isFuture ? 0 : t.shadowOpacity,
                            shadowRadius: t.shadowRadius,
                            shadowOffset: { width: 0, height: 0 },
                            opacity: pressed ? 0.7 : 1,
                          },
                          d.tier === 4 && { elevation: 4 },
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {selectedDay ? (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipDate}>
                {selectedDay.date.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.tooltipDetail}>
                Daily: {selectedDay.dailyCompleted}/{selectedDay.dailyTotal}
                {'   '}
                Side: {selectedDay.sideDone}
              </Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: {
    flexDirection: 'row',
    marginBottom: space.xs,
  },
  monthText: {
    color: colors.textFaint,
    fontFamily: 'Menlo',
    fontSize: 9,
    letterSpacing: 0,
  },
  gridRow: { flexDirection: 'row' },
  dayLabels: {
    width: 14,
    marginRight: 0,
  },
  dayLabel: {
    color: colors.textFaint,
    fontFamily: 'Menlo',
    fontSize: 9,
    letterSpacing: 1,
  },
  grid: { flexDirection: 'row' },
  cell: {
    marginBottom: GAP,
    borderRadius: 2,
  },
  tooltip: {
    marginTop: space.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    backgroundColor: 'rgba(5,6,15,0.8)',
  },
  tooltipDate: {
    color: colors.cyan,
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 1,
  },
  tooltipDetail: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 1,
  },
});
