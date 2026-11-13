import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { FacilityCard } from "../../components/chw/FacilityCard";
import { ChwScreen, ErrorText } from "../../components/chw/ui";
import { fonts } from "../../constants/theme";
import { DirectoryFacility, DirectoryQuery, getFacilityDirectory } from "../../lib/chw/facilities";
import { useChw } from "../../lib/chw/ChwContext";
import { chw } from "../../lib/chw/theme";

const AREAS: { key: NonNullable<DirectoryQuery["area"]>; label: string }[] = [
  { key: "state", label: "My state" },
  { key: "all", label: "All states" },
];
const TYPES: { key: DirectoryQuery["type"] | "any"; label: string }[] = [
  { key: "any", label: "All types" },
  { key: "screening", label: "Screening" },
  { key: "treatment", label: "Treatment" },
];

/** Every active facility with phone, WhatsApp, email, focal person and directions. */
export default function FacilitiesScreen() {
  const router = useRouter();
  const { live, request } = useChw();
  const [q, setQ] = useState("");
  const [area, setArea] = useState<NonNullable<DirectoryQuery["area"]>>("state");
  const [type, setType] = useState<DirectoryQuery["type"] | "any">("any");
  const [rows, setRows] = useState<DirectoryFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    const mine = ++seq.current;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await getFacilityDirectory(live, request, { search: q, area, type: type === "any" ? undefined : type });
        if (mine !== seq.current) return;
        setRows(data);
        setError(null);
      } catch (e) {
        if (mine === seq.current) setError(e instanceof Error ? e.message : "Could not load facilities.");
      } finally {
        if (mine === seq.current) setLoading(false);
      }
    }, q ? 350 : 0);
    return () => clearTimeout(t);
  }, [q, area, type, live, request]);

  const chip = (on: boolean, label: string, onPress: () => void) => (
    <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onPress} style={[s.chip, on && s.chipOn]}>
      <Text style={[s.chipText, on && s.chipTextOn]}>{label}</Text>
    </Pressable>
  );

  return (
    <ChwScreen title="Facilities" onBack={() => router.back()}>
      <View style={s.search}>
        <Ionicons name="search" size={18} color={chw.faint} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Facility, LGA or state"
          placeholderTextColor="#A7A2B3"
          autoCorrect={false}
          accessibilityLabel="Search facilities"
          style={s.searchInput}
        />
        {loading ? <ActivityIndicator size="small" color={chw.teal} /> : q ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8} onPress={() => setQ("")}>
            <Ionicons name="close-circle" size={18} color={chw.faint} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
        {live && !q ? AREAS.map((a) => chip(area === a.key, a.label, () => setArea(a.key))) : null}
        {TYPES.map((t) => chip(type === t.key, t.label, () => setType(t.key)))}
      </ScrollView>

      {error ? <ErrorText>{error}</ErrorText> : null}
      {!loading && !error ? <Text style={s.count}>{rows.length === 300 ? "Showing the first 300. Search to narrow down." : `${rows.length} ${rows.length === 1 ? "facility" : "facilities"}`}</Text> : null}

      <View style={{ gap: 10 }}>
        {!loading && rows.length === 0 && !error ? <Text style={s.empty}>No facility matches.</Text> : null}
        {rows.map((f) => (
          <FacilityCard key={f.id} item={f} />
        ))}
      </View>
    </ChwScreen>
  );
}

const s = StyleSheet.create({
  search: { flexDirection: "row", alignItems: "center", gap: 8, height: 50, borderRadius: 25, backgroundColor: chw.card, paddingHorizontal: 16, marginTop: 4 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: chw.text },
  chips: { gap: 8, paddingVertical: 14 },
  chip: { height: 34, borderRadius: 17, paddingHorizontal: 14, borderWidth: 1, borderColor: chw.border, justifyContent: "center", backgroundColor: chw.white },
  chipOn: { backgroundColor: chw.teal, borderColor: chw.teal },
  chipText: { fontFamily: fonts.semibold, fontSize: 13, color: chw.muted },
  chipTextOn: { color: chw.white },
  count: { fontFamily: fonts.medium, fontSize: 13, color: chw.faint, marginBottom: 10 },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: chw.muted, textAlign: "center", marginTop: 24 },
});
