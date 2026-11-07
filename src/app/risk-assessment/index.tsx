import { Href, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "../../components/Button";
import { Screen } from "../../components/Screen";
import { colors, type } from "../../constants/theme";
import { introImage } from "../../lib/risk/questions";
import { loadAssessment } from "../../lib/risk/storage";

/** "We want to give you the best options": intro screen before question 1. */
export default function RiskAssessmentIntro() {
  const router = useRouter();
  const [hasResult, setHasResult] = useState(false);
  useEffect(() => {
    void loadAssessment().then((r) => setHasResult(!!r));
  }, []);

  return (
    <Screen
      contentStyle={styles.content}
      footer={
        <View style={styles.footer}>
          <Button label="Continue" size="large" onPress={() => router.push({ pathname: "/risk-assessment/[step]", params: { step: "1" } } as Href)} />
          {hasResult ? (
            <Pressable accessibilityRole="button" onPress={() => router.push("/risk-assessment/done" as Href)} style={styles.last}>
              <Text style={styles.lastText}>See my last result</Text>
            </Pressable>
          ) : null}
        </View>
      }
    >
      <Image source={introImage} resizeMode="contain" style={styles.image} accessibilityIgnoresInvertColors />
      <View style={styles.copy}>
        <Text style={[type.display, styles.title]}>We want to give you the best options</Text>
        <Text style={[type.bodyLarge, styles.body]}>
          Your answers helps us understand your breast health and risk factors. Based on your responses, we would
          recommend the next steps that would be most appropriate for you.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    gap: 24,
  },
  image: {
    width: "100%",
    aspectRatio: 380 / 408,
  },
  copy: {
    paddingHorizontal: 8,
    gap: 24,
  },
  title: {
    color: colors.secondary800,
    textTransform: "capitalize",
  },
  body: {
    color: colors.secondary800,
  },
  footer: {
    paddingBottom: 8,
  },
  last: { height: 44, alignItems: "center", justifyContent: "center" },
  lastText: { ...type.bodyMedium, color: colors.primary500 },
});
