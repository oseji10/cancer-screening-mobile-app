import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts } from "../constants/theme";
import { chw } from "../lib/chw/theme";

/*
 * PLACEHOLDER logo slots — overwrite these files (same names) with the real logos, ideally PNGs with a
 * transparent background, about 600 × 240 px:
 *   assets/about/logo-roche.png       (sponsor)
 *   assets/about/logo-nicrat.png      (custodian)
 *   assets/about/logo-resilience.png  (developer)
 */
const PARTNERS: { role: string; name: string; text: string; logo: ImageSourcePropType }[] = [
  {
    role: "Sponsor",
    name: "Roche",
    text: "Bloom is made possible through the support of Roche, as part of a shared commitment to earlier detection of breast cancer.",
    logo: require("../../assets/about/logo-roche.png"),
  },
  {
    role: "Custodian",
    name: "National Institute for Cancer Research and Treatment (NICRAT)",
    text: "NICRAT owns and oversees Bloom. Screening records from the app are kept in the National Cancer Screening Registry (NCSR), which NICRAT manages.",
    logo: require("../../assets/about/logo-nicrat.png"),
  },
  {
    role: "Developer",
    name: "Resilience Nigeria",
    text: "Bloom was designed and built by Resilience Nigeria, an indigenous Nigerian technology company based in Abuja.",
    logo: require("../../assets/about/logo-resilience.png"),
  },
];

const WOMEN: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: "book-outline", text: "Learn about breast health in simple words" },
  { icon: "hand-left-outline", text: "Get monthly reminders to check your breasts, and log any changes" },
  { icon: "analytics-outline", text: "Check your risk with a short questionnaire" },
  { icon: "location-outline", text: "Find screening centres near you and book a visit" },
];

const WORKERS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: "people-outline", text: "Follow up women who book screening in their community" },
  { icon: "flask-outline", text: "Record breast screening samples and results in the national registry" },
  { icon: "git-branch-outline", text: "Refer women for further care and track them until their case is closed" },
];

/** About Bloom: what the app is for, and who is behind it. Opened from both profile screens (?side=chw for teal). */
export default function About() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { side } = useLocalSearchParams<{ side?: string }>();
  const accent = side === "chw" ? chw.teal : colors.purple;
  const soft = side === "chw" ? chw.tealSoft : "#F3EEFF";
  const version = Constants.expoConfig?.version ?? "";

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace((side === "chw" ? "/chw" : "/home") as Href))}
          style={s.back}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={accent} />
        </Pressable>
        <Text style={s.topTitle}>About Bloom</Text>
        <View style={s.back} />
      </View>

      <ScrollView contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <Image accessibilityLabel="Bloom" source={require("../../assets/brand/logo.png")} style={s.logo} resizeMode="contain" />
        <Text style={s.lead}>Your companion for breast health.</Text>
        <Text style={s.p}>
          Breast cancer is the most common cancer among women in Nigeria, and it is far easier to treat when found early. Bloom helps women know their
          breasts, notice changes, and get screened, and it connects them with community health workers who walk with them to care.
        </Text>

        <Text style={s.h2}>For women</Text>
        <View style={[s.list, { backgroundColor: soft }]}>
          {WOMEN.map((i) => (
            <View key={i.text} style={s.item}>
              <Ionicons name={i.icon} size={20} color={accent} />
              <Text style={s.itemText}>{i.text}</Text>
            </View>
          ))}
        </View>

        <Text style={s.h2}>For community health workers</Text>
        <View style={[s.list, { backgroundColor: soft }]}>
          {WORKERS.map((i) => (
            <View key={i.text} style={s.item}>
              <Ionicons name={i.icon} size={20} color={accent} />
              <Text style={s.itemText}>{i.text}</Text>
            </View>
          ))}
        </View>

        <View style={s.note}>
          <Ionicons name="shield-checkmark-outline" size={20} color={accent} />
          <Text style={s.noteText}>
            Your information is treated as confidential and used only for your care. Bloom does not replace a doctor: if you notice a change in your
            breast, see a health worker.
          </Text>
        </View>

        <Text style={s.h2}>Who is behind Bloom</Text>
        <View style={{ gap: 12 }}>
          {PARTNERS.map((p) => (
            <View key={p.role} style={s.partner}>
              <View style={s.logoBox}>
                <Image accessibilityLabel={`${p.name} logo`} source={p.logo} style={s.partnerLogo} resizeMode="contain" />
              </View>
              <Text style={[s.role, { color: accent }]}>{p.role.toUpperCase()}</Text>
              <Text style={s.partnerName}>{p.name}</Text>
              <Text style={s.partnerText}>{p.text}</Text>
            </View>
          ))}
        </View>

        <Text style={s.version}>Bloom{version ? ` · version ${version}` : ""}</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  topBar: { height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  topTitle: { flex: 1, textAlign: "center", fontFamily: fonts.bold, fontSize: 18, color: "#1E1B2B" },
  content: { paddingHorizontal: 20, gap: 12 },
  logo: { alignSelf: "center", width: 170, height: 90, marginTop: 4 },
  lead: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 29, color: "#1E1B2B", textAlign: "center" },
  p: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: "#3B3650" },
  h2: { fontFamily: fonts.bold, fontSize: 18, color: "#1E1B2B", marginTop: 14 },
  list: { borderRadius: 16, padding: 14, gap: 12 },
  item: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  itemText: { flex: 1, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: "#3B3650" },
  note: { flexDirection: "row", gap: 10, borderRadius: 16, borderWidth: 1, borderColor: "#ECE9F2", padding: 14, marginTop: 6 },
  noteText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: "#6B6780" },
  partner: { borderRadius: 16, borderWidth: 1, borderColor: "#ECE9F2", padding: 16, gap: 4 },
  logoBox: { height: 72, alignItems: "flex-start", justifyContent: "center", marginBottom: 8 },
  partnerLogo: { width: 180, height: 72 },
  role: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1 },
  partnerName: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: "#1E1B2B" },
  partnerText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: "#6B6780" },
  version: { fontFamily: fonts.medium, fontSize: 12, color: "#9A96AA", textAlign: "center", marginTop: 20 },
});
