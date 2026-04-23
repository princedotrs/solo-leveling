import { forwardRef } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Svg, {
  Rect,
  Path,
  Line,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../lib/store';
import { levelFromTotalXp, rankFromLevel } from '../lib/leveling';

const VB_W = 640;
const VB_H = 400;
const RATIO = VB_W / VB_H;

type Props = {
  width: number;
  onPickPhoto?: () => void;
  showHints?: boolean;
};

export const LicenseCard = forwardRef<View, Props>(function LicenseCard(
  { width, onPickPhoto, showHints = true },
  ref
) {
  const name = useStore((s) => s.hunterName);
  const totalXp = useStore((s) => s.totalXp);
  const photoUri = useStore((s) => s.photoUri);
  const affiliation = useStore((s) => s.affiliation);
  const country = useStore((s) => s.country);

  const { level } = levelFromTotalXp(totalXp);
  const rank = rankFromLevel(level);

  if (width <= 0) return null;

  const height = width / RATIO;
  const s = (n: number) => (n * width) / VB_W;

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[styles.card, { width, height }]}
    >
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
      >
        <Defs>
          <LinearGradient id="headerBlue" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#2ba6e3" />
            <Stop offset="1" stopColor="#4cc6ff" />
          </LinearGradient>
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#101f35" />
            <Stop offset="1" stopColor="#070d1a" />
          </LinearGradient>
        </Defs>

        <G>
          <Rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#bgGrad)" />

          <G opacity="0.18">
            {Array.from({ length: 21 }).map((_, i) => (
              <Line
                key={`v${i}`}
                x1={i * 32}
                y1={0}
                x2={i * 32}
                y2={VB_H}
                stroke="#3cb5f1"
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: 14 }).map((_, i) => (
              <Line
                key={`h${i}`}
                x1={0}
                y1={i * 32}
                x2={VB_W}
                y2={i * 32}
                stroke="#3cb5f1"
                strokeWidth="0.5"
              />
            ))}
          </G>

          <G opacity="0.35">
            <Path d="M 40 200 L 200 200 L 210 215 L 40 215 Z" fill="#3cb5f1" />
            <Rect x="42" y="218" width="6" height="6" fill="#3cb5f1" />
            <Rect x="60" y="218" width="4" height="4" fill="#3cb5f1" />
            <Path d="M 340 280 L 520 280 L 540 300 L 340 300 Z" fill="#3cb5f1" />
          </G>

          <Path d="M 0 0 L 500 0 L 470 60 L 0 60 Z" fill="#ffffff" />
          <Path d="M 500 0 L 560 0 L 530 60 L 470 60 Z" fill="url(#headerBlue)" />
          <Path d="M 560 0 L 610 0 L 580 60 L 530 60 Z" fill="#ffffff" />

          <Path d="M 300 70 L 455 70 L 430 95 L 275 95 Z" fill="url(#headerBlue)" />

          <Path
            d="M 370 110 L 560 110 L 640 200 L 560 290 L 370 290 L 430 200 Z"
            fill="url(#headerBlue)"
          />

          <Path
            d="M 480 150 L 590 150 L 640 200 L 590 250 L 480 250 L 510 200 Z"
            fill="#0a1525"
            stroke="#3cb5f1"
            strokeWidth="2"
          />

          <Path
            d="M 30 60 L 235 60 L 235 325 L 55 325 L 30 300 Z"
            fill="#f0f7ff"
            stroke="#3cb5f1"
            strokeWidth="1.5"
          />

          <Path
            d="M 200 210 L 420 210 L 400 240 L 190 240 L 210 225 Z"
            fill="#3cb5f1"
            opacity="0.15"
          />
          <Line
            x1={200}
            y1={238}
            x2={400}
            y2={238}
            stroke="#3cb5f1"
            strokeWidth="1.5"
          />

          <Rect
            x="72"
            y="340"
            width="52"
            height="40"
            rx="4"
            fill="#d9b964"
            stroke="#9a7e38"
            strokeWidth="1"
          />
          <Line x1="72" y1="355" x2="124" y2="355" stroke="#9a7e38" strokeWidth="0.8" />
          <Line x1="72" y1="365" x2="124" y2="365" stroke="#9a7e38" strokeWidth="0.8" />
          <Line x1="98" y1="340" x2="98" y2="380" stroke="#9a7e38" strokeWidth="0.8" />

          <G>
            {Array.from({ length: 24 }).map((_, i) => {
              const widths = [1.5, 3, 1.5, 2, 3, 1.5, 2, 1.5, 3, 2, 1.5, 2, 3, 1.5, 2, 2, 1.5, 3, 2, 1.5, 2, 3, 1.5, 2];
              return (
                <Rect
                  key={i}
                  x={470 + i * 6}
                  y={342}
                  width={widths[i]}
                  height={36}
                  fill="#cfe3f7"
                />
              );
            })}
          </G>

          <Path d="M 0 0 L 18 0 L 0 18 Z" fill="#3cb5f1" />
          <Path d="M 622 382 L 640 382 L 640 400 Z" fill="#3cb5f1" />
        </G>
      </Svg>

      <Pressable
        onPress={onPickPhoto}
        disabled={!onPickPhoto}
        style={{
          position: 'absolute',
          left: s(42),
          top: s(72),
          width: s(190),
          height: s(240),
          overflow: 'hidden',
        }}
      >
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#e3eefb',
            }}
          >
            <Ionicons name="person" size={s(110)} color="#9bb9d4" />
            {showHints && onPickPhoto ? (
              <View
                style={{
                  position: 'absolute',
                  bottom: s(8),
                  paddingHorizontal: s(8),
                  paddingVertical: s(3),
                  backgroundColor: 'rgba(10,21,37,0.75)',
                }}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: s(9),
                    letterSpacing: s(2),
                    fontFamily: 'Menlo',
                  }}
                >
                  TAP TO ADD
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </Pressable>

      <View
        style={{
          position: 'absolute',
          top: s(12),
          right: s(60),
          alignItems: 'flex-end',
        }}
      >
        <Text
          style={{
            color: '#0a1525',
            fontWeight: '900',
            fontSize: s(24),
            letterSpacing: s(0.5),
          }}
        >
          Official Hunter&apos;s License
        </Text>
        <Text
          style={{
            color: '#3cb5f1',
            fontWeight: '900',
            fontSize: s(16),
            letterSpacing: s(2),
            marginTop: s(2),
          }}
        >
          {'\u25B6\u25B6\u25B6'}
        </Text>
      </View>

      <View
        style={{
          position: 'absolute',
          left: s(210),
          top: s(212),
          width: s(200),
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: '#ffffff',
            fontSize: s(22),
            fontWeight: '900',
            letterSpacing: s(0.3),
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            color: '#3cb5f1',
            fontSize: s(14),
            fontWeight: '900',
            letterSpacing: s(5),
            marginTop: s(6),
          }}
        >
          SOLO LEVELING
        </Text>
      </View>

      <View
        style={{
          position: 'absolute',
          right: s(28),
          top: s(150),
          width: s(130),
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: '#3cb5f1',
            fontSize: s(92),
            fontWeight: '900',
            lineHeight: s(96),
          }}
        >
          {rank}
        </Text>
        <Text
          style={{
            color: '#ffffff',
            fontSize: s(13),
            fontWeight: '900',
            letterSpacing: s(5),
            marginTop: s(-2),
          }}
        >
          RANK
        </Text>
      </View>

      <View
        style={{
          position: 'absolute',
          left: s(140),
          bottom: s(18),
          right: s(180),
        }}
      >
        <InfoRow label="Affiliation" value={affiliation} extraLabel="Class" extraValue="Hunter" s={s} />
        <InfoRow label="Country" value={country} s={s} />
        <InfoRow label="Issuer" value="Hunter Association" s={s} />
      </View>
    </View>
  );
});

function InfoRow({
  label,
  value,
  extraLabel,
  extraValue,
  s,
}: {
  label: string;
  value: string;
  extraLabel?: string;
  extraValue?: string;
  s: (n: number) => number;
}) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: s(3), alignItems: 'center' }}>
      <Text
        style={{
          color: '#5e82aa',
          fontSize: s(10),
          width: s(72),
          fontFamily: 'Menlo',
          letterSpacing: s(0.5),
        }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          color: '#ffffff',
          fontSize: s(11),
          flex: 1,
          fontFamily: 'Menlo',
          fontWeight: '600',
        }}
      >
        {value}
      </Text>
      {extraLabel ? (
        <>
          <Text
            style={{
              color: '#5e82aa',
              fontSize: s(10),
              width: s(44),
              fontFamily: 'Menlo',
              letterSpacing: s(0.5),
            }}
          >
            {extraLabel}
          </Text>
          <Text
            style={{
              color: '#ffffff',
              fontSize: s(11),
              fontFamily: 'Menlo',
              fontWeight: '600',
            }}
          >
            {extraValue}
          </Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0a1525',
    shadowColor: '#3cb5f1',
    shadowOpacity: 0.55,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 18,
  },
});
