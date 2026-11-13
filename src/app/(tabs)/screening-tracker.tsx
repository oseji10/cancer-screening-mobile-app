import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PillButton } from "../../components/PillButton";
import { TrackHeader } from "../../components/track/TrackHeader";
import { colors, fonts } from "../../constants/theme";
import { useNotifications } from "../../lib/notifications/NotificationsContext";
import { useTrack } from "../../lib/track/TrackContext";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

/** Screening Tracker: history of logged mammograms. */
export default function ScreeningTracker() {
  const router = useRouter();
  const { mammograms, logMammogram, removeMammogram } = useTrack();
  const empty = mammograms.length === 0;
  const { prefs, setCycle } = useNotifications();
  const [note, setNote] = useState<string | null>(null);

  // A yearly nudge, counted from the latest mammogram (or from today when none is logged).
  const lastDate = mammograms.reduce<Date | null>((best, m) => {
    const d = new Date(m.date);
    return !best || d > best ? d : best;
  }, null);
  const toggleReminder = async () => {
    if (prefs.mammogram) {
      await setCycle("mammogram", false);
      setNote("Yearly reminder turned off.");
      return;
    }
    const how = await setCycle("mammogram", true, lastDate ?? new Date());
    setNote(how === "phone" ? "We'll remind you when your next mammogram is due." : "Saved in your notifications. Turn on phone notifications in Settings to get a pop-up too.");
  };
  const log = () => {
    logMammogram();
    if (prefs.mammogram) void setCycle("mammogram", true, new Date());
  };

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
        <Pressable accessibilityRole="switch" accessibilityState={{ checked: prefs.mammogram }} onPress={() => void toggleReminder()} style={styles.remindRow}>
          <Ionicons name={prefs.mammogram ? "notifications" : "notifications-outline"} size={20} color={colors.purple} />
          <Text style={styles.remindText}>{prefs.mammogram ? "Yearly mammogram reminder is on" : "Remind me when my next mammogram is due"}</Text>
        </Pressable>
        {note ? <Text style={styles.remindNote}>{note}</Text> : null}
        <PillButton label="Log a screening" onPress={log} />
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
  remindRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 40 },
  remindText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.purple },
  remindNote: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: "#5F5A7A", textAlign: "center" },
  bookLink: { height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: colors.purple, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  bookLinkText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.purple },
});
