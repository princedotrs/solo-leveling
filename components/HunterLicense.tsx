import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LicenseCard } from './LicenseCard';
import { useStore } from '../lib/store';
import { colors, space } from '../lib/theme';

type Props = {
  width: number;
};

export function HunterLicense({ width }: Props) {
  const cardRef = useRef<View>(null);
  const [showHints, setShowHints] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  const photoUri = useStore((s) => s.photoUri);
  const setPhotoUri = useStore((s) => s.setPhotoUri);
  const affiliation = useStore((s) => s.affiliation);
  const setAffiliation = useStore((s) => s.setAffiliation);
  const country = useStore((s) => s.country);
  const setCountry = useStore((s) => s.setCountry);

  const pickPhoto = async () => {
    Haptics.selectionAsync();
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission needed',
        'Allow photo library access to add your hunter portrait.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handlePhotoPress = () => {
    if (!photoUri) {
      pickPhoto();
      return;
    }
    Alert.alert('Hunter Portrait', undefined, [
      { text: 'Replace', onPress: pickPhoto },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setPhotoUri(null),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const share = async () => {
    if (sharing) return;
    setSharing(true);
    setShowHints(false);
    await new Promise((r) => setTimeout(r, 60));
    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing unavailable', 'Sharing is not supported on this device.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Hunter License',
        UTI: 'public.png',
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unable to share';
      Alert.alert('Share failed', msg);
    } finally {
      setShowHints(true);
      setSharing(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <LicenseCard
        ref={cardRef}
        width={width}
        onPickPhoto={handlePhotoPress}
        showHints={showHints}
      />

      <View style={styles.actions}>
        <Pressable onPress={share} style={[styles.btn, styles.btnPrimary]} disabled={sharing}>
          <Ionicons name="share-outline" size={16} color={colors.cyan} />
          <Text style={[styles.btnText, { color: colors.cyan }]}>
            {sharing ? 'CAPTURING…' : 'SHARE LICENSE'}
          </Text>
        </Pressable>
        <Pressable onPress={() => setEditOpen(true)} style={styles.btn}>
          <Ionicons name="create-outline" size={16} color={colors.textDim} />
          <Text style={styles.btnText}>EDIT INFO</Text>
        </Pressable>
      </View>

      <EditLicenseModal
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        initial={{ affiliation, country }}
        onSave={(v) => {
          setAffiliation(v.affiliation);
          setCountry(v.country);
          setEditOpen(false);
        }}
      />
    </View>
  );
}

function EditLicenseModal({
  visible,
  onClose,
  initial,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initial: { affiliation: string; country: string };
  onSave: (v: { affiliation: string; country: string }) => void;
}) {
  const [affiliation, setAffiliation] = useState(initial.affiliation);
  const [country, setCountry] = useState(initial.country);

  const reset = () => {
    setAffiliation(initial.affiliation);
    setCountry(initial.country);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      onShow={reset}
    >
      <View style={modalStyles.overlay}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: space.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={modalStyles.card}>
            <Text style={modalStyles.title}>EDIT LICENSE</Text>

            <Field label="Affiliation" value={affiliation} onChange={setAffiliation} />
            <Field label="Country" value={country} onChange={setCountry} />

            <View style={modalStyles.row}>
              <Pressable onPress={onClose} style={modalStyles.btn}>
                <Text style={modalStyles.btnText}>CANCEL</Text>
              </Pressable>
              <Pressable
                onPress={() => onSave({ affiliation, country })}
                style={[modalStyles.btn, modalStyles.btnPrimary]}
              >
                <Text style={[modalStyles.btnText, { color: colors.cyan }]}>SAVE</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ marginBottom: space.md }}>
      <Text style={modalStyles.fieldLabel}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={modalStyles.input}
        placeholderTextColor={colors.textFaint}
        maxLength={40}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  actions: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  card: {
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
    marginBottom: space.lg,
  },
  fieldLabel: {
    color: colors.textDim,
    fontFamily: 'Menlo',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: space.xs,
  },
  input: {
    color: colors.text,
    fontFamily: 'Menlo',
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
    paddingVertical: space.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: space.sm,
    marginTop: space.md,
  },
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

