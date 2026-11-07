import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { Button } from "../../components/Button";
import { IdeaCard } from "../../components/IdeaCard";
import { OptionCard } from "../../components/OptionCard";
import { PrivacyNote } from "../../components/PrivacyNote";
import { ProgressBar } from "../../components/ProgressBar";
import { QuestionHeading } from "../../components/QuestionHeading";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { WhyWeAskCard } from "../../components/WhyWeAskCard";
import { submitRiskAssessment } from "../../lib/api/riskAssessment";
import { config } from "../../lib/config";
import { hintImage, QUESTIONS } from "../../lib/risk/questions";
import { useRiskAssessment } from "../../lib/risk/RiskAssessmentContext";
import type { GroupDef } from "../../lib/risk/types";

function isGroupAnswered(group: GroupDef, selected: string[] | undefined): boolean {
  return (selected?.length ?? 0) >= (group.minSelections ?? 1);
}

/** One question screen. The route is /risk-assessment/1, /2, ... (1-based). */
export default function RiskAssessmentQuestion() {
  const router = useRouter();
  const { step } = useLocalSearchParams<{ step: string }>();
  const { answers, setAnswer } = useRiskAssessment();
  const [submitting, setSubmitting] = useState(false);

  const parsed = Number.parseInt(step ?? "1", 10);
  const index = Number.isFinite(parsed) ? Math.min(Math.max(parsed - 1, 0), QUESTIONS.length - 1) : 0;
  const question = QUESTIONS[index];
  const isLast = index === QUESTIONS.length - 1;
  const canContinue = question.groups.every((group) => isGroupAnswered(group, answers[group.key]));

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/risk-assessment" as Href);
  };

  const toggle = (group: GroupDef, optionId: string) => {
    const current = answers[group.key] ?? [];
    if (group.selection === "single") {
      setAnswer(group.key, [optionId]);
    } else {
      setAnswer(
        group.key,
        current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId],
      );
    }
  };

  const next = async () => {
    if (!isLast) {
      router.push({ pathname: "/risk-assessment/[step]", params: { step: String(index + 2) } } as Href);
      return;
    }

    if (!config.submitRiskAssessment) {
      router.replace("/risk-assessment/done" as Href);
      return;
    }

    setSubmitting(true);
    try {
      await submitRiskAssessment(answers);
      router.replace("/risk-assessment/done" as Href);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      Alert.alert("We couldn’t save your answers", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      footer={
        <View>
          <Button label="Next" showArrow disabled={!canContinue} loading={submitting} onPress={() => void next()} />
          <PrivacyNote />
        </View>
      }
    >
      <ScreenHeader title="Risk Assessment" onBack={goBack} />
      <ProgressBar current={index + 1} total={QUESTIONS.length} />
      <WhyWeAskCard
        body={question.infoText}
        backgroundColor={question.infoBackground}
        image={question.image}
        imageFit={question.imageFit}
      />

      {question.groups.map((group) => (
        <View key={group.key} style={styles.group}>
          <QuestionHeading title={group.title} subtitle={group.subtitle} />
          <View style={styles.options}>
            {group.options.map((option) => (
              <OptionCard
                key={option.id}
                label={option.label}
                multiple={group.selection === "multiple"}
                selected={(answers[group.key] ?? []).includes(option.id)}
                onPress={() => toggle(group, option.id)}
              />
            ))}
          </View>
        </View>
      ))}

      {question.ideaText ? <IdeaCard text={question.ideaText} icon={hintImage} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  options: {
    gap: 16,
  },
});
