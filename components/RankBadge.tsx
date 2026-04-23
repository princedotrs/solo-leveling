import { View, Text, StyleSheet } from 'react-native';
import { rankColors, colors, radius } from '../lib/theme';

export function RankBadge({ rank, size = 44 }: { rank: string; size?: number }) {
  const color = rankColors[rank] ?? colors.cyan;
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: radius.sm,
          borderColor: color,
          shadowColor: color,
        },
      ]}
    >
      <Text style={[styles.text, { color, fontSize: size * 0.5 }]}>{rank}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,6,15,0.85)',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  text: {
    fontFamily: 'Menlo',
    fontWeight: '900',
    letterSpacing: 2,
  },
});
