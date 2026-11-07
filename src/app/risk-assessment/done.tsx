import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "../../components/Button";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { colors, fonts, radius, type } from "../../constants/theme";
import { useRiskAssessment } from "../../lib/risk/RiskAssessmentContext";
import { ActionId, assessRisk, RiskLevel } from "../../lib/risk/scoring";
import { loadAssessment, saveAssessment } from "../../lib/risk/storage";
import type { Answers } from "../../lib/risk/types";

const LEVELS: Record<RiskLevel, { bg: string; ink: string; icon: keyof typeof Ionicons.glyphMap; title: string; body: string }> = {
  "act-now": {
    bg: "#FFE2EC", ink: "#B3265F", icon: "alert-circle-outline",
    title: "Please see a health worker soon",
    body: "You told us about a change in your breast. Most changes are not cancer, but it is important to have it checked as soon as you can.",
  },
  higher: {
    bg: "#FFF1D6", ink: "#8A5A00", icon: "shield-checkmark-outline",
    title: "Your risk may be higher than average",
    body: "Some of your answers point to extra risk. Regular screening matters most for you, so talk to a health worker about a plan.",
  },
  moderate: {
    bg: "#EDF1FF", ink: "#3F4FB3", icon: "heart-circle-outline",
    title: "Your risk looks average to moderate",
    body: "A few things in your answers can raise risk a little. Keep up regular checks and screening for your age.",
  },
  typical: {
    bg: "#E3F8F0", ink: "#1D7A5C", icon: "happy-outline",
    title: "Your risk looks typical",
    body: "Nothing in your answers points to extra risk right now. Keep checking yourself monthly and screen on time.",
  },
};

const ACTIONS: Record<ActionId, { icon: keyof typeof Ionicons.glyphMap; title: string; sub: string; href: string }> = {
  "report-change": { icon: "chatbubble-ellipses-outline", title: "Tell us what you noticed", sub: "Answer a few short questions about the change", href: "/change/intro" },
  "find-clinic": { icon: "location-outline", title: "Find a screening centre near you", sub: "See centres and request an appointment", href: "/find" },
  "follow-up": { icon: "medkit-outline", title: "Keep up your follow-up care", sub: "Find a centre that can support you", href: "/find" },
  mammogram: { icon: "scan-outline", title: "You may be due a mammogram", sub: "Learn what to expect before you go", href: "/screening/mammogram" },
  cbe: { icon: "hand-left-outline", title: "Get a clinical breast exam", sub: "A quick check by a health worker", href: "/screening/cbe" },
  "self-check": { icon: "checkmark-done-outline", title: "Check yourself once a month", sub: "Log your self breast exam", href: "/change-tracker" },
  learn: { icon: "book-outline", title: "Learn about breast health", sub: "Short lessons you can read in minutes", href: "/learn" },
};

/** Result screen shown after question 12: a plain-language level, the reasons, and linked next steps. */
export default function RiskAssessmentResult() {
  const router = useRouter();
  const { answers: live, reset } = useRiskAssessment();
  const [stored, setStored] = useState<Answers | null>(null);
  const [checked, setChecked] = useState(false);

  const hasLive = Object.keys(live).length > 0;

  useEffect(() => {
    if (hasLive) {
      void saveAssessment(live);
      setChecked(true);
      return;
    }
    void loadAssessment().then((s) => {
      setStored(s?.answers ?? null);
      setChecked(true);
    });
  }, [hasLive, live]);

  const answers = hasLive ? live : stored;
  const result = useMemo(() => (answers ? assessRisk(answers) : null), [answers]);

  const goHome = () => router.replace("/home" as Href);
  const retake = () => {
    reset();
    router.replace("/risk-assessment" as Href);
  };

  if (!checked) return <Screen><View /></Screen>;

  if (!result) {
    return (
      <Screen footer={<Button label="Start the assessment" onPress={retake} />}>
        <ScreenHeader title="Your result" onBack={goHome} />
        <Text style={[type.body, styles.muted]}>You haven't taken the risk assessment yet.</Text>
      </Screen>
    );
  }

  const tone = LEVELS[result.level];

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <Button label="Back to Home" onPress={goHome} />
          <Pressable accessibilityRole="button" onPress={retake} style={styles.retake}>
            <Text style={styles.retakeText}>Retake the assessment</Text>
          </Pressable>
        </View>
      }
    >
      <ScreenHeader title="Your result" onBack={goHome} />

      <View style={[styles.card, { backgroundColor: tone.bg }]}>
        <Ionicons name={tone.icon} size={44} color={tone.ink} />
        <Text style={[styles.cardTitle, { color: tone.ink }]}>{tone.title}</Text>
        <Text style={styles.cardBody}>{tone.body}</Text>
      </View>

      <Text style={styles.h}>What shaped this result</Text>
      {result.reasons.length === 0 ? (
        <Text style={[type.body, styles.muted]}>None of your answers pointed to extra risk.</Text>
      ) : (
        <View style={styles.reasons}>
          {result.reasons.map((r) => (
            <View key={r} style={styles.reasonRow}>
              <View style={[styles.dot, { backgroundColor: tone.ink }]} />
              <Text style={[type.body, styles.reasonText]}>{r}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.h}>Your next steps</Text>
      <View style={styles.actions}>
        {result.actions.map((id) => {
          const a = ACTIONS[id];
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityLabel={a.title}
              onPress={() => router.push(a.href as Href)}
              style={({ pressed }) => [styles.action, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={a.icon} size={22} color={colors.primary500} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>{a.title}</Text>
                <Text style={styles.actionSub}>{a.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.skip} />
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.note}>
        This is guidance based on your answers, not a diagnosis. Only a health worker can tell you what is happening
        in your body. Your answers stay on this phone.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.textMuted },
  card: { borderRadius: 24, padding: 20, gap: 10, marginTop: 8 },
  cardTitle: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30 },
  cardBody: { ...type.body, color: colors.textBody },
  h: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, color: colors.black, marginTop: 16 },
  reasons: { gap: 10 },
  reasonRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
  reasonText: { flex: 1, color: colors.textBody },
  actions: { gap: 12 },
  action: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    borderRadius: radius.card, borderWidth: 1, borderColor: colors.trackBorder, backgroundColor: colors.white,
  },
  actionIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.trackBand, alignItems: "center", justifyContent: "center" },
  actionTitle: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.black },
  actionSub: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  note: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted, marginTop: 12 },
  footer: { gap: 4 },
  retake: { height: 44, alignItems: "center", justifyContent: "center" },
  retakeText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.primary500 },
});
