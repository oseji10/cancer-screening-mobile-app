import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "../../constants/theme";
import { CATEGORIES } from "../../lib/quiz/content";
import { CATEGORY_IMAGES } from "../../lib/quiz/images";

/** "Choose Your Category": the three Myth Busters quizzes. */
export default function QuizCategories() {
  const router = useRouter();
  const start = (id: string) => router.push(`/myth-busters/${id}` as Href);
  return (
    <View style={styles.root}>
      <View style={styles.top} />
      <View style={styles.curve} pointerEvents="none" />
      <SafeAreaView style={StyleSheet.flatten([styles.safe])} edges={["top", "bottom", "left", "right"]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/learn" as Href))} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <Text style={styles.title}>Choose Your{"\n"}Category</Text>
          <View style={styles.cards}>
            {CATEGORIES.map((c) => (
              <View key={c.id} style={styles.card}>
                <Image source={CATEGORY_IMAGES[c.id]} resizeMode="contain" style={styles.art} />
                <View style={styles.copy}>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                  <Text style={styles.cardSub}>{c.subtitle}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Start ${c.title} quiz`} onPress={() => start(c.id)} style={styles.start}>
                    <Text style={styles.startText}>Start</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  top: { position: "absolute", left: 0, top: 0, width: "100%", height: 250, backgroundColor: colors.primary500 },
  curve: { position: "absolute", left: "-30%", top: 190, width: "160%", height: 160, borderRadius: 999, backgroundColor: colors.white },
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, color: colors.white, marginTop: 28 },
  cards: { gap: 16, marginTop: 70 },
  card: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary500, borderRadius: 24, padding: 14, minHeight: 130 },
  art: { width: 110, height: 100 },
  copy: { flex: 1, alignItems: "flex-end", gap: 4 },
  cardTitle: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, color: colors.white },
  cardSub: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: colors.white, textAlign: "right" },
  start: { alignSelf: "stretch", height: 36, borderRadius: 18, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", marginTop: 8 },
  startText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary500 },
});
