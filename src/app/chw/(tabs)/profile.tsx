import { Ionicons } from "@expo/vector-icons";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PushStatusCard } from "../../../components/PushStatusCard";
import { fonts } from "../../../constants/theme";
import { registerChwPush } from "../../../lib/notifications/push";
import { stageOf } from "../../../lib/chw/cases";
import { useChw } from "../../../lib/chw/ChwContext";
import { chw } from "../../../lib/chw/theme";
import { removeItem } from "../../../lib/storage/localStore";
import { biometricEnabled, biometricLabel, disableBiometric, useBiometricSupported } from "../../../lib/auth/biometric";

export default function ChwProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cases, resetSamples, live, user, signOut, request } = useChw();
  const [note, setNote] = useState<string | null>(null);
  const [bioOn, setBioOn] = useState(false);
  const bioSupported = useBiometricSupported();
  useFocusEffect(
    useCallback(() => {
      void biometricEnabled("chw").then(setBioOn);
    }, []),
  );
  const toggleBio = async () => {
    if (bioOn) {
      await disableBiometric("chw");
      setBioOn(false);
      setNote(`${biometricLabel()} sign-in turned off.`);
    } else router.push("/chw/biometric" as Href);
  };
  const closed = cases.filter((c) => stageOf(c) === "completed").length;

  const switchRole = async () => {
    if (live) await signOut();
    await removeItem("bloom_role_v1").catch(() => undefined);
    router.replace("/role" as Href);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 15 }]}>
      <Text style={styles.pageTitle}>Profile</Text>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={34} color={chw.teal} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user ? `${user.firstName} ${user.lastName}` : "Community Health Worker"}</Text>
          {user?.facilityName ? <Text style={styles.sub}>{user.facilityName}</Text> : null}
          <Text style={styles.sub}>{cases.length} cases · {closed} closed</Text>
        </View>
      </View>

      {live ? (
        <View style={styles.details}>
          {user?.email ? <Text style={styles.detail}>{user.email}</Text> : null}
          {user?.phone ? <Text style={styles.detail}>{user.phone}</Text> : null}
          <Text style={styles.detailMuted}>The same account works on the NCSR web app.</Text>
        </View>
      ) : (
        <>
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={20} color={chw.amber} />
            <Text style={styles.noticeText}>You are using sample cases because the app is not connected to NCSR yet.</Text>
          </View>
          <Row icon="refresh-outline" label="Reset sample cases" onPress={() => void resetSamples().then(() => setNote("Sample cases reset."))} />
        </>
      )}
      {live ? <PushStatusCard accent={chw.teal} register={() => registerChwPush(request)} /> : null}
      {live && bioSupported ? (
        <Row icon="finger-print" label={`${biometricLabel()[0].toUpperCase()}${biometricLabel().slice(1)} sign-in: ${bioOn ? "On" : "Off"}`} onPress={() => void toggleBio()} />
      ) : null}
      {live ? <Row icon="log-out-outline" label="Sign out" onPress={() => void signOut().then(() => router.replace("/chw/login" as Href))} /> : null}
      <Row icon="information-circle-outline" label="About Bloom" onPress={() => router.push({ pathname: "/about", params: { side: "chw" } } as unknown as Href)} />
      <Row icon="swap-horizontal-outline" label="Change how I use Bloom" onPress={() => void switchRole()} />
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </ScrollView>
  );
}

function Row({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
      <Ionicons name={icon} size={20} color={chw.teal} />
      <Text style={styles.rowText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#A5A2AE" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: chw.white },
  content: { paddingHorizontal: 16, paddingBottom: 28, gap: 12 },
  pageTitle: { fontFamily: fonts.bold, fontSize: 32, color: "#111111", letterSpacing: -0.7, marginBottom: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 6 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: chw.tealLight, alignItems: "center", justifyContent: "center" },
  name: { fontFamily: fonts.bold, fontSize: 18, color: chw.text },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: chw.muted, marginTop: 3 },
  details: { gap: 4, padding: 16, borderRadius: 16, backgroundColor: chw.card },
  detail: { fontFamily: fonts.medium, fontSize: 15, color: chw.text },
  detailMuted: { fontFamily: fonts.regular, fontSize: 13, color: chw.muted, marginTop: 4 },
  notice: { flexDirection: "row", gap: 10, backgroundColor: "#FFF6E8", borderRadius: 14, padding: 14 },
  noticeText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: "#6B5320" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingHorizontal: 16, borderRadius: 16, backgroundColor: chw.card },
  rowText: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: chw.text },
  note: { fontFamily: fonts.medium, fontSize: 13, color: chw.teal, textAlign: "center" },
});
