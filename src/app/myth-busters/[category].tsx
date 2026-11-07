import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QuizHeader } from "../../components/quiz/QuizHeader";
import { colors, fonts } from "../../constants/theme";
import { useProfile } from "../../lib/profile/ProfileContext";
import { POINTS_PER_CORRECT, QUESTIONS } from "../../lib/quiz/content";
import { QUESTION_IMAGES } from "../../lib/quiz/images";
import { addPoints } from "../../lib/quiz/storage";

type Pick = "myth" | "fact";

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}.${String(s % 60).padStart(2, "0")}`;

/** One Myth Busters quiz: question by question, then the result. */
export default function QuizCategory() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const { profile } = useProfile();
  const questions = QUESTIONS[category ?? ""] ?? [];
  const images = QUESTION_IMAGES[category ?? ""] ?? [];

  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<(Pick | null)[]>(() => questions.map(() => null));
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const saved = useRef(false);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  const correct = useMemo(() => picks.filter((p, i) => p && p === questions[i]?.answer).length, [picks, questions]);
  const earned = correct * POINTS_PER_CORRECT;

  useEffect(() => {
    if (!done || saved.current) return;
    saved.current = true;
    void addPoints(earned).then(setTotal);
  }, [done, earned]);

  const goHome = () => router.replace("/home" as Href);
  const toCategories = () => router.replace("/myth-busters" as Href);

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.pad}>
          <QuizHeader title="Myth Busters" onBack={toCategories} />
          <Text style={styles.empty}>This quiz is not available yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const retry = () => {
    setPicks(questions.map(() => null));
    setIndex(0);
    setSeconds(0);
    setTotal(null);
    saved.current = false;
    setDone(false);
  };

  if (done) {
    const wrong = questions.length - correct;
    const name = profile.name?.trim();
    return (
      <SafeAreaView style={styles.root} edges={["top", "bottom", "left", "right"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <QuizHeader title="Result" titleColor={colors.primary500} onBack={toCategories} onQuit={toCategories} />
          <View style={styles.badgeOuter}>
            <View style={styles.badgeInner}>
              <Ionicons name="checkmark" size={56} color="#D9B8F2" />
            </View>
          </View>
          <Text style={styles.great}>{name ? `Great Work, ${name}!` : "Great Work!"}</Text>

          <View style={styles.tiles}>
            <View style={[styles.tile, { backgroundColor: colors.primary500 }]}>
              <Text style={styles.tileNum}>{questions.length}</Text>
              <Text style={styles.tileLabel}>Question</Text>
            </View>
            <View style={[styles.tile, { backgroundColor: "#EF3E3E" }]}>
              <Text style={styles.tileNum}>{wrong}</Text>
              <Text style={styles.tileLabel}>Wrong</Text>
            </View>
            <View style={[styles.tile, { backgroundColor: "#2FBF71" }]}>
              <Text style={styles.tileNum}>{correct}</Text>
              <Text style={styles.tileLabel}>Correct</Text>
            </View>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}><Ionicons name="time-outline" size={18} color={colors.primary500} /><Text style={styles.statText}>{mmss(seconds)}</Text></View>
            <View style={styles.stat}><Ionicons name="trophy-outline" size={18} color={colors.primary500} /><Text style={styles.statText}>{total ?? "…"}</Text></View>
            <View style={styles.stat}><Ionicons name="stats-chart-outline" size={18} color={colors.primary500} /><Text style={styles.statText}>+{earned} Points</Text></View>
          </View>

          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={goHome} style={[styles.pill, { backgroundColor: colors.primary500 }]}>
              <Text style={[styles.pillText, { color: colors.white }]}>Home</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={retry} style={[styles.pill, styles.pillOutline]}>
              <Text style={[styles.pillText, { color: colors.primary500 }]}>Retry Mission</Text>
            </Pressable>
          </View>

          <Text style={styles.reviewH}>Review your answers</Text>
          {questions.map((q, i) => {
            const ok = picks[i] === q.answer;
            return (
              <View key={q.text} style={styles.review}>
                <Ionicons name={ok ? "checkmark-circle" : "close-circle"} size={22} color={ok ? "#2FBF71" : "#EF3E3E"} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewQ}>{q.text}</Text>
                  <Text style={styles.reviewA}>{q.answer === "myth" ? "Myth" : "Fact"}. {q.explanation}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const q = questions[index];
  const pick = picks[index];
  const choose = (p: Pick) => setPicks((prev) => prev.map((v, i) => (i === index ? p : v)));
  const next = () => (index === questions.length - 1 ? setDone(true) : setIndex(index + 1));
  const back = () => (index === 0 ? toCategories() : setIndex(index - 1));

  const Option = ({ value, label }: { value: Pick; label: string }) => {
    const on = pick === value;
    return (
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: on }}
        accessibilityLabel={label}
        onPress={() => choose(value)}
        style={[styles.option, on && styles.optionOn]}
      >
        <Text style={[styles.optionText, on && { color: colors.white }]}>{label}</Text>
        <View style={[styles.radio, on && { borderColor: colors.white }]}>{on ? <View style={styles.radioDot} /> : null}</View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <QuizHeader title="Myth Busters" onBack={back} onQuit={toCategories} />
        <View style={styles.meta}>
          <Text style={styles.metaText}>{index + 1}/{questions.length}</Text>
          <Text style={styles.metaText}>{mmss(seconds)}</Text>
        </View>
        <Image source={images[index]} resizeMode="contain" style={styles.art} accessibilityIgnoresInvertColors />
        <Text style={styles.statement}>{q.text}</Text>
        <View style={styles.options}>
          <Option value="myth" label="A.  Myth" />
          <Option value="fact" label="B.  Facts" />
        </View>
        <View style={styles.nav}>
          <Pressable accessibilityRole="button" onPress={back} style={[styles.backBtn]}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !pick }}
            disabled={!pick}
            onPress={next}
            style={[styles.nextBtn, !pick && { opacity: 0.55 }]}
          >
            <Text style={styles.nextText}>{index === questions.length - 1 ? "Finish" : "Next"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  pad: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 16 },
  empty: { fontFamily: fonts.regular, fontSize: 16, color: colors.textMuted, marginTop: 24 },
  meta: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  metaText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.black },
  art: { width: "100%", height: 220 },
  statement: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, color: colors.black, textAlign: "center" },
  options: { gap: 14, marginTop: 6 },
  option: { height: 56, borderRadius: 28, backgroundColor: "#F0F0F2", paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  optionOn: { backgroundColor: colors.primary500 },
  optionText: { fontFamily: fonts.semibold, fontSize: 15, color: "#8E8E98" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#8E8E98", alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.white },
  nav: { flexDirection: "row", gap: 12, marginTop: 18 },
  backBtn: { height: 52, paddingHorizontal: 26, borderRadius: 26, borderWidth: 1, borderColor: colors.primary500, alignItems: "center", justifyContent: "center" },
  backText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.primary500 },
  nextBtn: { flex: 1, height: 52, borderRadius: 26, backgroundColor: colors.primary500, alignItems: "center", justifyContent: "center" },
  nextText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.white },
  badgeOuter: { alignSelf: "center", width: 112, height: 112, borderRadius: 56, backgroundColor: "#8B7FF5", alignItems: "center", justifyContent: "center", marginTop: 20 },
  badgeInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#E3A8F2", alignItems: "center", justifyContent: "center" },
  great: { fontFamily: fonts.extraBold, fontSize: 26, lineHeight: 32, color: colors.primary500, textAlign: "center", marginTop: 4 },
  tiles: { flexDirection: "row", gap: 12, marginTop: 12 },
  tile: { flex: 1, height: 84, borderRadius: 14, alignItems: "center", justifyContent: "center", gap: 2 },
  tileNum: { fontFamily: fonts.bold, fontSize: 26, color: colors.white },
  tileLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.white },
  stats: { flexDirection: "row", justifyContent: "space-around", marginTop: 6 },
  stat: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary500 },
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },
  pill: { flex: 1, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  pillOutline: { borderWidth: 1, borderColor: colors.primary500 },
  pillText: { fontFamily: fonts.semibold, fontSize: 15 },
  reviewH: { fontFamily: fonts.semibold, fontSize: 18, color: colors.black, marginTop: 12 },
  review: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  reviewQ: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: colors.black },
  reviewA: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted, marginTop: 2 },
});
