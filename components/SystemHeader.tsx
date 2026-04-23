import { View, Text, StyleSheet } from 'react-native';
import { colors, space } from '../lib/theme';

export function SystemHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.line} />
      <Text style={styles.tag}>[ SYSTEM ]</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    gap: 2,
  },
  line: {
    width: 40,
    height: 2,
    backgroundColor: colors.cyan,
    marginBottom: space.xs,
    shadowColor: colors.cyan,
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  tag: {
    color: colors.cyan,
    fontFamily: 'Menlo',
    fontSize: 10,
    letterSpacing: 3,
  },
  title: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 18,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 2,
  },
});
