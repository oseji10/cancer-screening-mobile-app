import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

import { fonts } from "../../constants/theme";
import { biometricLabel } from "../../lib/auth/biometric";

/** "Sign in with fingerprint" button for the sign-in screens. */
export function BiometricButton({ onPress, busy, accent }: { onPress: () => void; busy?: boolean; accent: string }) {
  return (
    <Pressable accessibilityRole="button" disabled={busy} onPress={onPress} style={[styles.btn, { borderColor: accent }, busy && { opacity: 0.6 }]}>
      <Ionicons name="finger-print" size={22} color={accent} />
      <Text style={[styles.text, { color: accent }]}>{busy ? "Signing in…" : `Sign in with ${biometricLabel()}`}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 27, borderWidth: 1.5, backgroundColor: "#FFFFFF" },
  text: { fontFamily: fonts.semibold, fontSize: 16 },
});
