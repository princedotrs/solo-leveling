import { useMemo, useState } from 'react';
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
import { XP_PER_SIDE } from '../../lib/leveling';

export default function SideScreen() {
  const insets = useSafeAreaInsets();
  const quests = useStore((s) => s.sideQuests);
  const add = useStore((s) => s.addSideQuest);
  const complete = useStore((s) => s.completeSideQuest);
  const rename = useStore((s) => s.renameSideQuest);
  const remove = useStore((s) => s.deleteSideQuest);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [showDone, setShowDone] = useState(true);

  const { active, done } = useMemo(() => {
    return {
      active: quests.filter((q) => !q.completedAt),
      done: quests.filter((q) => q.completedAt),
    };
  }, [quests]);

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
        <SystemHeader title="Side Quests" subtitle="one-off objectives" />

        <View style={styles.body}>
          <Panel>
            <Text style={styles.sectionTitle}>ADD SIDE QUEST</Text>
            <AddQuestBar
              placeholder="e.g. Reply to mom's email"
              onAdd={add}
            />
            <Text style={styles.hint}>
              One-off tasks. Worth {XP_PER_SIDE} XP each. Long-press to delete.
            </Text>
          </Panel>

          <Panel>
            <Text style={styles.sectionTitle}>ACTIVE ({active.length})</Text>
            {active.length === 0 ? (
              <Text style={styles.empty}>No active side quests.</Text>
            ) : (
              active.map((q) => (
                <QuestItem
                  key={q.id}
                  title={q.title}
                  done={false}
                  xpReward={XP_PER_SIDE}
                  onToggle={() => complete(q.id)}
                  onEdit={() => {
                    setEditingId(q.id);
                    setDraft(q.title);
                  }}
                  onDelete={() => remove(q.id)}
                  confirmDeleteTitle="Remove side quest?"
                />
              ))
            )}
          </Panel>

          {done.length > 0 && (
            <Panel>
              <Pressable
                onPress={() => setShowDone((v) => !v)}
                style={styles.doneHeader}
              >
                <Text style={styles.sectionTitle}>
                  COMPLETED ({done.length}) {showDone ? '▾' : '▸'}
                </Text>
              </Pressable>
              {showDone &&
                done.map((q) => (
                  <QuestItem
                    key={q.id}
                    title={q.title}
                    done
                    xpReward={XP_PER_SIDE}
                    onToggle={() => complete(q.id)}
                    onDelete={() => remove(q.id)}
                    confirmDeleteTitle="Remove side quest?"
                  />
                ))}
            </Panel>
          )}
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
  useMemo(() => {
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
  doneHeader: { marginBottom: 0 },
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
