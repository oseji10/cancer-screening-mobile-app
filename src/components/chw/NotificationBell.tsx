import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { fonts } from "../../constants/theme";
import { useChw } from "../../lib/chw/ChwContext";
import { chw } from "../../lib/chw/theme";

/** Bell with the unread count; opens the health worker's notifications. */
export function NotificationBell() {
  const router = useRouter();
  const { unread } = useChw();
  const label = unread > 0 ? `Notifications, ${unread} unread` : "Notifications";
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={8} onPress={() => router.push("/chw/notifications" as Href)} style={({ pressed }) => [s.bell, pressed && { opacity: 0.7 }]}>
      <Ionicons name={unread > 0 ? "notifications" : "notifications-outline"} size={23} color={chw.text} />
      {unread > 0 ? (
        <View style={s.badge}>
          <Text style={s.badgeText}>{unread > 99 ? "99+" : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: chw.card, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: 5, right: 4, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: "#D6455D", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: chw.white },
  badgeText: { fontFamily: fonts.bold, fontSize: 10, color: chw.white },
});
