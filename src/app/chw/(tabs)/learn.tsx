import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "../../../constants/theme";
import { chw } from "../../../lib/chw/theme";

// Short guides for health workers. CONTENT FOR NICRAT CLINICAL REVIEW before release.
const GUIDES: { title: string; icon: keyof typeof Ionicons.glyphMap; points: string[] }[] = [
  {
    title: "Explaining breast screening",
    icon: "chatbubbles-outline",
    points: [
      "Screening checks the breasts before there are any problems, so changes can be found early.",
      "Changes found early are usually easier to treat.",
      "At the PHC, a trained health worker will look at and feel the breasts. It takes a few minutes and is private.",
      "Use simple words and her own language. Avoid frightening words.",
    ],
  },
  {
    title: "Listening and answering questions",
    icon: "ear-outline",
    points: [
      "Listen first. Ask what she already knows and what worries her.",
      "Fear, cost, distance and family permission are common worries. Ask about each gently.",
      "If you do not know an answer, say so and find out. Do not guess.",
      "Check she understands the next step: ask her to tell it back in her own words.",
    ],
  },
  {
    title: "Signs that need a check soon",
    icon: "alert-circle-outline",
    points: [
      "A new lump or thickening in the breast or armpit.",
      "A change in the size or shape of one breast.",
      "Skin that is dimpled, puckered, red or looks like orange peel.",
      "A nipple that has turned inward, a rash on the nipple, or fluid (especially blood) from the nipple.",
      "Most lumps are not cancer, but every new change should be checked at the PHC.",
    ],
  },
  {
    title: "Supporting her through a referral",
    icon: "walk-outline",
    points: [
      "Explain why she is being referred and what will happen at the next facility.",
      "Help her plan transport, the day, and who will go with her.",
      "Give her the facility name, address and the date written down.",
      "Follow up after the visit to confirm she went and to help with the next step.",
    ],
  },
  {
    title: "Privacy and respect",
    icon: "lock-closed-outline",
    points: [
      "Speak with her privately. Only share her information with the care team.",
      "Cases in Bloom use a code instead of her name. Do not write her name in notes.",
      "She decides. Give clear information and support her choice.",
    ],
  },
];

export default function ChwLearn() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 15 }]} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Learn</Text>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>LEARN</Text>
        <Text style={styles.heroTitle}>Support women with confidence</Text>
        <Text style={styles.heroText}>Learn how to explain screening, encourage questions and support shared decisions.</Text>
      </View>
      {GUIDES.map((g, i) => {
        const on = open === i;
        return (
          <View key={g.title} style={styles.card}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: on }} onPress={() => setOpen(on ? null : i)} style={styles.cardHead}>
              <View style={styles.icon}>
                <Ionicons name={g.icon} size={20} color={chw.teal} />
              </View>
              <Text style={styles.cardTitle}>{g.title}</Text>
              <Ionicons name={on ? "chevron-up" : "chevron-down"} size={18} color="#A5A2AE" />
            </Pressable>
            {on ? (
              <View style={styles.points}>
                {g.points.map((p) => (
                  <View key={p} style={styles.point}>
                    <View style={styles.dot} />
                    <Text style={styles.pointText}>{p}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: chw.white },
  content: { paddingHorizontal: 16, paddingBottom: 28, gap: 10 },
  pageTitle: { fontFamily: fonts.bold, fontSize: 32, color: "#111111", letterSpacing: -0.7, marginBottom: 12 },
  hero: { backgroundColor: chw.tealLight, borderRadius: 18, padding: 18, marginBottom: 8 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, color: chw.teal, letterSpacing: 1 },
  heroTitle: { fontFamily: fonts.bold, fontSize: 21, lineHeight: 27, color: chw.text, marginTop: 6 },
  heroText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: chw.muted, marginTop: 6 },
  card: { borderWidth: 1, borderColor: chw.border, borderRadius: 16, backgroundColor: chw.white },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: chw.tealSoft, alignItems: "center", justifyContent: "center" },
  cardTitle: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: chw.text },
  points: { paddingHorizontal: 16, paddingBottom: 14, gap: 8 },
  point: { flexDirection: "row", gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: chw.teal, marginTop: 8 },
  pointText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: chw.muted },
});
