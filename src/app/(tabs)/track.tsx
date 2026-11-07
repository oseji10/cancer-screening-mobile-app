import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PillButton } from "../../components/PillButton";
import { SegmentedControl } from "../../components/track/SegmentedControl";
import { colors, fonts } from "../../constants/theme";
import { useTrack } from "../../lib/track/TrackContext";

type Tab = "sbe" | "mammograms";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Track: self breast exams and mammograms at a glance. */
export default function Track() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sbeCountForYear, sbeMonthsForYear, mammograms } = useTrack();
  const [tab, setTab] = useState<Tab>("sbe");

  const year = new Date().getFullYear();
  const sbeCount = sbeCountForYear(year);
  const months = sbeMonthsForYear(year);
  const doneMammogram = mammograms.length > 0;
  const active = tab === "sbe" ? sbeCount > 0 : doneMammogram;

  const caption =
    tab === "sbe"
      ? `You have done ${sbeCount} SBE this year`
      : doneMammogram
        ? "You have done your mammogram"
        : "No mammogram logged yet";

  // Figma's gear is unlabeled; here it opens the section where entries are added.
  const openSettings = () => router.push((tab === "sbe" ? "/change-tracker" : "/screening-tracker") as Href);

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top, backgroundColor: colors.trackBand }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { id: "sbe", label: "Self Breast Exam" },
            { id: "mammograms", label: "Mammograms" },
          ]}
        />

        <View style={styles.ring}>
          <Ionicons name="finger-print" size={170} color={active ? colors.primary500 : colors.iconIdle} />
        </View>

        <View style={styles.captionRow}>
          <Text style={styles.caption}>{caption}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Open settings" onPress={openSettings} hitSlop={10}>
            <Ionicons name="settings-outline" size={30} color="#6B6B6B" />
          </Pressable>
        </View>

        {tab === "sbe" ? (
          <View style={styles.pears}>
            {months.map((done, i) => (
              <View key={MONTHS[i]} accessibilityLabel={`${MONTHS[i]}: ${done ? "done" : "not done"}`} style={styles.pear}>
                <MaterialCommunityIcons name="fruit-pear" size={34} color={done ? colors.primary500 : "#D5CEF8"} />
              </View>
            ))}
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={openSettings}
          style={styles.link}
        >
          <Ionicons name={tab === "sbe" ? "videocam-outline" : "calendar-outline"} size={20} color={colors.primary500} />
          <Text style={styles.linkText}>{tab === "sbe" ? "Open Change Tracker" : "Open Screening Tracker"}</Text>
        </Pressable>

        {tab === "mammograms" ? (
          <Pressable accessibilityRole="button" onPress={() => router.push("/find" as Href)} style={styles.link}>
            <Ionicons name="location-outline" size={20} color={colors.primary500} />
            <Text style={styles.linkText}>Book a screening</Text>
          </Pressable>
        ) : null}

        <View style={styles.button}>
          <PillButton label="See your Badges" onPress={() => router.push("/badges" as Href)} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 22, paddingTop: 23, paddingBottom: 16, gap: 24 },
  ring: {
    alignSelf: "center",
    width: 266,
    height: 266,
    borderRadius: 133,
    borderWidth: 10,
    borderColor: colors.trackBand,
    alignItems: "center",
    justifyContent: "center",
  },
  captionRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24 },
  caption: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 24, color: "#6B6B6B" },
  pears: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", columnGap: 10, rowGap: 14 },
  pear: { width: 46, alignItems: "center" },
  link: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 999, borderWidth: 1.5, borderColor: colors.primary500 },
  linkText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.primary500 },
  button: { marginTop: 8 },
});
