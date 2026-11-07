import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Image, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PillButton } from "../../components/PillButton";
import { TrackHeader } from "../../components/track/TrackHeader";
import { colors, fonts } from "../../constants/theme";
import { MODALITIES, Step } from "../../lib/screening/content";
import { SCREENING_IMAGES } from "../../lib/screening/images";

function Rich({ text, style }: { text: string; style: object }) {
  return (
    <Text style={style}>
      {text.split("**").map((p, i) => (
        <Text key={i} style={i % 2 === 1 ? { fontFamily: fonts.bold, color: "#1F1A3D" } : undefined}>
          {p}
        </Text>
      ))}
    </Text>
  );
}

/** One screening type: swipe the top card between types, then read "Before you go" / "How it works". */
export default function ScreeningDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const start = Math.max(0, MODALITIES.findIndex((m) => m.id === id));
  const [index, setIndex] = useState(start);
  const [tabIdx, setTabIdx] = useState(0);
  const indexRef = useRef(start);
  indexRef.current = index;

  const go = (next: number) => {
    if (next < 0 || next >= MODALITIES.length) return;
    setIndex(next);
    setTabIdx(0);
  };
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderRelease: (_, g) => {
          if (g.dx < -40) go(indexRef.current + 1);
          else if (g.dx > 40) go(indexRef.current - 1);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const m = MODALITIES[index];
  const tab = m.tabs[tabIdx];
  const imgs = SCREENING_IMAGES.step[`${m.id}-${tab.key}`];

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TrackHeader title={m.appbar} onBack={() => router.back()} info={m.blurb} />

        <View {...pan.panHandlers} style={[styles.hero, { backgroundColor: m.tone.bg }]}>
          <View style={[styles.circle, { backgroundColor: m.tone.circle }]} />
          {/* Picture: assets/screening/hero-<name>.png */}
          <Image source={SCREENING_IMAGES.hero[m.id]} style={styles.heroArt} resizeMode="contain" />
          <Text style={styles.heroTitle}>{m.heading}</Text>
          <Text style={styles.heroBody}>{m.blurb}</Text>
          <View style={styles.chips}>
            {m.chips.map((c) => (
              <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>
            ))}
          </View>
        </View>

        <View style={styles.dots}>
          {MODALITIES.map((x, i) => (
            <Pressable key={x.id} accessibilityRole="button" accessibilityLabel={x.heading} onPress={() => go(i)} hitSlop={8}>
              <View style={[styles.dot, i === index && { width: 28, backgroundColor: m.tone.dot }]} />
            </Pressable>
          ))}
        </View>

        <View style={[styles.seg, { backgroundColor: m.tone.tab }]}>
          {m.tabs.map((t, i) => (
            <Pressable key={t.key} accessibilityRole="button" accessibilityState={{ selected: i === tabIdx }} onPress={() => setTabIdx(i)} style={[styles.segItem, i === tabIdx && styles.segOn]}>
              <Text style={[styles.segText, i === tabIdx && { color: "#1F1A3D" }]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        {tab.steps.map((s: Step, i: number) => (
          <View key={`${m.id}-${tab.key}-${i}`} style={styles.step}>
            <View style={[styles.stepArt, { backgroundColor: m.tone.soft }]}>
              {/* Picture: assets/screening/step-<id>-<tab>-<n>.png */}
              <Image source={imgs[i]} style={styles.stepImg} resizeMode="cover" />
              <View style={styles.badge}><Text style={styles.badgeText}>{i + 1}</Text></View>
            </View>
            <Text style={styles.stepTitle}>{s.title}</Text>
            {s.body ? <Rich text={s.body} style={styles.stepBody} /> : null}
            {s.bullets?.map((b) => (
              <View key={b} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Rich text={b} style={[styles.stepBody, { flex: 1 }]} />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <PillButton label={m.cta} onPress={() => router.push("/find" as Href)} />
        <Pressable accessibilityRole="button" onPress={() => router.push("/find" as Href)} style={styles.outline}>
          <Text style={styles.outlineText}>Find a clinic near me</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 150, gap: 16 },
  hero: { borderRadius: 28, padding: 24, minHeight: 200, overflow: "hidden", justifyContent: "center" },
  circle: { position: "absolute", right: -40, bottom: -50, width: 190, height: 190, borderRadius: 95 },
  heroArt: { position: "absolute", right: 0, bottom: 0, width: 140, height: 118 },
  heroTitle: { fontFamily: fonts.extraBold, fontSize: 28, color: "#1F1A3D", letterSpacing: -0.4 },
  heroBody: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: "#4A4560", marginTop: 6, maxWidth: "72%" },
  chips: { flexDirection: "row", gap: 8, marginTop: 14 },
  chip: { backgroundColor: "rgba(255,255,255,0.75)", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontFamily: fonts.semibold, fontSize: 13, color: "#4A4560" },
  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#E6E3F4" },
  seg: { flexDirection: "row", borderRadius: 28, padding: 6 },
  segItem: { flex: 1, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  segOn: { backgroundColor: "#FFFFFF", shadowColor: "#2B2060", shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  segText: { fontFamily: fonts.semibold, fontSize: 16, color: "#7B7694" },
  step: { gap: 8 },
  stepArt: { height: 170, borderRadius: 26, overflow: "hidden", justifyContent: "flex-end" },
  stepImg: { position: "absolute", left: 0, top: 0, width: "100%", height: "100%" },
  badge: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", margin: 14 },
  badgeText: { fontFamily: fonts.bold, fontSize: 16, color: "#1F1A3D" },
  stepTitle: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, color: "#1F1A3D", marginTop: 10 },
  stepBody: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: "#5F5A7A" },
  bulletRow: { flexDirection: "row", gap: 8, paddingLeft: 8 },
  bullet: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: "#5F5A7A" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, gap: 8, backgroundColor: "rgba(255,255,255,0.96)" },
  outline: { height: 50, borderRadius: 25, borderWidth: 1, borderColor: colors.trackBorder, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  outlineText: { fontFamily: fonts.semibold, fontSize: 16, color: "#5F5A7A" },
});
