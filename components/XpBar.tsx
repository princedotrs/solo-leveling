import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors, radius, space } from '../lib/theme';

type Props = { current: number; max: number };

export function XpBar({ current, max }: Props) {
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : current / max));
  const w = useSharedValue(0);

  useEffect(() => {
    w.value = withTiming(pct, { duration: 600 });
  }, [pct, w]);

  const style = useAnimatedStyle(() => ({
    width: `${w.value * 100}%`,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, style]} />
        <View style={styles.segments} pointerEvents="none">
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={styles.segment} />
          ))}
        </View>
      </View>
      <Text style={styles.label}>
        {current} / {max} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: space.sm },
  track: {
    height: 14,
    backgroundColor: '#08122b',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.cyan,
    shadowColor: colors.cyan,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  segments: {
    position: 'absolute',
    inset: 0,
    flexDirection: 'row',
  },
  segment: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: 'rgba(5,6,15,0.6)',
  },
  label: {
    marginTop: space.xs,
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 1,
    textAlign: 'right',
  },
});
