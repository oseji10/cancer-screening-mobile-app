import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts } from "../constants/theme";
import { login as clientLogin } from "../lib/api/auth";
import { errorMessage } from "../lib/api/client";
import { useAuth } from "../lib/auth/AuthContext";
import { biometricAvailableAsync, biometricLabel, verifyBiometric } from "../lib/auth/biometric";
import { clearSession as clearChwSession, loadSession as loadChwSession, saveSession as saveChwSession, signInRequest } from "../lib/chw/api";
import { emitChwSession } from "../lib/chw/sessionEvents";
import { chw } from "../lib/chw/theme";
import { getItem, setItem } from "../lib/storage/localStore";

/** After this long away from the app, the person must confirm it's them again. */
const LOCK_AFTER_MS = 5 * 60 * 1000;
const LAST_KEY = "bloom_last_active_v1";
/** On a cold start, wait for the splash animation before covering the screen. */
const COLD_START_DELAY_MS = 3200;

type Scope = { kind: "client" | "chw"; name: string; login: string };

/**
 * App lock: if the app has been closed or in the background for more than 5 minutes and someone is signed in
 * (a woman or a health worker), it asks them to confirm with their fingerprint / face or password.
 * They can also sign out from here.
 */
export function AppLock() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signedIn, loading, account, completeSignIn, logout } = useAuth();
  const [scope, setScope] = useState<Scope | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bio, setBio] = useState(false);
  const authRef = useRef({ signedIn, account });
  authRef.current = { signedIn, account };

  /** Who is signed in right now (health worker first if that's the role in use). */
  const whoIsSignedIn = useCallback(async (): Promise<Scope | null> => {
    const role = await getItem("bloom_role_v1").catch(() => null);
    const chwSession = await loadChwSession();
    if (chwSession && role === "chw") {
      const u = chwSession.user;
      return { kind: "chw", name: u.firstName, login: u.email || u.phone || "" };
    }
    const { signedIn: s, account: a } = authRef.current;
    if (s && a) return { kind: "client", name: a.name.split(/\s+/)[0] ?? "", login: a.email || a.phone };
    if (chwSession) {
      const u = chwSession.user;
      return { kind: "chw", name: u.firstName, login: u.email || u.phone || "" };
    }
    return null;
  }, []);

  const checkLock = useCallback(async () => {
    const raw = await getItem(LAST_KEY).catch(() => null);
    const last = raw ? Number(raw) : 0;
    if (!last || Date.now() - last < LOCK_AFTER_MS) return;
    const who = await whoIsSignedIn();
    if (!who) return;
    setPassword("");
    setError(null);
    setScope(who);
  }, [whoIsSignedIn]);

  // Cold start: once the saved sign-in has loaded and the splash has played.
  const coldChecked = useRef(false);
  useEffect(() => {
    if (loading || coldChecked.current) return;
    coldChecked.current = true;
    const t = setTimeout(() => void checkLock(), COLD_START_DELAY_MS);
    return () => clearTimeout(t);
  }, [loading, checkLock]);

  // Coming back from the background.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "background" || s === "inactive") {
        void setItem(LAST_KEY, String(Date.now())).catch(() => undefined);
      } else if (s === "active") {
        void checkLock();
      }
    });
    return () => sub.remove();
  }, [checkLock]);

  const unlocked = useCallback(() => {
    void setItem(LAST_KEY, String(Date.now())).catch(() => undefined);
    setScope(null);
    setPassword("");
    setError(null);
  }, []);

  // Offer the fingerprint straight away when the lock appears.
  useEffect(() => {
    if (!scope) return;
    let alive = true;
    void biometricAvailableAsync().then(async (ok) => {
      if (!alive) return;
      setBio(ok);
      if (ok && (await verifyBiometric("Unlock Bloom"))) unlocked();
    });
    return () => {
      alive = false;
    };
  }, [scope, unlocked]);

  if (!scope) return null;

  const accent = scope.kind === "chw" ? chw.teal : colors.purple;

  const withPassword = async () => {
    setBusy(true);
    setError(null);
    try {
      if (scope.kind === "client") {
        await completeSignIn(await clientLogin(scope.login, password)); // also refreshes the token
      } else {
        const res = await signInRequest(scope.login, password);
        await saveChwSession(res.token, res.user);
        emitChwSession("refreshed");
      }
      unlocked();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    if (scope.kind === "client") {
      await logout();
      unlocked();
      router.replace("/home" as Href);
    } else {
      await clearChwSession();
      emitChwSession("signed-out");
      unlocked();
      router.replace("/chw/login" as Href);
    }
  };

  return (
    <View style={[StyleSheet.absoluteFill, styles.screen]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={[styles.inner, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.body}>
            <Image accessibilityLabel="Bloom" source={require("../../assets/brand/logo.png")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Welcome back{scope.name ? `, ${scope.name}` : ""}</Text>
            <Text style={styles.sub}>For your privacy, confirm it's you to continue.</Text>
            {bio ? (
              <Pressable accessibilityRole="button" onPress={() => void verifyBiometric("Unlock Bloom").then((ok) => ok && unlocked())} style={[styles.bioBtn, { borderColor: accent }]}>
                <Ionicons name="finger-print" size={22} color={accent} />
                <Text style={[styles.bioText, { color: accent }]}>Unlock with {biometricLabel()}</Text>
              </Pressable>
            ) : null}
            <View style={styles.field}>
              <Text style={styles.label}>{bio ? "Or enter your password" : "Password"}</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholder="Your password"
                placeholderTextColor="#A7A2B3"
                style={styles.input}
                returnKeyType="go"
                onSubmitEditing={() => password && void withPassword()}
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
          <Pressable accessibilityRole="button" disabled={busy || !password} onPress={() => void withPassword()} style={[styles.primary, { backgroundColor: accent }, (busy || !password) && { opacity: 0.5 }]}>
            <Text style={styles.primaryText}>{busy ? "Checking…" : "Continue"}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => void signOut()} style={styles.secondary} hitSlop={8}>
            <Text style={[styles.secondaryText, { color: accent }]}>Not you? Sign out</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFFFFF", zIndex: 1000, elevation: 1000 },
  inner: { flex: 1, paddingHorizontal: 24 },
  body: { flex: 1, alignItems: "center", gap: 12 },
  logo: { width: 180, height: 97, marginBottom: 8 },
  title: { fontFamily: fonts.bold, fontSize: 24, color: "#29243B", textAlign: "center" },
  sub: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: "#777386", textAlign: "center" },
  bioBtn: { alignSelf: "stretch", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 27, borderWidth: 1.5, marginTop: 12 },
  bioText: { fontFamily: fonts.semibold, fontSize: 16 },
  field: { alignSelf: "stretch", gap: 6, marginTop: 12 },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: "#29243B" },
  input: { minHeight: 52, borderWidth: 1, borderColor: "#E7E5EC", borderRadius: 14, paddingHorizontal: 14, fontFamily: fonts.regular, fontSize: 15, color: "#29243B" },
  error: { fontFamily: fonts.medium, fontSize: 14, color: "#C23B3B", textAlign: "center" },
  primary: { height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  primaryText: { fontFamily: fonts.semibold, fontSize: 16, color: "#FFFFFF" },
  secondary: { alignItems: "center", paddingVertical: 16 },
  secondaryText: { fontFamily: fonts.semibold, fontSize: 15 },
});
