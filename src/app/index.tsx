import { Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { AnimatedLogo } from "../components/AnimatedLogo";

import { takeLaunchHref } from "../lib/notifications/native";
import { getItem } from "../lib/storage/localStore";

import { colors } from "../constants/theme";
import { useProfile } from "../lib/profile/ProfileContext";

// Long enough to see the logo animation (about 1.8 s) and then the logo itself.
const SPLASH_MS = 3000;

// Splash: the Bloom logo on white, then the role page (first launch) or Home.
export default function Splash() {
  const router = useRouter();
  const { loaded, onboarded } = useProfile();

  useEffect(() => {
    if (!loaded) return;
    let alive = true;
    const timer = setTimeout(async () => {
      // A saved "community health worker" choice: their sign-in. Returning woman: straight Home.
      // First launch (nothing saved): ask which one they are.
      let role: string | null = null;
      try {
        role = await getItem("bloom_role_v1");
      } catch {
        role = null;
      }
      if (!alive) return;
      const to = role === "chw" ? "/chw-login" : onboarded ? "/home" : "/role";
      router.replace(to as Href);
      // Opened by tapping a notification: go on to what it was about (the case, booking or article).
      const href = await takeLaunchHref();
      if (href && alive) router.push(href as Href);
    }, SPLASH_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [loaded, onboarded, router]);

  return (
    <View style={styles.root}>
      {/* Animated from assets/brand/logo-mark.png + logo-word.png (pieces of logo.png). */}
      <AnimatedLogo style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  logo: { width: "66%" },
});
