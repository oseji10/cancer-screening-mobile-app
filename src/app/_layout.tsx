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
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AppLock } from "../components/AppLock";
import { NotificationGate } from "../components/NotificationGate";
import { AppointmentsProvider } from "../lib/appointments/AppointmentsContext";
import { AuthProvider } from "../lib/auth/AuthContext";
import { NotificationsProvider } from "../lib/notifications/NotificationsContext";
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

  // KeyboardProvider: keeps the field being typed in above the keyboard (Android edge-to-edge included).
  return (
    <KeyboardProvider>
    <ProfileProvider>
      <AuthProvider>
        <NotificationsProvider>
          <AppointmentsProvider>
            <TrackProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }} />
              <NotificationGate />
              <AppLock />
            </TrackProvider>
          </AppointmentsProvider>
        </NotificationsProvider>
      </AuthProvider>
    </ProfileProvider>
    </KeyboardProvider>
  );
}
