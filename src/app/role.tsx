import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "../constants/theme";
import { Role, setRole } from "../lib/role";

/** After the splash on first launch: are you a woman using Bloom, or a community health worker? */
export default function RoleSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 52) / 2;

  const selectRole = (role: Role) => {
    void setRole(role);
    router.replace((role === "woman" ? "/onboarding" : "/chw-login") as Href);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>WELCOME TO BLOOM</Text>
          <Text style={styles.title}>Which one are you?</Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Woman */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Woman"
            onPress={() => selectRole("woman")}
            style={({ pressed }) => [styles.roleCard, styles.womanCard, { width: cardWidth }, pressed && styles.pressed]}
          >
            <View style={styles.illustrationContainer}>
              <Ionicons name="flower-outline" size={120} color="#FFFFFF" />
            </View>
            <View style={styles.cardLabel}>
              <Text style={styles.womanLabel}>Woman</Text>
            </View>
          </Pressable>

          {/* Community Health Worker */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Community Health Worker"
            onPress={() => selectRole("chw")}
            style={({ pressed }) => [styles.roleCard, styles.chwCard, { width: cardWidth }, pressed && styles.pressed]}
          >
            <View style={styles.illustrationContainer}>
              <Ionicons name="people-outline" size={120} color="#806FE5" />
            </View>
            <View style={styles.cardLabel}>
              <Text style={styles.chwLabel}>Community</Text>
              <Text style={styles.chwLabel}>Health Worker</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Choose how you'll be using Bloom.
            {"\n"}
            We'll customise your experience for you.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 20, paddingBottom: 30 },
  header: { alignItems: "center", marginBottom: 34 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 16, letterSpacing: 1.2, color: "#8B7FF5", marginBottom: 12 },
  title: { fontFamily: fonts.bold, fontSize: 32, color: "#29243B", textAlign: "center" },
  cardsContainer: { flexDirection: "row", justifyContent: "center", gap: 12 },
  roleCard: {
    height: 260,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
    elevation: 3,
    shadowColor: "#8B7FF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  womanCard: { backgroundColor: "#8B7FF5" },
  chwCard: { backgroundColor: "#DDF3EF" },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  illustrationContainer: { flex: 1, width: "100%", alignItems: "center", justifyContent: "center" },
  cardLabel: { width: "100%", minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  womanLabel: { fontFamily: fonts.semibold, fontSize: 16, color: "#FFFFFF" },
  chwLabel: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 20, color: "#6554BD", textAlign: "center" },
  descriptionContainer: { marginTop: 26, paddingHorizontal: 8 },
  description: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: "#777386", textAlign: "center" },
});
