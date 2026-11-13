import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { fonts } from "../../constants/theme";
import { biometricLabel, BiometricScope, dismissNudge, shouldNudge } from "../../lib/auth/biometric";

/**
 * "Sign in faster with your fingerprint" card for people who are signed in but haven't turned it on.
 * Hidden on phones without biometrics, once it's on, or after "Not now".
 */
export function BiometricNudge({ scope, accent, onEnable, visible = true }: { scope: BiometricScope; accent: string; onEnable: () => void; visible?: boolean }) {
  const [show, setShow] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      if (visible) void shouldNudge(scope).then((v) => alive && setShow(v));
      else setShow(false);
      return () => {
        alive = false;
      };
    }, [scope, visible]),
  );

  if (!show) return null;
  const name = biometricLabel();

  return (
    <View style={[styles.card, { borderColor: `${accent}55`, backgroundColor: `${accent}12` }]}>
      <Ionicons name="finger-print" size={30} color={accent} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.title}>Sign in faster with your {name}</Text>
        <Text style={styles.text}>Skip typing your password next time. Your {name} stays on this phone.</Text>
        <View style={styles.row}>
          <Pressable accessibilityRole="button" onPress={onEnable} style={[styles.btn, { backgroundColor: accent }]}>
            <Text style={styles.btnText}>Turn on</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void dismissNudge(scope);
              setShow(false);
            }}
            hitSlop={8}
          >
            <Text style={[styles.later, { color: accent }]}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", gap: 12, borderWidth: 1, borderRadius: 18, padding: 14 },
  title: { fontFamily: fonts.bold, fontSize: 15, color: "#29243B" },
  text: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: "#5F5A7A" },
  row: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 6 },
  btn: { borderRadius: 18, paddingHorizontal: 16, height: 36, justifyContent: "center" },
  btnText: { fontFamily: fonts.semibold, fontSize: 14, color: "#FFFFFF" },
  later: { fontFamily: fonts.semibold, fontSize: 14 },
});
