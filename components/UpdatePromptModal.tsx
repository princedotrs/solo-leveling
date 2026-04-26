import { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '../lib/theme';
import { useStore } from '../lib/store';
import {
  CHECK_THROTTLE_MS,
  checkForUpdate,
  downloadAndInstall,
  getCurrentVersion,
} from '../lib/updater';

export function useAutoUpdateCheck() {
  const lastCheck = useStore((s) => s.lastUpdateCheckAt);
  const setAvailableUpdate = useStore((s) => s.setAvailableUpdate);
  const markChecked = useStore((s) => s.markUpdateCheckedNow);

  useEffect(() => {
    const now = Date.now();
    if (lastCheck && now - lastCheck < CHECK_THROTTLE_MS) return;
    let cancelled = false;
    (async () => {
      try {
        const { info, hasUpdate } = await checkForUpdate();
        if (cancelled) return;
        markChecked();
        if (hasUpdate && info) {
          setAvailableUpdate(info);
        } else {
          setAvailableUpdate(null);
        }
      } catch {
        // silent — manual button still available in UpdaterPanel
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lastCheck, setAvailableUpdate, markChecked]);
}

export function UpdatePromptModal() {
  const available = useStore((s) => s.availableUpdate);
  const rejectedVersion = useStore((s) => s.updateRejectedVersion);
  const reject = useStore((s) => s.rejectAvailableUpdate);

  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);

  const visible =
    available != null &&
    available.version !== rejectedVersion &&
    Platform.OS === 'android';

  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      scale.value = withTiming(1, {
        duration: 360,
        easing: Easing.out(Easing.back(1.3)),
      });
    } else {
      scale.value = 0;
    }
  }, [visible, scale]);

  const enterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  if (!visible || !available) return null;
  const current = getCurrentVersion();

  const handleInstall = async () => {
    if (installing) return;
    setInstalling(true);
    setProgress(0);
    try {
      await downloadAndInstall(available.url, available.version, setProgress);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Install failed';
      Alert.alert('Update failed', msg);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={reject}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, enterStyle]}>
          <View style={styles.banner}>
            <Ionicons name="cloud-download" size={16} color={colors.cyan} />
            <Text style={styles.bannerText}>SYSTEM UPDATE AVAILABLE</Text>
            <Ionicons name="cloud-download" size={16} color={colors.cyan} />
          </View>

          <ScrollView
            contentContainerStyle={{ padding: space.lg }}
            bounces={false}
          >
            <View style={styles.versionRow}>
              <View style={styles.versionCol}>
                <Text style={styles.versionLabel}>INSTALLED</Text>
                <Text style={styles.versionValue}>v{current}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={colors.cyan} />
              <View style={styles.versionCol}>
                <Text style={styles.versionLabel}>NEW</Text>
                <Text style={[styles.versionValue, { color: colors.cyan }]}>
                  v{available.version}
                </Text>
              </View>
            </View>

            {available.notes ? (
              <View style={styles.notes}>
                <Text style={styles.notesLabel}>RELEASE NOTES</Text>
                <Text style={styles.notesText} numberOfLines={10}>
                  {available.notes}
                </Text>
              </View>
            ) : null}

            {installing ? (
              <View style={styles.progressWrap}>
                <Text style={styles.progressLabel}>
                  DOWNLOADING  {Math.round(progress * 100)}%
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[styles.barFill, { width: `${progress * 100}%` }]}
                  />
                </View>
              </View>
            ) : (
              <Text style={styles.warn}>
                Your progress, quests, and license will be preserved.
              </Text>
            )}
          </ScrollView>

          <View style={styles.btnRow}>
            <Pressable
              onPress={reject}
              disabled={installing}
              style={[styles.btn, styles.btnReject, installing && { opacity: 0.4 }]}
            >
              <Text style={[styles.btnText, { color: colors.textDim }]}>
                NOT NOW
              </Text>
            </Pressable>
            <Pressable
              onPress={handleInstall}
              disabled={installing}
              style={[styles.btn, styles.btnInstall]}
            >
              <Text style={[styles.btnText, { color: colors.cyan }]}>
                {installing ? 'WORKING…' : 'INSTALL'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 2,
    borderColor: colors.cyan,
    backgroundColor: '#070b20',
    shadowColor: colors.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: space.md,
    backgroundColor: 'rgba(94,225,255,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: colors.cyan,
  },
  bannerText: {
    color: colors.cyan,
    fontFamily: 'Menlo',
    fontSize: 13,
    letterSpacing: 4,
    fontWeight: '900',
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
  },
  versionCol: { alignItems: 'center' },
  versionLabel: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 2,
  },
  versionValue: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 18,
    fontWeight: '900',
  },
  notes: { marginTop: space.md },
  notesLabel: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: space.xs,
  },
  notesText: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 11,
    lineHeight: 16,
  },
  warn: {
    color: colors.textFaint,
    fontFamily: 'Menlo',
    fontSize: 10,
    marginTop: space.md,
    textAlign: 'center',
    lineHeight: 14,
  },
  progressWrap: {
    marginTop: space.md,
  },
  progressLabel: {
    color: colors.cyan,
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: space.xs,
  },
  barTrack: {
    height: 6,
    backgroundColor: '#08122b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.cyan,
  },
  btnRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.panelBorder,
  },
  btn: {
    flex: 1,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  btnReject: {
    borderRightWidth: 1,
    borderRightColor: colors.panelBorder,
  },
  btnInstall: {
    backgroundColor: 'rgba(94,225,255,0.08)',
  },
  btnText: {
    fontFamily: 'Menlo',
    fontSize: 13,
    letterSpacing: 4,
    fontWeight: '900',
  },
});
