import type { ImageSourcePropType } from "react-native";

// One placeholder PNG per image slot in assets/quiz/. Overwrite a file with the real art
// (same filename) and it shows up; no code changes needed.
export const CATEGORY_IMAGES: Record<string, ImageSourcePropType> = {
  "breast-health": require("../../../assets/quiz/cat-breast-health.png"),
  "screening": require("../../../assets/quiz/cat-screening.png"),
  "risk-factor": require("../../../assets/quiz/cat-risk-factor.png"),
};

export const QUESTION_IMAGES: Record<string, ImageSourcePropType[]> = {
  "breast-health": [
    require("../../../assets/quiz/q-breast-health-1.png"),
    require("../../../assets/quiz/q-breast-health-2.png"),
    require("../../../assets/quiz/q-breast-health-3.png"),
    require("../../../assets/quiz/q-breast-health-4.png"),
  ],
  "screening": [
    require("../../../assets/quiz/q-screening-1.png"),
    require("../../../assets/quiz/q-screening-2.png"),
    require("../../../assets/quiz/q-screening-3.png"),
    require("../../../assets/quiz/q-screening-4.png"),
  ],
  "risk-factor": [
    require("../../../assets/quiz/q-risk-factor-1.png"),
    require("../../../assets/quiz/q-risk-factor-2.png"),
    require("../../../assets/quiz/q-risk-factor-3.png"),
    require("../../../assets/quiz/q-risk-factor-4.png"),
  ],
};
