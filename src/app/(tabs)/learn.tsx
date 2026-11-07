import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "../../constants/theme";
import { TOPICS } from "../../lib/learn/lessons";

const SIDE = 26;
const GAP = 31;

/** "Hi there!" Learn landing: six topic cards. */
export default function Learn() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const card = (width - SIDE * 2 - GAP) / 2;

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <Text style={styles.hi}>Hi there!</Text>
          <Text style={styles.sub}>Being breast aware means getting to know how your breasts look and feel</Text>
        </View>

        <View style={styles.grid}>
          {TOPICS.map((topic) => (
            <Pressable
              key={topic.id}
              accessibilityRole="button"
              onPress={() => router.push(`/lesson/${topic.id}` as Href)}
              style={({ pressed }) => [styles.card, { width: card, height: card, backgroundColor: topic.bg }, pressed && { opacity: 0.9 }]}
            >
              {/* Figma has a small illustrated face here; a tinted block stands in for it. */}
              <View style={[styles.decor, { backgroundColor: topic.decor }]} />
              <Text style={styles.label}>{topic.title}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Myth Busters quiz"
          onPress={() => router.push("/myth-busters" as Href)}
          style={({ pressed }) => [styles.myth, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.mythIcon}>
            <Ionicons name="help-circle-outline" size={28} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mythTitle}>Myth Busters</Text>
            <Text style={styles.mythSub}>Test your knowledge: is it a myth or a fact?</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.white} />
        </Pressable>

        <Image source={require("../../../assets/learn/footer-art.png")} style={styles.footer} resizeMode="contain" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingTop: 24, paddingBottom: 16, gap: 24 },
  heading: { paddingHorizontal: 16, gap: 4 },
  hi: { fontFamily: fonts.bold, fontSize: 36, lineHeight: 44, color: "#333333" },
  sub: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.textMuted },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: SIDE, columnGap: GAP, rowGap: 21 },
  card: { borderRadius: 12, overflow: "hidden", justifyContent: "flex-end", padding: 15 },
  decor: { position: "absolute", top: 0, right: 0, width: 70, height: 70, borderBottomLeftRadius: 28 },
  label: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 22, color: colors.black },
  myth: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: SIDE, padding: 16, borderRadius: 20, backgroundColor: colors.primary500 },
  mythIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  mythTitle: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, color: colors.white },
  mythSub: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.white },
  footer: { width: "100%", height: 150, opacity: 0.8 },
});
