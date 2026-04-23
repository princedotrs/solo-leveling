import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '../../lib/theme';
import { Panel } from '../../components/Panel';
import { QuestItem } from '../../components/QuestItem';
import { AddQuestBar } from '../../components/AddQuestBar';
import { SystemHeader } from '../../components/SystemHeader';
import { useStore } from '../../lib/store';
import { XP_PER_DAILY, todayKey } from '../../lib/leveling';

export default function DailyScreen() {
  const insets = useSafeAreaInsets();
  const quests = useStore((s) => s.dailyQuests);
  const add = useStore((s) => s.addDailyQuest);
  const toggle = useStore((s) => s.toggleDailyQuest);
  const rename = useStore((s) => s.renameDailyQuest);
  const remove = useStore((s) => s.deleteDailyQuest);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const today = todayKey();
  const { doneCount, total } = useMemo(() => {
    const done = quests.filter((q) => q.lastCompletedDay === today).length;
    return { doneCount: done, total: quests.length };
  }, [quests, today]);

  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: space.xxl, paddingTop: insets.top }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SystemHeader title="Daily Quests" subtitle="resets at midnight" />

        <View style={styles.body}>
          <Panel>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryLabel}>TODAY&apos;S OBJECTIVES</Text>
                <Text style={styles.summaryValue}>
                  {doneCount} / {total} cleared
                </Text>
              </View>
              <Text style={styles.summaryPct}>{progress}%</Text>
            </View>
            {total > 0 && (
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${progress}%` }]} />
              </View>
            )}
          </Panel>

          <Panel>
            <Text style={styles.sectionTitle}>ADD DAILY ROUTINE</Text>
            <AddQuestBar placeholder="e.g. Morning workout" onAdd={add} />
            <Text style={styles.hint}>
              Repeats every day. Tap the title to rename. Long-press to delete.
            </Text>
          </Panel>

          <Panel>
            <Text style={styles.sectionTitle}>QUESTS</Text>
            {quests.length === 0 ? (
              <Text style={styles.empty}>
                No daily quests yet. Add one above to begin your routine.
              </Text>
            ) : (
              quests.map((q) => (
                <QuestItem
                  key={q.id}
                  title={q.title}
                  done={q.lastCompletedDay === today}
                  xpReward={XP_PER_DAILY}
                  onToggle={() => toggle(q.id)}
                  onEdit={() => {
                    setEditingId(q.id);
                    setDraft(q.title);
                  }}
                  onDelete={() => remove(q.id)}
                  confirmDeleteTitle="Remove daily quest?"
                />
              ))
            )}
          </Panel>
        </View>
      </ScrollView>

      <EditModal
        visible={editingId != null}
        initial={draft}
        onCancel={() => setEditingId(null)}
        onSave={(t) => {
          if (editingId) rename(editingId, t);
          setEditingId(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

function EditModal({
  visible,
  initial,
  onCancel,
  onSave,
}: {
  visible: boolean;
  initial: string;
  onCancel: () => void;
  onSave: (t: string) => void;
}) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    setValue(initial);
  }, [initial]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={editStyles.overlay}>
        <View style={editStyles.card}>
          <Text style={editStyles.title}>EDIT QUEST</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            autoFocus
            style={editStyles.input}
            placeholderTextColor={colors.textFaint}
          />
          <View style={editStyles.row}>
            <Pressable onPress={onCancel} style={editStyles.btn}>
              <Text style={editStyles.btnText}>CANCEL</Text>
            </Pressable>
            <Pressable
              onPress={() => onSave(value)}
              style={[editStyles.btn, editStyles.btnPrimary]}
            >
              <Text style={[editStyles.btnText, { color: colors.cyan }]}>SAVE</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: space.lg, gap: space.lg },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 10,
    letterSpacing: 2,
  },
  summaryValue: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  summaryPct: {
    color: colors.cyan,
    fontFamily: 'Menlo',
    fontSize: 26,
    fontWeight: '900',
  },
  barTrack: {
    height: 6,
    backgroundColor: '#08122b',
    borderRadius: 3,
    marginTop: space.md,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.cyan,
  },
  sectionTitle: {
    color: colors.cyan,
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: space.sm,
  },
  hint: {
    color: colors.textFaint,
    fontFamily: 'Menlo',
    fontSize: 10,
    marginTop: space.sm,
    lineHeight: 14,
  },
  empty: {
    color: colors.textFaint,
    fontFamily: 'Menlo',
    fontSize: 12,
    paddingVertical: space.lg,
    textAlign: 'center',
  },
});

const editStyles = StyleSheet.create({
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
    backgroundColor: '#070b20',
    borderWidth: 1,
    borderColor: colors.cyan,
    padding: space.lg,
  },
  title: {
    color: colors.cyan,
    fontFamily: 'Menlo',
    fontSize: 13,
    letterSpacing: 3,
    marginBottom: space.md,
  },
  input: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
    paddingVertical: space.sm,
    marginBottom: space.lg,
  },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: space.sm },
  btn: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
  btnPrimary: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(94,225,255,0.08)',
  },
  btnText: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
  },
});
