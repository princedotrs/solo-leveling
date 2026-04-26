import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Panel } from './Panel';
import { colors, space } from '../lib/theme';
import { useStore } from '../lib/store';
import {
  checkForUpdate,
  downloadAndInstall,
  getCurrentVersion,
} from '../lib/updater';

type Status = 'idle' | 'checking' | 'installing';

export function UpdaterPanel() {
  const available = useStore((s) => s.availableUpdate);
  const setAvailable = useStore((s) => s.setAvailableUpdate);
  const markChecked = useStore((s) => s.markUpdateCheckedNow);
  const lastCheck = useStore((s) => s.lastUpdateCheckAt);
  const rejectedVersion = useStore((s) => s.updateRejectedVersion);

  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const current = getCurrentVersion();
  const hasUpdate = available != null;

  const handleCheck = async () => {
    if (status !== 'idle') return;
    Haptics.selectionAsync();
    setStatus('checking');
    setError(null);
    try {
      const { info, hasUpdate } = await checkForUpdate();
      markChecked();
      setAvailable(hasUpdate ? info : null);
      if (!hasUpdate) {
        Alert.alert('Up to date', `You are on the latest version (v${current}).`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Check failed');
    } finally {
      setStatus('idle');
    }
  };

  const handleInstall = async () => {
    if (!available || status !== 'idle') return;
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Android only',
        'In-app install works on Android. Download the APK from GitHub Releases on other platforms.'
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setStatus('installing');
    setProgress(0);
    setError(null);
    try {
      await downloadAndInstall(available.url, available.version, setProgress);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Install failed');
    } finally {
      setStatus('idle');
    }
  };

  const lastCheckText = lastCheck
    ? formatRelative(Date.now() - lastCheck)
    : 'never';

  return (
    <Panel>
      <Text style={styles.sectionTitle}>UPDATE</Text>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Installed</Text>
          <Text style={styles.value}>v{current}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={styles.label}>Latest</Text>
          <Text
            style={[
              styles.value,
              hasUpdate ? { color: colors.cyan } : null,
            ]}
          >
            {available ? `v${available.version}` : '—'}
          </Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: hasUpdate
                ? colors.cyan
                : status === 'checking'
                  ? colors.gold
                  : colors.success,
            },
          ]}
        />
        <Text style={styles.statusText}>
          {status === 'checking'
            ? 'Checking GitHub…'
            : status === 'installing'
              ? `Downloading ${Math.round(progress * 100)}%`
              : hasUpdate
                ? rejectedVersion === available?.version
                  ? `v${available?.version} ready (you dismissed the prompt)`
                  : `v${available?.version} ready to install`
                : `Up to date · last checked ${lastCheckText}`}
        </Text>
      </View>

      {status === 'installing' ? (
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.btnRow}>
        <Pressable
          onPress={handleCheck}
          disabled={status !== 'idle'}
          style={[styles.btn, status !== 'idle' && { opacity: 0.4 }]}
        >
          <Ionicons name="refresh" size={14} color={colors.textDim} />
          <Text style={styles.btnText}>CHECK</Text>
        </Pressable>
        <Pressable
          onPress={handleInstall}
          disabled={!hasUpdate || status !== 'idle'}
          style={[
            styles.btn,
            styles.btnPrimary,
            (!hasUpdate || status !== 'idle') && { opacity: 0.4 },
          ]}
        >
          <Ionicons name="cloud-download" size={14} color={colors.cyan} />
          <Text style={[styles.btnText, { color: colors.cyan }]}>
            {status === 'installing' ? 'WORKING…' : 'INSTALL'}
          </Text>
        </Pressable>
      </View>
    </Panel>
  );
}

function formatRelative(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.cyan,
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: space.sm,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42,75,138,0.3)',
  },
  label: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 2,
  },
  value: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 16,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 11,
    flex: 1,
  },
  barTrack: {
    height: 4,
    backgroundColor: '#08122b',
    borderRadius: 2,
    marginTop: space.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.cyan,
  },
  error: {
    color: colors.danger,
    fontFamily: 'Menlo',
    fontSize: 10,
    marginTop: space.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: space.sm,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    backgroundColor: 'rgba(5,6,15,0.7)',
  },
  btnPrimary: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(94,225,255,0.08)',
  },
  btnText: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
});
