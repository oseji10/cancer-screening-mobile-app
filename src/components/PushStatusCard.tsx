import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { fonts } from "../constants/theme";
import { pushStatus, sendTestPush } from "../lib/notifications/push";

/**
 * "Phone notifications" on the profile screens: says whether this phone is set up (and why not),
 * lets the person try again, and sends a test notification through the server.
 */
export function PushStatusCard({ accent, register }: { accent: string; register: () => Promise<boolean> }) {
  const [st, setSt] = useState(pushStatus());
  const [busy, setBusy] = useState<"check" | "test" | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setSt(pushStatus());
    }, []),
  );

  const check = async () => {
    setBusy("check");
    setResult(null);
    await register();
    setSt(pushStatus());
    setBusy(null);
  };

  const test = async () => {
    setBusy("test");
    setResult(await sendTestPush());
    setBusy(null);
  };

  return (
    <View style={s.card}>
      <View style={s.head}>
        <Ionicons name={st.ok ? "notifications" : "notifications-off-outline"} size={20} color={st.ok ? accent : "#B64E68"} />
        <Text style={s.title}>Phone notifications</Text>
        <Text style={[s.badge, { color: st.ok ? accent : "#B64E68" }]}>{st.ok ? "On" : "Off"}</Text>
      </View>
      <Text style={s.msg}>{st.message}</Text>
      <View style={s.actions}>
        <Pressable accessibilityRole="button" disabled={busy !== null} onPress={() => void check()} style={[s.btn, { borderColor: accent }]}>
          {busy === "check" ? <ActivityIndicator size="small" color={accent} /> : <Text style={[s.btnText, { color: accent }]}>{st.ok ? "Check again" : "Try again"}</Text>}
        </Pressable>
        {st.ok ? (
          <Pressable accessibilityRole="button" disabled={busy !== null} onPress={() => void test()} style={[s.btn, { borderColor: accent }]}>
            {busy === "test" ? <ActivityIndicator size="small" color={accent} /> : <Text style={[s.btnText, { color: accent }]}>Send a test</Text>}
          </Pressable>
        ) : null}
      </View>
      {result ? <Text style={s.result}>{result}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, backgroundColor: "#F4F4F4", gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: "#1E1B2B" },
  badge: { fontFamily: fonts.bold, fontSize: 13 },
  msg: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: "#6B6780" },
  actions: { flexDirection: "row", gap: 8, marginTop: 4 },
  btn: { height: 38, borderRadius: 19, borderWidth: 1.5, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", minWidth: 110 },
  btnText: { fontFamily: fonts.semibold, fontSize: 13 },
  result: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: "#3B3650" },
});
