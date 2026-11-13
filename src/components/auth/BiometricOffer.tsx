import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "../../constants/theme";
import { biometricLabel, enableBiometric, SavedLogin } from "../../lib/auth/biometric";

/**
 * "Use your fingerprint to sign in next time?" Shown right after a password sign-in (the password is
 * still in memory), or from Settings, where the person types the password again to turn it on.
 */
export function BiometricOffer({
  scope,
  saved,
  login,
  verify,
  onDone,
  accent,
}: {
  scope: "client" | "chw";
  /** Details from the sign-in just done; when missing, the password is asked for. */
  saved: SavedLogin | null;
  /** Email / phone to save with a typed password. */
  login?: string;
  /** Checks a typed password with the server; returns an error message or null. */
  verify?: (login: string, password: string) => Promise<string | null>;
  onDone: (turnedOn: boolean) => void;
  accent: string;
}) {
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = biometricLabel();
  const needPassword = !saved;

  const turnOn = async () => {
    setBusy(true);
    setError(null);
    let details = saved;
    if (!details) {
      const l = login ?? "";
      const err = verify ? await verify(l, password) : null;
      if (err) {
        setError(err);
        setBusy(false);
        return;
      }
      details = { login: l, password };
    }
    const ok = await enableBiometric(scope, details);
    setBusy(false);
    if (ok) onDone(true);
    else setError(`Could not turn on ${name} sign-in. Check that ${name} is set up on this phone and try again.`);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
    <View style={[styles.screen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.body}>
        <View style={[styles.icon, { backgroundColor: `${accent}22` }]}>
          <Ionicons name="finger-print" size={56} color={accent} />
        </View>
        <Text style={styles.title}>Sign in faster with {name}</Text>
        <Text style={styles.sub}>
          Next time, use your {name} instead of typing your password. Your {name} stays on this phone; Bloom never sees it.
        </Text>
        {needPassword ? (
          <View style={styles.field}>
            <Text style={styles.label}>Confirm your password</Text>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" placeholder="Your password" placeholderTextColor="#A7A2B3" style={styles.input} />
          </View>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <Pressable accessibilityRole="button" disabled={busy || (needPassword && !password)} onPress={() => void turnOn()} style={[styles.primary, { backgroundColor: accent }, (busy || (needPassword && !password)) && { opacity: 0.5 }]}>
        <Text style={styles.primaryText}>{busy ? "Turning on…" : `Use ${name}`}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => onDone(false)} style={styles.secondary} hitSlop={8}>
        <Text style={[styles.secondaryText, { color: accent }]}>Not now</Text>
      </Pressable>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 24 },
  body: { flex: 1, alignItems: "center", gap: 12 },
  icon: { width: 112, height: 112, borderRadius: 56, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, color: "#29243B", textAlign: "center" },
  sub: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: "#777386", textAlign: "center" },
  field: { alignSelf: "stretch", gap: 6, marginTop: 12 },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: "#29243B" },
  input: { minHeight: 52, borderWidth: 1, borderColor: "#E7E5EC", borderRadius: 14, paddingHorizontal: 14, fontFamily: fonts.regular, fontSize: 15, color: "#29243B" },
  error: { fontFamily: fonts.medium, fontSize: 14, color: "#C23B3B", textAlign: "center" },
  primary: { height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  primaryText: { fontFamily: fonts.semibold, fontSize: 16, color: "#FFFFFF" },
  secondary: { alignItems: "center", paddingVertical: 16 },
  secondaryText: { fontFamily: fonts.semibold, fontSize: 15 },
});

