import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, space } from '../lib/theme';

type Props = {
  title: string;
  done: boolean;
  xpReward: number;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  confirmDeleteTitle?: string;
};

export function QuestItem({
  title,
  done,
  xpReward,
  onToggle,
  onEdit,
  onDelete,
  confirmDeleteTitle = 'Delete quest?',
}: Props) {
  const handleToggle = () => {
    Haptics.impactAsync(done ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert(confirmDeleteTitle, title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View style={[styles.row, done && styles.rowDone]}>
      <Pressable onPress={handleToggle} style={styles.checkWrap} hitSlop={8}>
        <View style={[styles.check, done && styles.checkDone]}>
          {done && <Ionicons name="checkmark" size={16} color={colors.bg} />}
        </View>
      </Pressable>

      <Pressable onPress={onEdit} onLongPress={handleDelete} style={styles.titleWrap}>
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.xp}>+{xpReward} XP</Text>
      </Pressable>

      {onDelete && (
        <Pressable onPress={handleDelete} style={styles.deleteBtn} hitSlop={6}>
          <Ionicons name="close" size={18} color={colors.textFaint} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42, 75, 138, 0.4)',
  },
  rowDone: { opacity: 0.55 },
  checkWrap: { marginRight: space.md },
  check: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.cyanDim,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,6,15,0.6)',
  },
  checkDone: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
    shadowColor: colors.cyan,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  titleWrap: { flex: 1 },
  title: {
    color: colors.text,
    fontSize: 15,
    fontFamily: 'Menlo',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.textDim,
  },
  xp: {
    color: colors.cyanSoft,
    fontSize: 10,
    fontFamily: 'Menlo',
    letterSpacing: 1,
    marginTop: 2,
  },
  deleteBtn: { padding: space.xs, marginLeft: space.xs },
});
