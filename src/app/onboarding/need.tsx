import { Href, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PillButton } from "../../components/PillButton";
import { Screen } from "../../components/Screen";
import { SetupHeader } from "../../components/SetupHeader";
import { colors, fonts } from "../../constants/theme";
import { HelpTopic, useProfile } from "../../lib/profile/ProfileContext";

const OPTIONS: { id: HelpTopic; label: string; circle: string }[] = [
  { id: "breast-health", label: "Breast health", circle: "#C9EDE5" },
  { id: "screening", label: "Screening services", circle: "#FBE8B0" },
  { id: "appointment", label: "Making appointment", circle: "#F9CFE0" },
  { id: "community", label: "Finding communities", circle: "#DDD3F6" },
];

/** "What do you need help with?" Pick one of four cards. */
export default function SetupNeed() {
  const router = useRouter();
  const { profile, update } = useProfile();

  return (
    <Screen
      contentStyle={styles.content}
      footer={
        <View style={styles.footer}>
          <PillButton
            tone="lilac"
            label="Continue"
            disabled={profile.need === null}
            onPress={() => router.push("/onboarding/name" as Href)}
          />
        </View>
      }
    >
      <SetupHeader progress={0.7} onBack={() => router.back()} onSkip={() => router.push("/onboarding/name" as Href)} />
      <View style={styles.heading}>
        <Text style={styles.title}>What do you need help with?</Text>
        <Text style={styles.subtitle}>Pick one. You can change this at any time.</Text>
      </View>
      <View style={styles.grid}>
        {OPTIONS.map((option) => {
          const selected = profile.need === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => update({ need: option.id })}
              style={[styles.card, selected && styles.cardSelected]}
            >
              <View style={[styles.circle, { backgroundColor: option.circle }]} />
              <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 24 },
  heading: { gap: 8, paddingHorizontal: 8 },
  title: { fontFamily: fonts.jakartaExtraBold, fontSize: 30, lineHeight: 38, letterSpacing: -0.3, color: colors.heading },
  subtitle: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.textMuted },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 16 },
  // Figma card: 489 x 480 (about 1.02 : 1), a coloured circle clipped into the top-right
  // corner, label bottom-left. Selected = solid purple with white text.
  card: {
    width: "47.5%",
    aspectRatio: 489 / 480,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#E9E7F5",
    backgroundColor: colors.white,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 16,
  },
  cardSelected: { backgroundColor: colors.primary500, borderColor: colors.primary500 },
  circle: { position: "absolute", top: -26, right: -25, width: 100, height: 100, borderRadius: 50 },
  cardLabel: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 18, color: "#1F1B3D" },
  cardLabelSelected: { color: colors.white },
  footer: { paddingHorizontal: 8, paddingBottom: 24 },
});
