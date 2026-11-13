import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CaseRow } from "../../../components/chw/ui";
import { fonts } from "../../../constants/theme";
import { Stage, stageOf } from "../../../lib/chw/cases";
import { useChw } from "../../../lib/chw/ChwContext";
import { chw } from "../../../lib/chw/theme";

const FILTERS: { key: "all" | Stage; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "community", label: "Follow-up" },
  { key: "screening", label: "Screening" },
  { key: "referral", label: "Referral" },
  { key: "completed", label: "Closed" },
  { key: "withdrawn", label: "Cancelled" },
];

export default function ChwCases() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cases, live, loading, refresh } = useChw();
  const [filter, setFilter] = useState<"all" | Stage>("all");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return cases
      .filter((c) => filter === "all" || stageOf(c) === filter)
      .filter((c) => !term || c.id.toLowerCase().includes(term) || c.community.toLowerCase().includes(term) || (c.clientName ?? "").toLowerCase().includes(term) || (c.ncsrClientId ?? "").toLowerCase().includes(term))
      .sort((a, b) => b.initiated.localeCompare(a.initiated));
  }, [cases, filter, q]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 15 }]}>
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>My cases</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Find a client" onPress={() => router.push("/chw/find-client" as Href)} style={styles.findBtn}>
          <Ionicons name="person-add-outline" size={16} color={chw.white} />
          <Text style={styles.findText}>Find a client</Text>
        </Pressable>
      </View>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={chw.faint} />
        <TextInput value={q} onChangeText={setQ} placeholder="Search name, case code or community" placeholderTextColor="#A7A2B3" style={styles.searchInput} />
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f) => {
            const on = filter === f.key;
            const n = f.key === "all" ? cases.length : cases.filter((c) => stageOf(c) === f.key).length;
            return (
              <Pressable key={f.key} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setFilter(f.key)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{f.label} ({n})</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={live ? <RefreshControl refreshing={loading} onRefresh={() => void refresh()} tintColor={chw.teal} /> : undefined}
        contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {shown.length === 0 ? (
          <Text style={styles.empty}>No cases match.</Text>
        ) : (
          shown.map((c) => <CaseRow key={c.id} item={c} onPress={() => router.push(`/chw/case/${c.id}` as Href)} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: chw.white },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 16 },
  pageTitle: { fontFamily: fonts.bold, fontSize: 32, color: "#111111", letterSpacing: -0.7 },
  findBtn: { flexDirection: "row", alignItems: "center", gap: 6, height: 38, borderRadius: 19, paddingHorizontal: 14, backgroundColor: chw.teal },
  findText: { fontFamily: fonts.semibold, fontSize: 13, color: chw.white },
  search: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, height: 48, borderRadius: 24, backgroundColor: chw.card, paddingHorizontal: 16 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: chw.text },
  chips: { gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  chip: { height: 36, borderRadius: 18, paddingHorizontal: 14, borderWidth: 1, borderColor: chw.border, justifyContent: "center", backgroundColor: chw.white },
  chipOn: { backgroundColor: chw.teal, borderColor: chw.teal },
  chipText: { fontFamily: fonts.semibold, fontSize: 13, color: chw.muted },
  chipTextOn: { color: chw.white },
  list: { gap: 9, paddingHorizontal: 16, paddingBottom: 24 },
  empty: { fontFamily: fonts.regular, fontSize: 15, color: chw.muted, textAlign: "center", marginTop: 32 },
});
