import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius, space } from "../lib/theme";

export function AddQuestBar({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (title: string) => void;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const t = value.trim();
    if (!t) return;
    Haptics.selectionAsync();
    onAdd(t);
    setValue("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.prefix}>›</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <Pressable onPress={submit} style={styles.btn} hitSlop={8}>
        <Ionicons name="add" size={22} color={colors.cyan} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: radius.md,
    paddingHorizontal: space.sm,
    backgroundColor: "rgba(5,6,15,0.8)",
  },
  prefix: {
    color: colors.cyan,
    fontFamily: "Menlo",
    fontSize: 18,
    marginRight: space.xs,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: "Menlo",
    paddingVertical: space.md,
    fontSize: 14,
  },
  btn: {
    padding: space.sm,
  },
});
