import { Href, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { colors, fonts, type } from "../../constants/theme";
import { useProfile } from "../../lib/profile/ProfileContext";

// PLACEHOLDER: the real profile screen is built in a later drop.
export default function Profile() {
  const router = useRouter();
  const { reset } = useProfile();

  return (
    <Screen>
      <ScreenHeader title="Profile" onBack={() => router.replace("/home" as Href)} />
      <View style={styles.copy}>
        <Text style={[type.body, { color: colors.textMuted }]}>Coming soon.</Text>

        {/* DEV ONLY: wipes the saved profile and restarts at the splash. Hidden in production builds. */}
        {__DEV__ ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void reset().then(() => router.replace("/" as Href))}
            style={styles.dev}
          >
            <Text style={styles.devLabel}>Restart onboarding (dev only)</Text>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: { paddingTop: 48, paddingHorizontal: 8, gap: 32 },
  dev: { height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.primary500, alignItems: "center", justifyContent: "center" },
  devLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary500 },
});
