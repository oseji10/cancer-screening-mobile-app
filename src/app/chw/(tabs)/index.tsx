import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BiometricNudge } from "../../../components/auth/BiometricNudge";
import { FacilityCard } from "../../../components/chw/FacilityCard";
import { PostStrip } from "../../../components/posts/PostStrip";
import { NotificationBell } from "../../../components/chw/NotificationBell";
import { CaseRow } from "../../../components/chw/ui";
import { fonts } from "../../../constants/theme";
import { stageOf } from "../../../lib/chw/cases";
import { useChw } from "../../../lib/chw/ChwContext";
import { DirectoryFacility, getFacilityDirectory } from "../../../lib/chw/facilities";
import { chw } from "../../../lib/chw/theme";

export default function ChwDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cases, user, error, loading, live, loaded, refresh, request } = useChw();
  const [facilities, setFacilities] = useState<DirectoryFacility[] | null>(null);

  // Her facility first, then nearby ones (same LGA, then state).
  useEffect(() => {
    if (live && !user) return;
    let alive = true;
    getFacilityDirectory(live, request, { area: "state" })
      .then((rows) => alive && setFacilities(rows.slice(0, 3)))
      .catch(() => alive && setFacilities([]));
    return () => {
      alive = false;
    };
  }, [live, user, request]);

  const count = (pred: (s: ReturnType<typeof stageOf>) => boolean) => cases.filter((c) => pred(stageOf(c))).length;
  const metrics = [
    { label: "New cases", value: count((s) => s === "new") },
    { label: "Awaiting follow-up", value: count((s) => s === "community") },
    { label: "Screening in progress", value: count((s) => s === "screening") },
    { label: "Referral follow-up", value: count((s) => s === "referral") },
    { label: "Closed cases", value: count((s) => s === "completed" || s === "withdrawn"), tone: "closed" as const },
    { label: "All cases", value: cases.length, tone: "all" as const },
  ];
  // Open cases, oldest request first, so nobody waits too long.
  const assigned = cases
    .filter((c) => stageOf(c) !== "completed" && stageOf(c) !== "withdrawn")
    .sort((a, b) => a.initiated.localeCompare(b.initiated))
    .slice(0, 3);

  const openCase = (id: string) => router.push(`/chw/case/${id}` as Href);

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={live ? <RefreshControl refreshing={loading && loaded} onRefresh={() => void refresh()} tintColor={chw.teal} /> : undefined}
      showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: insets.top + 15 }]}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Your dashboard</Text>
        <View style={styles.headerRight}>
          <Image accessibilityLabel="Bloom" source={require("../../../../assets/brand/logo.png")} style={styles.logo} resizeMode="contain" />
          <NotificationBell />
        </View>
      </View>
      {user ? <Text style={styles.hello}>Hello, {user.firstName}{user.facilityName ? ` · ${user.facilityName}` : ""}</Text> : <View style={{ height: 17 }} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.banner}>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Support a woman today</Text>
          <Text style={styles.bannerDescription}>Respond to requests and help women take the next step in their breast health journey.</Text>
        </View>
        {/* PLACEHOLDER slot: replace assets/chw/dashboard-illustration.png with the final artwork. */}
        <Image source={require("../../../../assets/chw/dashboard-illustration.png")} style={styles.bannerIllustration} resizeMode="contain" />
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((m) => (
          <Pressable
            key={m.label}
            accessibilityRole="button"
            onPress={() => router.push("/chw/cases" as Href)}
            style={[styles.metricCard, "tone" in m && m.tone === "closed" && styles.metricClosed, "tone" in m && m.tone === "all" && styles.metricAll]}
          >
            <Text style={styles.metricLabel}>{m.label}</Text>
            <Text style={styles.metricValue}>{String(m.value).padStart(2, "0")}</Text>
          </Pressable>
        ))}
      </View>

      {live ? (
        <View style={{ marginBottom: 20 }}>
          <BiometricNudge scope="chw" accent={chw.teal} onEnable={() => router.push("/chw/biometric" as Href)} />
        </View>
      ) : null}

      <Pressable accessibilityRole="button" onPress={() => router.push("/chw/find-client" as Href)} style={({ pressed }) => [styles.findCard, pressed && { opacity: 0.85 }]}>
        <Ionicons name="search" size={20} color={chw.teal} />
        <View style={{ flex: 1 }}>
          <Text style={styles.findTitle}>Find a client</Text>
          <Text style={styles.findSub}>Search women at your facility and ask to attend to them</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#A5A2AE" />
      </Pressable>

      <PostStrip side="chw" accent={chw.teal} title="Updates from NICRAT" inset={16} style={{ marginBottom: 24 }} request={live ? request : undefined} onOpen={(id) => router.push(`/chw/post/${id}` as Href)} onViewAll={() => router.push("/chw/posts" as Href)} />

      <View style={styles.casesHeader}>
        <Text style={styles.sectionTitle}>Assigned cases</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push("/chw/cases" as Href)} hitSlop={10}>
          <Text style={styles.viewAll}>View all</Text>
        </Pressable>
      </View>

      <View style={{ gap: 9 }}>
        {live && !loaded && loading ? (
          <Text style={styles.empty}>Loading your cases…</Text>
        ) : assigned.length === 0 ? (
          <Text style={styles.empty}>No open cases. New requests from women in your area will appear here.</Text>
        ) : (
          assigned.map((c) => <CaseRow key={c.id} item={c} onPress={() => openCase(c.id)} />)
        )}
      </View>

      <View style={[styles.casesHeader, { marginTop: 26 }]}>
        <Text style={styles.sectionTitle}>Facilities</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="View all facilities" onPress={() => router.push("/chw/facilities" as Href)} hitSlop={10}>
          <Text style={styles.viewAll}>View all</Text>
        </Pressable>
      </View>
      <View style={{ gap: 9 }}>
        {facilities === null ? (
          <Text style={styles.empty}>Loading facilities…</Text>
        ) : facilities.length === 0 ? (
          <Text style={styles.empty}>No facility contacts to show yet.</Text>
        ) : (
          facilities.map((f) => <FacilityCard key={f.id} item={f} compact />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: chw.white },
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 76, height: 40 },
  pageTitle: { flexShrink: 1, fontFamily: fonts.bold, fontSize: 28, color: "#111111", letterSpacing: -0.7 },
  hello: { fontFamily: fonts.regular, fontSize: 15, color: chw.muted, marginBottom: 18 },
  error: { fontFamily: fonts.medium, fontSize: 14, color: "#C23B3B", marginBottom: 12 },
  banner: { minHeight: 220, backgroundColor: chw.teal, borderRadius: 16, flexDirection: "row", alignItems: "center", paddingLeft: 16, paddingRight: 3, marginBottom: 10, overflow: "hidden" },
  bannerText: { flex: 1, paddingVertical: 16 },
  bannerTitle: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, color: chw.white, marginBottom: 7 },
  bannerDescription: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: "#E9FFFC", maxWidth: 200 },
  bannerIllustration: { width: 125, height: 125, alignSelf: "flex-end" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10, marginBottom: 23 },
  metricCard: { width: "49%", minHeight: 112, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 14, justifyContent: "space-between", backgroundColor: chw.tealLight },
  metricClosed: { backgroundColor: "#ECEBF0" },
  metricAll: { backgroundColor: "#E8F1EF" },
  metricLabel: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: "#202020", maxWidth: 135 },
  metricValue: { fontFamily: fonts.bold, fontSize: 29, lineHeight: 34, color: "#111111", marginTop: 9 },
  findCard: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: chw.border, borderRadius: 16, padding: 14, marginBottom: 22 },
  findTitle: { fontFamily: fonts.bold, fontSize: 15, color: chw.text },
  findSub: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: chw.muted, marginTop: 2 },
  casesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: chw.ink },
  viewAll: { fontFamily: fonts.semibold, fontSize: 13, color: chw.teal },
  empty: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: chw.muted },
});
