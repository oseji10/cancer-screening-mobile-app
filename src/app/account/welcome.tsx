import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

import { PillButton } from "../../components/PillButton";
import { Screen } from "../../components/Screen";
import { colors, fonts } from "../../constants/theme";
import { useAuth } from "../../lib/auth/AuthContext";
import { biometricAvailableAsync, biometricEnabled, hasPendingLogin } from "../../lib/auth/biometric";

/** Shown after a code is accepted (sign-up confirmed, or password reset) instead of jumping straight to Home. */
export default function Welcome() {
  const router = useRouter();
  const { kind = "verified", next } = useLocalSearchParams<{ kind?: string; next?: string }>();
  const { account } = useAuth();

  const reset = kind === "reset";
  const first = (account?.name ?? "").trim().split(/\s+/)[0];

  const heading = reset ? "Password changed" : first ? `You're all set, ${first}!` : "You're all set!";
  const body = reset
    ? "Your password has been updated and you're signed in."
    : "Your account is confirmed and you're signed in. You can now book screening appointments and keep your details safe.";

  const go = async () => {
    // Just signed up: offer fingerprint sign-in before going on.
    if (!reset && hasPendingLogin("client") && (await biometricAvailableAsync()) && !(await biometricEnabled("client"))) {
      router.replace({ pathname: "/account/biometric", params: { next: next || "/home" } } as unknown as Href);
      return;
    }
    router.replace((next || "/home") as Href);
  };

  return (
    <Screen
      contentStyle={styles.content}
      footer={
        <View style={styles.footer}>
          <PillButton tone="purple" label={next ? "Continue" : "Go to Home"} onPress={() => void go()} />
        </View>
      }
    >
      <View style={styles.center}>
        <Image accessibilityLabel="Bloom" source={require("../../../assets/brand/logo.png")} style={styles.logo} resizeMode="contain" />
        <View style={styles.circle}>
          <Ionicons name="checkmark" size={72} color={colors.white} />
        </View>
        <Text accessibilityRole="header" style={styles.heading}>
          {heading}
        </Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { width: 170, height: 91, marginBottom: 16 },
  content: { flexGrow: 1, paddingHorizontal: 24, justifyContent: "center" },
  center: { alignItems: "center", gap: 20, paddingVertical: 48 },
  circle: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#2BD46A", alignItems: "center", justifyContent: "center" },
  heading: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36, color: colors.black, textAlign: "center" },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.textBody, textAlign: "center" },
  footer: { paddingHorizontal: 16, paddingBottom: 16 },
});
