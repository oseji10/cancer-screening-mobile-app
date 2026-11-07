import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CentreCard } from "../../components/find/CentreCard";
import MapCanvas from "../../components/find/MapCanvas";
import type { MapCentre } from "../../components/find/mapTypes";
import { PillButton } from "../../components/PillButton";
import { colors, fonts } from "../../constants/theme";
import { CENTRES, distanceKm } from "../../lib/find/centres";
import { useUserLocation } from "../../lib/find/useUserLocation";

const CHIPS = ["Mammogram", "Ultrasound", "Clinical exam", "NHIS accepted", "Open now"];

/** Find: location prompt, then a map of nearby screening centres with booking cards. */
export default function Find() {
  const [stage, setStage] = useState<"intro" | "map">("intro");
  const loc = useUserLocation();
  return stage === "intro" ? (
    <Intro
      onLocation={() => {
        void loc.start();
        setStage("map");
      }}
      onArea={() => setStage("map")}
    />
  ) : (
    <MapScreen loc={loc} />
  );
}

const CARDS_HEIGHT = 330;

function Intro({ onLocation, onArea }: { onLocation: () => void; onArea: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.intro, { paddingTop: insets.top + 24 }]}>
      <View style={styles.mapArt}>
        {/* PLACEHOLDER: replace map.png with the Figma map picture. */}
        <Image source={require("../../../assets/find/map.png")} style={styles.fill} resizeMode="cover" />
        <View style={styles.radius} />
        <View style={[styles.dotWhite, { left: "14%", top: "17%" }]} />
        <View style={[styles.dotWhite, { right: "10%", top: "22%" }]} />
        <View style={[styles.dotWhite, { right: "26%", bottom: "14%" }]} />
        <View style={styles.pin}>
          <View style={styles.pinHole} />
        </View>
      </View>
      <Text style={styles.title}>Find screening centres near you</Text>
      <Text style={styles.sub}>Share your location and we'll show centres closest to you, with prices and next free slots.</Text>
      <View style={styles.actions}>
        <PillButton label="Use my location" onPress={onLocation} />
        <Pressable accessibilityRole="button" onPress={onArea} style={styles.outline}>
          <Text style={styles.outlineText}>Enter my area instead</Text>
        </Pressable>
      </View>
      <View style={styles.lockRow}>
        <Ionicons name="lock-closed" size={20} color="#A89BF2" />
        <Text style={styles.lockText}>Your information is private and secure</Text>
      </View>
    </View>
  );
}

function MapScreen({ loc }: { loc: ReturnType<typeof useUserLocation> }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState(CENTRES[0].id);
  const listRef = useRef<FlatList>(null);
  const cardW = Math.round(width * 0.78);
  const user = loc.coords;

  // Distances follow the person in real time; nearest first once we know where they are.
  const shown: MapCentre[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withKm = CENTRES.map((c) => ({ ...c, km: user ? distanceKm(user, { latitude: c.lat, longitude: c.lng }) : null }));
    const list = withKm.filter((c) => {
      if (q && !(c.name.toLowerCase().includes(q) || c.services.some((s) => s.toLowerCase().includes(q)))) return false;
      return filters.every((f) => (f === "NHIS accepted" ? c.nhis : f === "Open now" ? c.open : c.services.includes(f)));
    });
    return user ? list.sort((a, b) => (a.km ?? 0) - (b.km ?? 0)) : list;
  }, [query, filters, user]);

  // Keep the selected card valid when the list changes.
  useEffect(() => {
    if (shown.length > 0 && !shown.some((c) => c.id === selectedId)) setSelectedId(shown[0].id);
  }, [shown, selectedId]);

  const select = (id: string, scroll = true) => {
    setSelectedId(id);
    const i = shown.findIndex((c) => c.id === id);
    if (scroll && i >= 0) listRef.current?.scrollToOffset({ offset: i * (cardW + 14), animated: true });
  };
  const toggle = (f: string) => setFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  const book = (id: string) => router.push({ pathname: "/book-appointment", params: { id } } as unknown as Href);
  const noLocation = loc.status === "denied" || loc.status === "error";
  const topInset = insets.top + 12 + 52 + 12 + 36 + (noLocation ? 44 : 0);

  return (
    <View style={styles.mapRoot}>
      <MapCanvas centres={shown} selectedId={selectedId} user={user} onSelect={(id) => select(id)} bottomInset={CARDS_HEIGHT + 24} topInset={topInset - 40} />

      <View style={[styles.top, { paddingTop: insets.top + 12 }]} pointerEvents="box-none">
        <View style={styles.search}>
          <Ionicons name="search-outline" size={22} color="#6B6890" />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search centre or screening" placeholderTextColor="#8E8BB0" style={styles.searchInput} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <View style={[styles.chip, styles.chipArea]}>
            <View style={styles.areaDot} />
            <Text style={styles.chipAreaText}>{user ? "Near you" : "Abuja"}</Text>
          </View>
          {CHIPS.map((c) => (
            <Pressable key={c} accessibilityRole="button" accessibilityState={{ selected: filters.includes(c) }} onPress={() => toggle(c)} style={[styles.chip, filters.includes(c) && styles.chipOn]}>
              <Text style={[styles.chipText, filters.includes(c) && { color: colors.white }]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
        {noLocation ? (
          <Pressable accessibilityRole="button" onPress={() => void loc.start()} style={styles.banner}>
            <Ionicons name="location-outline" size={18} color={colors.purple} />
            <Text style={styles.bannerText}>Location is off. Showing centres in Abuja. Tap to turn it on.</Text>
          </Pressable>
        ) : loc.status === "asking" ? (
          <View style={styles.banner}><Text style={styles.bannerText}>Finding your location…</Text></View>
        ) : null}
      </View>

      <View style={[styles.cards, { height: CARDS_HEIGHT }]}>
        {shown.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyText}>No centres match. Try removing a filter.</Text></View>
        ) : (
          <FlatList
            ref={listRef}
            data={shown}
            horizontal
            keyExtractor={(c) => c.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardW + 14}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 24, gap: 14, paddingVertical: 6 }}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / (cardW + 14));
              if (shown[i]) setSelectedId(shown[i].id);
            }}
            renderItem={({ item }) => (
              <CentreCard centre={item} width={cardW} selected={item.id === selectedId} onSelect={() => select(item.id, false)} onBook={() => book(item.id)} />
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", left: 0, top: 0, width: "100%", height: "100%" },
  // Intro
  intro: { flex: 1, backgroundColor: "#FBFAFF", paddingHorizontal: 32, alignItems: "center" },
  mapArt: { width: "100%", height: 280, borderRadius: 32, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  radius: { width: 190, height: 190, borderRadius: 95, borderWidth: 2, borderStyle: "dashed", borderColor: "#B9ADEF" },
  dotWhite: { position: "absolute", width: 30, height: 30, borderRadius: 15, backgroundColor: colors.white, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  pin: { position: "absolute", width: 58, height: 58, borderRadius: 29, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center", shadowColor: colors.purple, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6 },
  pinHole: { width: 22, height: 22, borderRadius: 11, borderWidth: 5, borderColor: colors.white },
  title: { fontFamily: fonts.extraBold, fontSize: 32, lineHeight: 36, textAlign: "center", color: colors.trackInk, marginTop: 44, letterSpacing: -0.5 },
  sub: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24, textAlign: "center", color: "#5F5A7A", marginTop: 20 },
  actions: { alignSelf: "stretch", gap: 10, marginTop: 26 },
  outline: { height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.trackBorder, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  outlineText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.trackSoft },
  lockRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 28 },
  lockText: { fontFamily: fonts.regular, fontSize: 14, color: "#4A4A55" },
  // Map
  mapRoot: { flex: 1, backgroundColor: "#E8E9EC" },
  top: { paddingHorizontal: 24, gap: 12, zIndex: 3 },
  search: { height: 52, borderRadius: 26, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, shadowColor: "#2B2060", shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 17, color: colors.trackInk, paddingVertical: 0 },
  chips: { gap: 10, paddingRight: 24 },
  chip: { height: 36, borderRadius: 18, backgroundColor: colors.white, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  chipArea: { backgroundColor: colors.purple },
  areaDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white },
  chipAreaText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.white },
  chipOn: { backgroundColor: colors.purple },
  chipText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.trackInk },
  cards: { position: "absolute", left: 0, right: 0, bottom: 8 },
  banner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.white, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bannerText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, color: colors.trackInk },
  empty: { marginHorizontal: 24, padding: 20, borderRadius: 22, backgroundColor: colors.white },
  emptyText: { fontFamily: fonts.medium, fontSize: 15, color: colors.trackSoft, textAlign: "center" },
});
