import { Ionicons } from "@expo/vector-icons";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "../../constants/theme";
import { StaffNotification, timeAgo } from "../../lib/chw/access";
import { useChw } from "../../lib/chw/ChwContext";
import { chw } from "../../lib/chw/theme";

const ICON: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  case_assigned: { name: "person-add-outline", color: chw.teal, bg: chw.tealSoft },
  case_reassigned: { name: "swap-horizontal-outline", color: chw.amber, bg: "#FBF3E6" },
  access_approved: { name: "checkmark-circle-outline", color: chw.teal, bg: chw.tealSoft },
  access_rejected: { name: "close-circle-outline", color: chw.danger, bg: chw.dangerLight },
  booking: { name: "calendar-outline", color: chw.purple, bg: "#F0EEFE" },
};

/** Everything that happened to the health worker's cases and requests, newest first. */
export default function ChwNotifications() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notifications, refreshNotifications, markAllRead, cases, refresh } = useChw();
  const [busy, setBusy] = useState(false);
  // What was unread when the screen opened stays highlighted while she reads.
  const [fresh, setFresh] = useState<Set<number>>(new Set());

  // Check for new items whenever the screen is opened.
  useFocusEffect(
    useCallback(() => {
      void refreshNotifications();
    }, [refreshNotifications]),
  );

  // Mark as read once they are on screen (they stay highlighted until she leaves).
  useEffect(() => {
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    if (!ids.length) return;
    setFresh((prev) => new Set([...prev, ...ids]));
    void markAllRead();
  }, [notifications, markAllRead]);

  const open = async (n: StaffNotification) => {
    if (!n.caseId) return;
    // Case codes are BLM- plus the padded id; load the list first if this case is new to the phone.
    if (!cases.some((x) => x.serverId === n.caseId)) await refresh();
    router.push(`/chw/case/BLM-${String(n.caseId).padStart(5, "0")}` as Href);
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={s.back} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={chw.teal} />
        </Pressable>
        <Text style={s.topBarTitle}>Notifications</Text>
        <View style={s.back} />
      </View>
      <ScrollView
        contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={busy} tintColor={chw.teal} onRefresh={async () => { setBusy(true); await refreshNotifications(); setBusy(false); }} />}
      >
        {notifications.length === 0 ? (
          <View style={s.emptyWrap}>
            <Ionicons name="notifications-off-outline" size={36} color={chw.faint} />
            <Text style={s.empty}>No notifications yet. New cases, booking updates and answers to your access requests will show here.</Text>
          </View>
        ) : (
          notifications.map((n) => {
            const icon = ICON[n.type] ?? { name: "notifications-outline" as const, color: chw.teal, bg: chw.tealSoft };
            const isNew = !n.read || fresh.has(n.id);
            return (
              <Pressable
                key={n.id}
                accessibilityRole={n.caseId ? "button" : undefined}
                disabled={!n.caseId}
                onPress={() => void open(n)}
                style={({ pressed }) => [s.item, isNew && s.itemNew, pressed && { opacity: 0.8 }]}
              >
                <View style={[s.icon, { backgroundColor: icon.bg }]}>
                  <Ionicons name={icon.name} size={20} color={icon.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.title}>{n.title}</Text>
                  {n.body ? <Text style={s.body}>{n.body}</Text> : null}
                  <Text style={s.when}>{timeAgo(n.createdAt)}</Text>
                </View>
                {isNew ? <View style={s.dot} /> : n.caseId ? <Ionicons name="chevron-forward" size={18} color="#A5A2AE" /> : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: chw.white },
  topBar: { height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  topBarTitle: { flex: 1, textAlign: "center", fontFamily: fonts.bold, fontSize: 18, color: chw.text },
  list: { paddingHorizontal: 16, paddingTop: 6, gap: 8 },
  item: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 16, backgroundColor: chw.card },
  itemNew: { backgroundColor: chw.tealSoft },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: chw.text },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: chw.muted, marginTop: 3 },
  when: { fontFamily: fonts.medium, fontSize: 12, color: chw.faint, marginTop: 6 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: chw.teal, marginTop: 6 },
  emptyWrap: { alignItems: "center", gap: 12, marginTop: 60, paddingHorizontal: 20 },
  empty: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: chw.muted, textAlign: "center" },
});
