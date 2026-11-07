// Myth Busters content. Statements 1-2 of "Risk factor" and statement 1 of "Breast Health" come from the
// Figma screens; the rest were written for this app.
// TODO: have NICRAT clinicians confirm every statement and explanation.

export type Category = { id: string; title: string; subtitle: string };
export type QuizQuestion = { text: string; answer: "myth" | "fact"; explanation: string };

export const CATEGORIES: Category[] = [
  { id: "breast-health", title: "Breast Health", subtitle: "Quick test of your knowledge" },
  { id: "screening", title: "Screening", subtitle: "Test your knowledge on screening" },
  { id: "risk-factor", title: "Risk factor", subtitle: "Test your knowledge on risk factors" },
];

export const QUESTIONS: Record<string, QuizQuestion[]> = {
  "breast-health": [
    { text: "I am too young to get breast cancer because breast cancer only happens to older women", answer: "myth", explanation: "Breast cancer can affect women of any age. The risk rises with age, but younger women get it too." },
    { text: "Breast cancer is a death sentence", answer: "myth", explanation: "When it is found early, most breast cancers can be treated successfully." },
    { text: "Only women can get breast cancer", answer: "myth", explanation: "Men have breast tissue too and can get breast cancer, although it is much rarer." },
    { text: "A lump is the only sign of breast cancer", answer: "myth", explanation: "Other signs include skin changes, nipple discharge, a change in shape or size, and lasting pain." },
  ],
  screening: [
    { text: "If I feel fine and have no lump, I do not need screening", answer: "myth", explanation: "Screening looks for breast cancer in people with no symptoms, when it is easiest to treat." },
    { text: "A mammogram can find breast cancer before you can feel a lump", answer: "fact", explanation: "Mammograms can pick up very small changes long before they can be felt." },
    { text: "A clinical breast exam is a quick check done by a trained health worker", answer: "fact", explanation: "A health worker looks at and feels your breasts and underarms, usually in just a few minutes." },
    { text: "Mammograms cause breast cancer", answer: "myth", explanation: "A mammogram uses a very low dose of X-ray. Its benefits far outweigh the tiny risk." },
  ],
  "risk-factor": [
    { text: "9 out of 10 people diagnosed with breast cancer have no known family history", answer: "fact", explanation: "Most people diagnosed have no relative with the disease, so everyone should stay breast aware." },
    { text: "Women who have never had children, or only had them after 30, have increased risk of breast cancer", answer: "fact", explanation: "Having a first child later, or never, is linked to a slightly higher risk." },
    { text: "Using deodorant or antiperspirant causes breast cancer", answer: "myth", explanation: "There is no good evidence that deodorants or antiperspirants cause breast cancer." },
    { text: "Staying active and drinking less alcohol can lower your risk", answer: "fact", explanation: "Regular activity and limiting alcohol are both linked to a lower risk." },
  ],
};

export const POINTS_PER_CORRECT = 10;
