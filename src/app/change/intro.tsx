import { Href, useRouter } from "expo-router";
import { Image, Pressable, useWindowDimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PillButton } from "../../components/PillButton";
import { colors, fonts } from "../../constants/theme";
import { CHANGE_IMAGES } from "../../lib/change/images";

/** "You know best!": offers the short questionnaire or an exit. */
export default function ChangeIntro() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const artW = width - 44; // 6px narrower than the card on each side, as in Figma
  const leave = () => router.replace("/home" as Href);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.skipRow}>
        <Pressable accessibilityRole="button" onPress={leave} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.middle}>
        {/* Picture: assets/change/intro-illustration.png */}
        <Image source={CHANGE_IMAGES.introIllustration} style={{ width: artW, height: (artW * 370) / 720, alignSelf: "center" }} resizeMode="contain" />
        <View style={styles.card}>
          <Text style={styles.title}>You know best!</Text>
          <Text style={styles.body}>
            You know your breasts best. If something feels or looks different, don’t worry, just get it checked. Most breast changes are
            benign (not cancer), but checking any new change can give you peace of mind and help you know what’s going on.
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <PillButton label="Answer a few questions" tone="lilac" onPress={() => router.push("/change/form" as Href)} />
        <Pressable accessibilityRole="button" onPress={leave} style={styles.ghost}>
          <Text style={styles.ghostText}>No need.</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3F4F9", paddingHorizontal: 16 },
  skipRow: { alignItems: "flex-end", paddingTop: 12, paddingHorizontal: 4 },
  skip: { fontFamily: fonts.semibold, fontSize: 16, color: "#3F3F46" },
  middle: { flex: 1, justifyContent: "center" },
  card: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 48,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontFamily: fonts.bold, fontSize: 38, lineHeight: 44, textAlign: "center", color: "#2E2E2E" },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 27, textAlign: "center", color: "#5A5A5A", marginTop: 6 },
  actions: { gap: 16, paddingBottom: 24, paddingTop: 12 },
  ghost: { height: 60, borderRadius: 30, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  ghostText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.primary500 },
});
