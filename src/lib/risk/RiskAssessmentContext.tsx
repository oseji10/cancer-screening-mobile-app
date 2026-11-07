import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

import type { Answers } from "./types";

type RiskAssessmentState = {
  answers: Answers;
  setAnswer: (groupKey: string, optionIds: string[]) => void;
  reset: () => void;
};

const RiskAssessmentContext = createContext<RiskAssessmentState | null>(null);

/** Keeps the answers while the person moves between the question screens. */
export function RiskAssessmentProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Answers>({});

  const setAnswer = useCallback((groupKey: string, optionIds: string[]) => {
    setAnswers((current) => ({ ...current, [groupKey]: optionIds }));
  }, []);

  const reset = useCallback(() => setAnswers({}), []);

  const value = useMemo(() => ({ answers, setAnswer, reset }), [answers, setAnswer, reset]);

  return <RiskAssessmentContext.Provider value={value}>{children}</RiskAssessmentContext.Provider>;
}

export function useRiskAssessment(): RiskAssessmentState {
  const context = useContext(RiskAssessmentContext);
  if (!context) throw new Error("useRiskAssessment must be used inside <RiskAssessmentProvider>.");
  return context;
}
