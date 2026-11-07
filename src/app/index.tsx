import { Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

import { colors } from "../constants/theme";
import { useProfile } from "../lib/profile/ProfileContext";

const SPLASH_MS = 1400;

// Splash: logo + tagline, then onboarding (first launch) or Home.
export default function Splash() {
  const router = useRouter();
  const { loaded, onboarded } = useProfile();

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      router.replace((onboarded ? "/home" : "/onboarding") as Href);
    }, SPLASH_MS);
    return () => clearTimeout(timer);
  }, [loaded, onboarded, router]);

  return (
    <View style={styles.root}>
      {/* Full-screen artwork from Figma: logo plus the "Breast Health Anywhere" tagline. */}
      <Image source={require("../../assets/brand/splash.png")} style={styles.art} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  art: { flex: 1, width: "100%", height: "100%" },
});
