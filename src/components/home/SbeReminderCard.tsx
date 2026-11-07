import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../../constants/theme";

/** Pink "Ready to do your Self Breast examination?" card. */
export function SbeReminderCard({ onStart }: { onStart: () => void }) {
  return (
    <View style={styles.card}>
      {/* Figma draws a white cloud/sun outline here; Ionicons stand-in until the asset is exported. */}
      <View style={styles.icon}>
        <Ionicons name="partly-sunny-outline" size={80} color={colors.white} />
      </View>
      <Text style={styles.title}>Ready to do your Self Breast examination?</Text>
      <Text style={styles.body}>
        No one knows your body like you do, regular self breast examination helps you notice any changes early!
      </Text>
      <Pressable accessibilityRole="button" onPress={onStart} style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}>
        <Text style={styles.buttonLabel}>Start Check</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 205,
    borderRadius: 20,
    backgroundColor: colors.reminderBg,
    borderWidth: 1,
    borderColor: colors.reminderBorder,
    overflow: "hidden",
  },
  icon: { position: "absolute", right: 14, top: 22 },
  title: {
    position: "absolute",
    left: 11,
    top: 24,
    width: 233,
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 22,
    color: colors.reminderTitle,
  },
  body: {
    position: "absolute",
    left: 11,
    top: 76,
    width: 262,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
  button: {
    position: "absolute",
    left: 11,
    top: 148,
    width: 154,
    height: 43,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 24, color: colors.reminderButton },
});
