import { Stack } from "expo-router";

import { RiskAssessmentProvider } from "../../lib/risk/RiskAssessmentContext";

export default function RiskAssessmentLayout() {
  return (
    <RiskAssessmentProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RiskAssessmentProvider>
  );
}
