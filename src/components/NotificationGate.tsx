import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "../constants/theme";
import { emitPermissionGranted, permissionState, pushPossible, requestPermission } from "../lib/notifications/native";

/**
 * Notifications must be on to use Bloom: case updates, booking answers and news arrive that way.
 *  - Android: blocks the app until they are on (asks, or sends the person to Settings if they said no before).
 *  - iPhone: asks the same way but can be put off for this session. Apple rejects apps that cannot be used
 *    without notifications (App Review Guideline 4.5.4), so it must not block there.
 * Not shown before the person is in the app (splash, role choice, onboarding, sign-in/up), on the web or in Expo Go.
 */
const FREE = [/^\/$/, /^\/role/, /^\/onboarding/, /^\/account/, /^\/chw\/(login|signup|pending|biometric)/, /^\/chw-login/, /^\/about/];

export function NotificationGate() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<{ granted: boolean; canAsk: boolean } | null>(null);
  const [snoozed, setSnoozed] = useState(false);
  const wasBlocked = useRef(false);
  const isChw = pathname.startsWith("/chw");
  const accent = isChw ? "#159E96" : "#7C5CE0";
  const blocking = Platform.OS === "android";

  const check = useCallback(async () => {
    if (!pushPossible()) {
      setState({ granted: true, canAsk: false });
      return;
    }
    const st = await permissionState();
    // Just turned on in Settings: register the phone straight away.
    if (st.granted && wasBlocked.current) emitPermissionGranted();
    wasBlocked.current = !st.granted;
    setState(st);
  }, []);

  // Checked at start and every time the app comes back (e.g. from Settings).
  useEffect(() => {
    void check();
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") void check();
    });
    return () => sub.remove();
  }, [check]);

  const turnOn = async () => {
    const st = await permissionState();
    if (st.canAsk) {
      const res = await requestPermission();
      if (res === "granted") {
        wasBlocked.current = false;
        setState({ granted: true, canAsk: true });
        emitPermissionGranted();
        return;
      }
      await check();
      return;
    }
    // The phone won't ask again: only Settings can turn them on.
    await Linking.openSettings().catch(() => undefined);
  };

  const exempt = FREE.some((r) => r.test(pathname));
  if (!state || state.granted || exempt || (!blocking && snoozed)) return null;

  return (
    <View style={[StyleSheet.absoluteFill, s.screen, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }]}>
      <View style={s.body}>
        <View style={[s.icon, { backgroundColor: `${accent}1F` }]}>
          <Ionicons name="notifications" size={52} color={accent} />
        </View>
        <Text style={s.title}>Turn on notifications</Text>
        <Text style={s.sub}>
          {isChw
            ? "Bloom tells you about new cases, booking decisions and messages from NICRAT through notifications. Please turn them on to continue."
            : "Bloom sends your booking confirmations, check-up reminders and important health news as notifications. Please turn them on to continue."}
        </Text>
        {!state.canAsk ? (
          <View style={s.steps}>
            <Text style={s.stepsTitle}>In Settings:</Text>
            <Text style={s.step}>1. Tap Notifications</Text>
            <Text style={s.step}>2. Turn on “Allow notifications”</Text>
            <Text style={s.step}>3. Come back to Bloom</Text>
          </View>
        ) : null}
      </View>
      <Pressable accessibilityRole="button" onPress={() => void turnOn()} style={[s.primary, { backgroundColor: accent }]}>
        <Text style={s.primaryText}>{state.canAsk ? "Turn on notifications" : "Open Settings"}</Text>
      </Pressable>
      {!blocking ? (
        <Pressable accessibilityRole="button" onPress={() => setSnoozed(true)} style={s.secondary} hitSlop={8}>
          <Text style={[s.secondaryText, { color: accent }]}>Not now</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { backgroundColor: "#FFFFFF", paddingHorizontal: 24, zIndex: 900, elevation: 900 },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  icon: { width: 104, height: 104, borderRadius: 52, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  title: { fontFamily: fonts.bold, fontSize: 24, color: "#1E1B2B", textAlign: "center" },
  sub: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: "#5D5872", textAlign: "center" },
  steps: { alignSelf: "stretch", backgroundColor: "#F5F4F8", borderRadius: 16, padding: 16, gap: 6, marginTop: 8 },
  stepsTitle: { fontFamily: fonts.semibold, fontSize: 15, color: "#1E1B2B" },
  step: { fontFamily: fonts.regular, fontSize: 15, color: "#3B3650" },
  primary: { height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  primaryText: { fontFamily: fonts.semibold, fontSize: 16, color: "#FFFFFF" },
  secondary: { alignSelf: "center", paddingVertical: 14 },
  secondaryText: { fontFamily: fonts.semibold, fontSize: 15 },
});
