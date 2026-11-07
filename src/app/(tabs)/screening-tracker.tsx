import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PillButton } from "../../components/PillButton";
import { TrackHeader } from "../../components/track/TrackHeader";
import { colors, fonts } from "../../constants/theme";
import { useTrack } from "../../lib/track/TrackContext";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

/** Screening Tracker: history of logged mammograms. */
export default function ScreeningTracker() {
  const router = useRouter();
  const { mammograms, logMammogram, removeMammogram } = useTrack();
  const empty = mammograms.length === 0;

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TrackHeader
          title="Screening Tracker"
          onBack={() => router.replace("/track" as Href)}
          info="Keep a record of your mammograms here. Tap Log a screening to add one dated today."
        />
      </View>

      <ScrollView contentContainerStyle={[styles.content, empty && styles.contentEmpty]} showsVerticalScrollIndicator={false}>
        {empty ? (
          <View style={styles.empty}>
            <Ionicons name="calendar" size={150} color="#C8C8C8" />
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptySub}>Hit the purple button down below to add a screening</Text>
          </View>
        ) : (
          mammograms.map((entry) => (
            <View key={entry.id} style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="calendar-outline" size={22} color={colors.purple} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Mammogram</Text>
                <Text style={styles.rowDate}>{formatDate(entry.date)}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Remove entry" onPress={() => removeMammogram(entry.id)} hitSlop={10}>
                <Ionicons name="trash-outline" size={22} color={colors.trackSoft} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={() => router.push("/find" as Href)} style={styles.bookLink}>
          <Ionicons name="location-outline" size={20} color={colors.purple} />
          <Text style={styles.bookLinkText}>Book a screening near you</Text>
        </Pressable>
        <PillButton label="Log a screening" onPress={logMammogram} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: 16, paddingTop: 24 },
  content: { paddingHorizontal: 16, paddingTop: 24, gap: 12 },
  contentEmpty: { flexGrow: 1, justifyContent: "center" },
  empty: { alignItems: "center", gap: 14, paddingHorizontal: 24 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 38, color: colors.black, marginTop: 24 },
  emptySub: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 22, color: "#757575", textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.trackBorder, backgroundColor: colors.white },
  rowIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.trackBand, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.trackInk },
  rowDate: { fontFamily: fonts.regular, fontSize: 14, color: "#757575" },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 10 },
  bookLink: { height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: colors.purple, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  bookLinkText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.purple },
});
