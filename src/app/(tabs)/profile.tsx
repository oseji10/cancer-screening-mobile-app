import { Ionicons } from "@expo/vector-icons";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { ComponentProps, useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PillButton } from "../../components/PillButton";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { colors, fonts } from "../../constants/theme";
import { useAuth } from "../../lib/auth/AuthContext";
import { biometricEnabled, biometricLabel, disableBiometric, useBiometricSupported } from "../../lib/auth/biometric";
import { config } from "../../lib/config";
import { useProfile } from "../../lib/profile/ProfileContext";

type IconName = ComponentProps<typeof Ionicons>["name"];

function Row({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <Ionicons name={icon} size={22} color={danger ? "#C23B3B" : colors.setupPurple} />
      <Text style={[styles.rowLabel, danger && { color: "#C23B3B" }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.iconIdle} />
    </Pressable>
  );
}

/** Profile: account details when signed in, a sign-in prompt for guests. */
export default function Profile() {
  const router = useRouter();
  const { reset, profile } = useProfile();
  const { account, signedIn, logout } = useAuth();
  const [leaving, setLeaving] = useState(false);
  const [bioOn, setBioOn] = useState(false);
  const bioAvailable = useBiometricSupported();

  useFocusEffect(
    useCallback(() => {
      void biometricEnabled("client").then(setBioOn);
    }, []),
  );

  const toggleBio = async () => {
    if (bioOn) {
      await disableBiometric("client");
      setBioOn(false);
    } else {
      router.push({ pathname: "/account/biometric", params: { next: "/profile" } } as unknown as Href);
    }
  };

  const go = (path: string) => router.push(path as Href);
  const name = account?.name ?? profile.name;

  const signOut = async () => {
    setLeaving(true);
    await logout();
    setLeaving(false);
  };

  return (
    <Screen contentStyle={styles.content}>
      <ScreenHeader title="Profile" onBack={() => router.replace("/home" as Href)} />

      <View style={styles.who}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(name.trim()[0] ?? "B").toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{name || "Welcome to Bloom"}</Text>
        {signedIn && account ? <Text style={styles.phone}>{account.phone}</Text> : null}
      </View>

      {signedIn ? (
        <View style={styles.card}>
          <Row icon="create-outline" label="Edit details" onPress={() => go("/account/edit")} />
          {bioAvailable ? (
            <Row icon="finger-print" label={`${biometricLabel()[0].toUpperCase()}${biometricLabel().slice(1)} sign-in: ${bioOn ? "On" : "Off"}`} onPress={() => void toggleBio()} />
          ) : null}
          <Row icon="log-out-outline" label={leaving ? "Signing out…" : "Sign out"} onPress={() => void signOut()} />
          <Row icon="trash-outline" label="Delete account" danger onPress={() => go("/account/delete")} />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create a free account</Text>
          <Text style={styles.cardBody}>
            You can use Bloom without one. An account lets you book screening appointments and keeps your details safe if you change phones.
          </Text>
          <PillButton tone="purple" label="Create account" onPress={() => go("/account/sign-up")} />
          <Pressable accessibilityRole="button" onPress={() => go("/account/sign-in")} hitSlop={10} style={styles.signIn}>
            <Text style={styles.signInText}>I already have an account</Text>
          </Pressable>
          {!config.hasBackend ? <Text style={styles.warn}>Not connected to the server yet (EXPO_PUBLIC_API_URL is not set).</Text> : null}
        </View>
      )}

      <View style={styles.card}>
        <Row icon="information-circle-outline" label="About Bloom" onPress={() => go("/about")} />
      </View>

      {/* DEV ONLY: wipes the saved profile and restarts at the splash. Hidden in production builds. */}
      {__DEV__ ? (
        <Pressable accessibilityRole="button" onPress={() => void reset().then(() => router.replace("/" as Href))} style={styles.dev}>
          <Text style={styles.devLabel}>Restart onboarding (dev only)</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, gap: 24 },
  who: { alignItems: "center", gap: 8, paddingTop: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.setupTrack, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.bold, fontSize: 36, color: colors.setupPurple },
  name: { fontFamily: fonts.semibold, fontSize: 22, color: colors.black },
  phone: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted },
  card: { borderRadius: 20, borderWidth: 1, borderColor: colors.trackBorder, padding: 16, gap: 14, backgroundColor: colors.white },
  cardTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.trackInk },
  cardBody: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.textBody },
  signIn: { alignItems: "center", paddingVertical: 4 },
  signInText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.purple },
  warn: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10 },
  rowLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.black },
  dev: { height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.primary500, alignItems: "center", justifyContent: "center" },
  devLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary500 },
});
