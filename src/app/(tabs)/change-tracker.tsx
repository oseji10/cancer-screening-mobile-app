import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VideoModal } from "../../components/VideoModal";
import { PillButton } from "../../components/PillButton";
import { TrackHeader } from "../../components/track/TrackHeader";
import { colors, fonts } from "../../constants/theme";
import { useNotifications } from "../../lib/notifications/NotificationsContext";
import { useTrack } from "../../lib/track/TrackContext";

/** Change Tracker: the monthly self-breast-exam guide, with a way to log it. */
export default function ChangeTracker() {
  const router = useRouter();
  const { logSbe, doneSbeThisMonth } = useTrack();
  const { setCycle, prefs } = useNotifications();
  const [reminderNote, setReminderNote] = useState<string | null>(null);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/home" as Href));

  const done = () => {
    if (!doneSbeThisMonth) logSbe();
    // Keep the monthly reminders going from today, if they are on.
    if (prefs.sbe) void setCycle("sbe", true);
    router.replace("/track" as Href);
  };

  const later = async () => {
    const how = await setCycle("sbe", true);
    setReminderNote(
      how === "phone"
        ? "Done. We'll remind you every month."
        : "Reminders are saved in your notifications. Turn on phone notifications in Settings to get pop-ups too.",
    );
    setTimeout(() => router.replace("/home" as Href), 2200);
  };

  const [videoOpen, setVideoOpen] = useState(false);
  const playVideo = () => setVideoOpen(true);

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TrackHeader
          title="Change Tracker"
          onBack={goBack}
          info="Check your breasts once a month and log it here. Noticing what is normal for you helps you spot changes early."
        />

        {/* Video card: Figma shows a pink/lilac thumbnail with play button, "4 min" and "CC" chips. */}
        <Pressable accessibilityRole="button" accessibilityLabel="Play video" onPress={playVideo} style={styles.video}>
          <View style={styles.blobA} />
          <View style={styles.blobB} />
          <View style={styles.playBig}>
            <Ionicons name="play" size={26} color={colors.purple} />
          </View>
          <View style={[styles.chip, { left: 16 }]}>
            <Text style={styles.chipText}>4 min</Text>
          </View>
          <View style={[styles.chip, { right: 16 }]}>
            <Text style={styles.chipText}>CC</Text>
          </View>
        </Pressable>

        <View style={styles.copy}>
          <Text style={styles.title}>Get to know what's normal for you</Text>
          <Text style={styles.body}>
            There's no single right way. What matters is checking regularly enough to notice when something changes.
          </Text>
        </View>

        {/* Audio guide: no audio file yet, so this is display only. */}
        <View style={styles.audio}>
          <View style={styles.playSmall}>
            <Ionicons name="play" size={22} color={colors.white} />
          </View>
          <View style={styles.audioText}>
            <Text style={styles.audioTitle}>Listen to the steps</Text>
            <Text style={styles.audioMeta}>3 min ·</Text>
          </View>
          <View style={styles.speed}>
            <Text style={styles.speedText}>1×</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <PillButton label={doneSbeThisMonth ? "Logged this month. See my tracker" : "I have done my SBE this month"} onPress={done} />
          {reminderNote ? (
            <Text style={styles.reminderNote}>{reminderNote}</Text>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => void later()} hitSlop={10}>
              <Text style={styles.later}>{prefs.sbe ? "Monthly reminder is on" : "Remind me next month"}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
      <VideoModal visible={videoOpen} source={require("../../../assets/videos/sbe-whats-normal.mp4")} onClose={() => setVideoOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.trackBg },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16, gap: 24 },
  video: { height: 192, borderRadius: 20, overflow: "hidden", backgroundColor: "#F1D3E4", alignItems: "center", justifyContent: "center" },
  blobA: { position: "absolute", left: -30, bottom: -60, width: 150, height: 150, borderRadius: 75, backgroundColor: "#C9B3E4" },
  blobB: { position: "absolute", right: -40, top: -30, width: 210, height: 210, borderRadius: 105, backgroundColor: "#F8E2EA" },
  playBig: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FFF5F6", alignItems: "center", justifyContent: "center" },
  chip: { position: "absolute", bottom: 16, borderRadius: 12, backgroundColor: "rgba(60,40,80,0.55)", paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
  copy: { gap: 14 },
  title: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 38, color: colors.trackInk },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24, color: "#5F5A7A" },
  audio: { flexDirection: "row", alignItems: "center", gap: 16, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: colors.trackBorder, backgroundColor: colors.white },
  playSmall: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center" },
  audioText: { flex: 1, gap: 2 },
  audioTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.trackInk },
  audioMeta: { fontFamily: fonts.regular, fontSize: 14, color: "#8A859F" },
  speed: { borderRadius: 18, backgroundColor: "#F3EFFF", paddingHorizontal: 14, paddingVertical: 8 },
  speedText: { fontFamily: fonts.bold, fontSize: 14, color: colors.purple },
  actions: { gap: 20, alignItems: "center", paddingTop: 4 },
  reminderNote: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.trackSoft, textAlign: "center", paddingHorizontal: 12 },
  later: { fontFamily: fonts.semibold, fontSize: 17, color: colors.trackSoft },
});
