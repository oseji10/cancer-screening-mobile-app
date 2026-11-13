import { Ionicons } from "@expo/vector-icons";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookingCard } from "../../components/find/BookingCard";
import { CentreCard } from "../../components/find/CentreCard";
import MapCanvas from "../../components/find/MapCanvas";
import type { MapCentre } from "../../components/find/mapTypes";
import { PillButton } from "../../components/PillButton";
import { colors, fonts } from "../../constants/theme";
import { useAppointments } from "../../lib/appointments/AppointmentsContext";
import { formatSlot } from "../../lib/appointments/format";
import { distanceKm } from "../../lib/find/centres";
import { CentresMode, useCentres } from "../../lib/find/useCentres";
import { useUserLocation } from "../../lib/find/useUserLocation";

const OPEN_NOW = "Open now";

/** Shows the person's live booking(s): a one-line summary that opens into the full card with Reschedule / Cancel. */
function BookingBanner({ defaultOpen }: { defaultOpen: boolean }) {
  const { live } = useAppointments();
  const [open, setOpen] = useState(defaultOpen);
  const [idx, setIdx] = useState(0);
  if (live.length === 0) return null;
  const a = live[Math.min(idx, live.length - 1)];

  return open ? (
    <View style={{ gap: 6 }}>
      <BookingCard appointment={a} />
      <View style={styles.bannerRow}>
        {live.length > 1 ? (
          <Pressable accessibilityRole="button" onPress={() => setIdx((i) => (i + 1) % live.length)} hitSlop={8}>
            <Text style={styles.bannerLink}>Next booking ({Math.min(idx, live.length - 1) + 1}/{live.length})</Text>
          </Pressable>
        ) : <View />}
        <Pressable accessibilityRole="button" onPress={() => setOpen(false)} hitSlop={8}>
          <Text style={styles.bannerLink}>Hide</Text>
        </Pressable>
      </View>
    </View>
  ) : (
    <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={styles.booked}>
      <Ionicons name={a.status === "confirmed" ? "checkmark-circle" : "time-outline"} size={20} color={a.status === "confirmed" ? "#14803C" : "#9A6A00"} />
      <View style={{ flex: 1 }}>
        <Text style={styles.bookedTitle} numberOfLines={1}>
          {a.status === "confirmed" ? "Booked" : "Requested"}: {a.centre?.name ?? "Screening centre"}
        </Text>
        <Text style={styles.bookedSub} numberOfLines={1}>
          {formatSlot(a)}{live.length > 1 ? ` · +${live.length - 1} more` : ""}
        </Text>
      </View>
      <Text style={styles.bannerLink}>Details</Text>
    </Pressable>
  );
}

/** Find: location prompt, then a map of nearby screening centres with booking cards. */
export default function Find() {
  // Pick up any change the centre made while the person was elsewhere.
  const { refresh } = useAppointments();
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );
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
    <ScrollView style={styles.introScroll} contentContainerStyle={[styles.intro, { paddingTop: insets.top + 24 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.introBooking}>
        <BookingBanner defaultOpen />
      </View>
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
    </ScrollView>
  );
}

function MapScreen({ loc }: { loc: ReturnType<typeof useUserLocation> }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const listRef = useRef<FlatList>(null);
  const cardW = Math.round(width * 0.78);
  const user = loc.coords;
  const [mode, setMode] = useState<CentresMode>("nearest");
  const { centres, loading, error, expanded, sample, retry } = useCentres(user, mode);
  const { live } = useAppointments();

  // Filter chips come from what the loaded centres actually offer.
  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    centres.forEach((c) => c.services.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1)));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name);
    return [...top, OPEN_NOW];
  }, [centres]);

  // Distances follow the person in real time; nearest first once we know where they are.
  const shown: MapCentre[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withKm = centres.map((c) => ({ ...c, km: user ? distanceKm(user, { latitude: c.lat, longitude: c.lng }) : null }));
    const list = withKm.filter((c) => {
      if (q && !(c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) || c.services.some((s) => s.toLowerCase().includes(q)))) return false;
      return filters.every((f) => (f === OPEN_NOW ? c.open === true : c.services.includes(f)));
    });
    return user ? list.sort((a, b) => (a.km ?? 0) - (b.km ?? 0)) : list;
  }, [query, filters, user, centres]);

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
  const topInset = insets.top + 12 + 52 + 12 + 36 + (noLocation ? 44 : 0) + (live.length > 0 ? 64 : 0);

  return (
    <View style={styles.mapRoot}>
      <MapCanvas centres={shown} selectedId={selectedId} user={user} onSelect={(id) => select(id)} bottomInset={CARDS_HEIGHT + 24} topInset={topInset - 40} />

      <View style={[styles.top, { paddingTop: insets.top + 12 }]} pointerEvents="box-none">
        <View style={styles.search}>
          <Ionicons name="search-outline" size={22} color="#6B6890" />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search centre or screening" placeholderTextColor="#8E8BB0" style={styles.searchInput} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Pressable accessibilityRole="button" accessibilityState={{ selected: mode === "nearest" }} onPress={() => setMode("nearest")} style={[styles.chip, mode === "nearest" ? styles.chipArea : null]}>
            {mode === "nearest" ? <View style={styles.areaDot} /> : null}
            <Text style={[styles.chipText, mode === "nearest" && styles.chipAreaText]}>{user ? "Nearest" : "Near Abuja"}{sample ? " · sample" : ""}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityState={{ selected: mode === "all" }} onPress={() => setMode("all")} style={[styles.chip, mode === "all" ? styles.chipArea : null]}>
            {mode === "all" ? <View style={styles.areaDot} /> : null}
            <Text style={[styles.chipText, mode === "all" && styles.chipAreaText]}>All centres</Text>
          </Pressable>
          {chips.map((c) => (
            <Pressable key={c} accessibilityRole="button" accessibilityState={{ selected: filters.includes(c) }} onPress={() => toggle(c)} style={[styles.chip, filters.includes(c) && styles.chipOn]}>
              <Text style={[styles.chipText, filters.includes(c) && { color: colors.white }]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <BookingBanner defaultOpen={false} />
        {mode === "nearest" && expanded && !loading && centres.length > 0 ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>No centre is listed within 150 km. Showing the nearest ones. Tap All centres to see every centre.</Text>
          </View>
        ) : null}
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
          <View style={styles.empty}>
            {loading ? (
              <Text style={styles.emptyText}>Finding screening centres…</Text>
            ) : error ? (
              <>
                <Text style={styles.emptyText}>{error}</Text>
                <Pressable accessibilityRole="button" onPress={retry} style={styles.retry}>
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </>
            ) : centres.length === 0 ? (
              <Text style={styles.emptyText}>No screening centres are listed near here yet.</Text>
            ) : (
              <Text style={styles.emptyText}>No centres match. Try removing a filter.</Text>
            )}
          </View>
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
  introScroll: { flex: 1, backgroundColor: "#FBFAFF" },
  introBooking: { alignSelf: "stretch", marginBottom: 16 },
  intro: { flexGrow: 1, backgroundColor: "#FBFAFF", paddingHorizontal: 32, paddingBottom: 24, alignItems: "center" },
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
  booked: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.white, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, shadowColor: "#2B2060", shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  bookedTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.trackInk },
  bookedSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.purple },
  bannerRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 6 },
  bannerLink: { fontFamily: fonts.semibold, fontSize: 13, color: colors.purple },
  banner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.white, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bannerText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, color: colors.trackInk },
  empty: { marginHorizontal: 24, padding: 20, borderRadius: 22, backgroundColor: colors.white, gap: 12 },
  retry: { alignSelf: "center", height: 40, paddingHorizontal: 24, borderRadius: 20, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center" },
  retryText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
  emptyText: { fontFamily: fonts.medium, fontSize: 15, color: colors.trackSoft, textAlign: "center" },
});
