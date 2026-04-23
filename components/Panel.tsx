import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, space } from '../lib/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
};

export function Panel({ children, style, glow = true }: Props) {
  return (
    <View style={[styles.outer, glow && styles.glow, style]}>
      <View style={styles.cornerTL} />
      <View style={styles.cornerTR} />
      <View style={styles.cornerBL} />
      <View style={styles.cornerBR} />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const CORNER = 12;
const styles = StyleSheet.create({
  outer: {
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    padding: space.md,
    position: 'relative',
  },
  glow: {
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  inner: { zIndex: 1 },
  cornerTL: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: CORNER,
    height: CORNER,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.cyan,
    borderTopLeftRadius: radius.md,
  },
  cornerTR: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: CORNER,
    height: CORNER,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.cyan,
    borderTopRightRadius: radius.md,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -1,
    left: -1,
    width: CORNER,
    height: CORNER,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.cyan,
    borderBottomLeftRadius: radius.md,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: CORNER,
    height: CORNER,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.cyan,
    borderBottomRightRadius: radius.md,
  },
});
