import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fonts } from "../../constants/theme";
import { HUB_GROUPS } from "../../lib/screening/content";
import { SCREENING_IMAGES } from "../../lib/screening/images";

const LILAC = "#8B7FF5";
const NAMES: Record<string, string> = { cbe: "Clinical Breast examination", mammogram: "Mammogram", ultrasound: "Breast Ultrasound", mri: "Breast MRI", biopsy: "Biopsy" };

/** Screening hub: pick a screening type to learn more. */
export default function ScreeningHub() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cell = (width - 32) / 2;
  const open = (id: string) => router.push(`/screening/${id}` as Href);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/home" as Href))} style={styles.round}>
          <Ionicons name="arrow-back" size={24} color="#1F2540" />
        </Pressable>
        <View style={styles.topRight}>
          <Pressable accessibilityRole="button" accessibilityLabel="Screening tracker" onPress={() => router.push("/screening-tracker" as Href)} style={styles.round}>
            <Ionicons name="calendar" size={22} color="#1F2540" />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push("/profile" as Href)} style={styles.round}>
            <Ionicons name="settings-sharp" size={22} color="#1F2540" />
          </Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Screening</Text>
        <Text style={styles.sub}>Pick a session to learn more about screening options available</Text>

        {HUB_GROUPS.map((g) => (
          <View key={g.question} style={{ marginTop: 14 }}>
            <Text style={styles.q}>{g.question}</Text>
            <View style={styles.grid}>
              {g.ids.map((id) => (
                <View key={id} style={[styles.cell, { width: id === "biopsy" ? width - 32 : cell }]}>
                  {/* Picture: assets/screening/hub-<name>.png */}
                  <Image source={SCREENING_IMAGES.hub[id]} style={id === "biopsy" ? styles.artWide : styles.art} resizeMode="contain" />
                  <Text style={styles.name}>{NAMES[id]}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={`View detail: ${NAMES[id]}`} onPress={() => open(id)} style={styles.detail}>
                    <Text style={styles.detailText}>View Detail</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 8 },
  topRight: { flexDirection: "row", gap: 10 },
  round: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#EFEFF1", alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 },
  h1: { fontFamily: fonts.extraBold, fontSize: 36, color: LILAC, letterSpacing: -0.5 },
  sub: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, color: "#B5B5B5", marginTop: 4, maxWidth: 330 },
  q: { fontFamily: fonts.medium, fontSize: 16, color: "#111" },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  cell: { alignItems: "center", paddingVertical: 8, gap: 10 },
  art: { width: 150, height: 150 },
  artWide: { width: 220, height: 200 },
  name: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22, color: "#111", textAlign: "center", paddingHorizontal: 8 },
  detail: { height: 30, paddingHorizontal: 20, borderRadius: 15, backgroundColor: LILAC, alignItems: "center", justifyContent: "center", marginTop: -4 },
  detailText: { fontFamily: fonts.semibold, fontSize: 14, color: "#FFFFFF" },
});
