import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, type } from "../constants/theme";

export function PrivacyNote() {
  return (
    <View style={styles.row}>
      <Ionicons name="lock-closed" size={20} color={colors.primary500} />
      <Text style={[type.caption, styles.text]}>Your information is private and secure</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 12,
  },
  text: {
    color: colors.black,
    opacity: 0.75,
  },
});
