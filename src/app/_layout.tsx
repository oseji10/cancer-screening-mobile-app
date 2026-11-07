import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold } from "@expo-google-fonts/nunito";
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { AuthProvider } from "../lib/auth/AuthContext";
import { ProfileProvider } from "../lib/profile/ProfileContext";
import { TrackProvider } from "../lib/track/TrackContext";

void SplashScreen.preventAutoHideAsync();

// Always start on the logo splash (src/app/index.tsx).
export const unstable_settings = { anchor: "index" };

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <AuthProvider>
      <ProfileProvider>
        <TrackProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </TrackProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
