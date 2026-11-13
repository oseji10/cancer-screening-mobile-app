import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../components/Screen";
import { ScreenHeader } from "../components/ScreenHeader";
import { colors, fonts } from "../constants/theme";
import { NotifItem, NotifKind, useNotifications } from "../lib/notifications/NotificationsContext";

const ICON: Record<NotifKind, keyof typeof Ionicons.glyphMap> = {
  news: "newspaper-outline",
  appointment: "calendar-outline",
  booking: "checkmark-circle-outline",
  sbe: "heart-outline",
  mammogram: "medkit-outline",
  change: "eye-outline",
};

function ago(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** The bell on Home opens this: what happened, plus switches for the recurring reminders. */
export default function Notifications() {
  const router = useRouter();
  const { items, markAllRead, unread, prefs, setCycle, lastPermission } = useNotifications();
  const [note, setNote] = useState<string | null>(null);

  // Remember which ones were new when the screen opened, then mark them read.
  const newSince = useRef(unread);
  const firstUnread = useRef<Set<string> | null>(null);
  if (firstUnread.current === null) {
    firstUnread.current = new Set(items.slice(0, newSince.current).map((i) => i.key));
  }
  useEffect(() => {
    const t = setTimeout(markAllRead, 600);
    return () => clearTimeout(t);
  }, [markAllRead]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/home" as Href));
  const open = (i: NotifItem) => i.href && router.push(i.href as Href);

  const toggle = async (kind: "sbe" | "mammogram") => {
    const turningOn = !prefs[kind];
    const how = await setCycle(kind, turningOn);
    if (!turningOn) setNote("Reminder turned off.");
    else setNote(how === "phone" ? "Reminder on." : "Reminder on. Allow notifications for Bloom in your phone's Settings to get pop-ups.");
  };

  return (
    <Screen contentStyle={styles.content}>
      <ScreenHeader title="Notifications" onBack={goBack} />

      <Text style={styles.h}>Reminders</Text>
      <View style={styles.card}>
        <Switch label="Monthly breast self-check" sub="A nudge on the same day each month" on={prefs.sbe} onPress={() => void toggle("sbe")} />
        <View style={styles.sep} />
        <Switch label="Yearly mammogram" sub="A year after your last one" on={prefs.mammogram} onPress={() => void toggle("mammogram")} />
      </View>
      {note ? <Text style={styles.note}>{note}</Text> : null}
      {lastPermission === "denied" ? (
        <Text style={styles.warn}>Phone notifications are blocked for Bloom. You'll still see reminders here. Turn them on in your phone's Settings to get pop-ups.</Text>
      ) : null}

      <Text style={[styles.h, { marginTop: 8 }]}>Recent</Text>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={56} color="#C8C8D4" />
          <Text style={styles.emptyTitle}>Nothing yet</Text>
          <Text style={styles.emptySub}>Booking updates and reminders will show up here.</Text>
        </View>
      ) : (
        items.map((i) => (
          <Pressable key={i.key} accessibilityRole="button" onPress={() => open(i)} style={styles.item}>
            <View style={styles.icon}>
              <Ionicons name={ICON[i.kind]} size={22} color={colors.purple} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.itemTitle}>{i.title}</Text>
              <Text style={styles.itemBody}>{i.body}</Text>
              <Text style={styles.itemTime}>{ago(i.at)}</Text>
            </View>
            {firstUnread.current?.has(i.key) ? <View style={styles.dot} /> : null}
          </Pressable>
        ))
      )}
    </Screen>
  );
}

function Switch({ label, sub, on, onPress }: { label: string; sub: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} onPress={onPress} style={styles.switchRow}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.itemTitle}>{label}</Text>
        <Text style={styles.itemBody}>{sub}</Text>
      </View>
      <View style={[styles.track, on && styles.trackOn]}>
        <View style={[styles.knob, on && styles.knobOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 12 },
  h: { fontFamily: fonts.bold, fontSize: 18, color: colors.trackInk, marginTop: 8 },
  card: { borderRadius: 18, borderWidth: 1, borderColor: colors.trackBorder, backgroundColor: colors.white },
  sep: { height: 1, backgroundColor: colors.trackBorder },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  track: { width: 48, height: 28, borderRadius: 14, backgroundColor: "#D9D6E8", justifyContent: "center", paddingHorizontal: 3 },
  trackOn: { backgroundColor: colors.purple },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white },
  knobOn: { alignSelf: "flex-end" },
  note: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: "#5F5A7A" },
  warn: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: "#B0482F" },
  item: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.trackBorder, backgroundColor: colors.white, alignItems: "flex-start" },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.trackBand, alignItems: "center", justifyContent: "center" },
  itemTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.trackInk },
  itemBody: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: "#5F5A7A" },
  itemTime: { fontFamily: fonts.regular, fontSize: 12, color: "#8B87A8", marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.badge, marginTop: 6 },
  empty: { alignItems: "center", gap: 8, paddingVertical: 36 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 20, color: colors.trackInk },
  emptySub: { fontFamily: fonts.regular, fontSize: 15, color: "#757575", textAlign: "center" },
});
