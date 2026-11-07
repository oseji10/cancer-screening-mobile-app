import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VideoModal } from "../../components/VideoModal";
import { TrackHeader } from "../../components/track/TrackHeader";
import { fonts } from "../../constants/theme";
import { CHANGE_IMAGES } from "../../lib/change/images";

const PINK = "#FFD6DE";
const ACCENT = "#E895AE";

// Wrap words in ** to highlight them in pink. Pictures come from assets/change/symptom-*.png (see src/lib/change/images.ts).
const SYMPTOMS = [
  { id: "lump", text: "A **lump or swelling** in the breast, upper chest or armpit", image: CHANGE_IMAGES.symptom.lump },
  { id: "skin", text: "A **change to the skin**, such as puckering or dimpling", image: CHANGE_IMAGES.symptom.skin },
  { id: "colour", text: "A change in the **colour** of the breast – the breast may look red", image: CHANGE_IMAGES.symptom.colour },
  { id: "nipple", text: "A **nipple change**, for example it has become pulled in (inverted)", image: CHANGE_IMAGES.symptom.nipple },
  { id: "rash", text: "**Rash or crusting** around the nipple", image: CHANGE_IMAGES.symptom.rash },
  { id: "liquid", text: "**Unusual liquid** (discharge) from either nipple", image: CHANGE_IMAGES.symptom.liquid },
];

function Highlighted({ text }: { text: string }) {
  return (
    <Text style={styles.cardText}>
      {text.split("**").map((part, i) => (
        <Text key={i} style={i % 2 === 1 ? styles.hl : undefined}>
          {part}
        </Text>
      ))}
    </Text>
  );
}

/** "I noticed a change": video, short intro and the list of symptoms to report. */
export default function Symptoms() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [videoOpen, setVideoOpen] = useState(false);
  const haveSymptoms = () => router.push("/change/intro" as Href);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.top, { paddingTop: insets.top + 16 }]}>
          <View style={styles.blob} />
          <TrackHeader
            title="Change Tracker"
            onBack={() => router.replace("/home" as Href)}
            info="If you notice any of these changes, get them checked by a health worker. Most changes are not cancer, but it is best to be sure."
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Play video" onPress={() => setVideoOpen(true)} style={styles.video}>
            <Image source={CHANGE_IMAGES.videoThumbnail} style={styles.thumb} resizeMode="cover" />
            <View style={styles.play}>
              <Ionicons name="play" size={26} color="#fff" />
            </View>
          </Pressable>
          <Text style={styles.intro}>
            Everyone’s breasts look and feel different. When you check your breasts, be aware of any changes that are different for you
          </Text>
        </View>

        <View style={styles.bodyWrap}>
          <View style={styles.greyBg} />
          <View style={styles.grid}>
            {SYMPTOMS.map((s) => (
              <View key={s.id} style={styles.card}>
                <Image source={s.image} style={styles.art} resizeMode="contain" />
                <Highlighted text={s.text} />
                <Pressable accessibilityRole="button" onPress={haveSymptoms} style={styles.btn}>
                  <Text style={styles.btnText}>I Have Symptoms</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.bottomStrip} />
      </ScrollView>
      <VideoModal visible={videoOpen} source={require("../../../assets/videos/sbe-whats-normal.mp4")} onClose={() => setVideoOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PINK },
  scroll: { flexGrow: 1 },
  top: { backgroundColor: PINK, paddingHorizontal: 8, paddingBottom: 56, gap: 14, overflow: "hidden" },
  blob: { position: "absolute", right: -22, top: 250, width: 46, height: 100, borderTopLeftRadius: 50, borderBottomLeftRadius: 50, backgroundColor: "#FF9B85" },
  video: { overflow: "hidden", marginHorizontal: 36, height: 150, borderRadius: 30, backgroundColor: "#FFF1F3", alignItems: "center", justifyContent: "center" },
  thumb: { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", opacity: 0.55 },
  play: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#9C9091", alignItems: "center", justifyContent: "center" },
  intro: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: "#1F1A3D", paddingHorizontal: 20 },
  bodyWrap: { marginTop: -36 },
  greyBg: { position: "absolute", left: 0, right: 0, top: 36, bottom: 0, backgroundColor: "#F8F8F8" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 26, rowGap: 8 },
  card: { width: "47%", minHeight: 196, backgroundColor: "#fff", borderRadius: 28, paddingTop: 14, paddingBottom: 16, paddingHorizontal: 14, alignItems: "center", justifyContent: "space-between" },
  art: { width: 96, height: 86 },
  cardText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 18, textAlign: "center", color: "#111", marginVertical: 8 },
  hl: { fontFamily: fonts.semibold, color: ACCENT },
  btn: { alignSelf: "stretch", height: 34, borderRadius: 17, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center" },
  btnText: { fontFamily: fonts.bold, fontSize: 13, color: "#fff" },
  bottomStrip: { height: 40, backgroundColor: PINK },
});
