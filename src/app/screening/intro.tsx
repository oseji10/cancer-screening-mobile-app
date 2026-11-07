import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PillButton } from "../../components/PillButton";
import { fonts } from "../../constants/theme";
import { SCREENING_IMAGES } from "../../lib/screening/images";

/** "Checking your breast is easy": one-screen introduction before the screening options. */
export default function ScreeningIntro() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const artW = Math.min(width - 60, 330);

  return (
    <SafeAreaView style={styles.root}>
      <Pressable accessibilityRole="button" onPress={() => (router.canGoBack() ? router.back() : router.replace("/home" as Href))} style={styles.prev} hitSlop={10}>
        <Ionicons name="chevron-back" size={18} color="#9B9B9B" />
        <Text style={styles.prevText}>Prev</Text>
      </Pressable>
      <View style={styles.middle}>
        {/* Picture: assets/screening/intro-illustration.png */}
        <Image source={SCREENING_IMAGES.intro} style={{ width: artW, height: (artW * 520) / 640 }} resizeMode="contain" />
        <Text style={styles.title}>Checking your breast is easy</Text>
        <Text style={styles.body}>
          Breast screening uses a breast x-ray, called a mammogram, to look for cancer that may be too small to see or feel. Breast screening can pick up breast cancer before there are any signs or symptoms.
        </Text>
      </View>
      <View style={styles.footer}>
        <PillButton label="Explore Screening" onPress={() => router.push("/screening/barriers" as Href)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 16 },
  prev: { flexDirection: "row", alignItems: "center", gap: 2, paddingTop: 12, paddingLeft: 20, alignSelf: "flex-start" },
  prevText: { fontFamily: fonts.semibold, fontSize: 17, color: "#9B9B9B" },
  middle: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  title: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 40, color: "#3B8A63", textAlign: "center", marginTop: 20 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, color: "#B5B5B5", textAlign: "center", marginTop: 6 },
  footer: { paddingBottom: 12 },
});
