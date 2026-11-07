import type { Answers } from "./types";

// A simple, transparent rule set that turns the answers into a next-step
// recommendation. It is guidance, NOT a diagnosis or a validated risk model.
// TODO: have NICRAT clinicians confirm every rule and weight below.

export type RiskLevel = "act-now" | "higher" | "moderate" | "typical";

export type ActionId = "report-change" | "find-clinic" | "mammogram" | "cbe" | "self-check" | "learn" | "follow-up";

export type RiskResult = {
  level: RiskLevel;
  score: number;
  /** Plain-language reasons shown under "What shaped this result". */
  reasons: string[];
  /** Ordered next steps; the screen turns each id into a card with a link. */
  actions: ActionId[];
};

const one = (a: Answers, key: string) => a[key]?.[0];

export function assessRisk(answers: Answers): RiskResult {
  const reasons: string[] = [];
  let score = 0;
  let flag = 0; // 0 none, 1 high, 2 urgent
  const raise = (to: 1 | 2) => {
    flag = Math.max(flag, to);
  };
  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(reason);
  };

  const age = one(answers, "age");
  const changes = answers["breast-changes"] ?? [];
  const condition = one(answers, "breast-conditions");

  if (changes.length > 0) {
    raise(2);
    reasons.push("You noticed a change in your breast");
  }
  if (condition === "cancer") {
    raise(1);
    reasons.push("You have had breast cancer before");
  }
  if (condition === "benign") add(1, "You have had a non-cancerous breast condition");
  if (one(answers, "gene-test") === "yes") {
    raise(1);
    reasons.push("A family gene test showed higher cancer risk");
  }
  if (one(answers, "radiation") === "yes") {
    raise(1);
    reasons.push("You have had radiation treatment to your chest");
  }
  if (one(answers, "family-history") === "yes") add(2, "A close relative has had cancer");

  if (age === "40-49") add(1, "Risk rises with age, and you are in your 40s");
  if (age === "50-59" || age === "60-plus") add(2, "Risk rises with age, and you are 50 or older");

  if (one(answers, "first-period") === "7-11") add(1, "Your periods started early");
  if (one(answers, "pregnant") === "no") add(1, "You have not been pregnant");
  if (one(answers, "menopause") === "55-plus") add(1, "Menopause came later than average");
  if (one(answers, "hormones") === "5-plus") add(1, "Long use of hormone medicines");
  if (one(answers, "activity") === "rarely") add(1, "You are rarely active");
  if (one(answers, "alcohol") === "often") add(1, "You drink alcohol most days");

  const level: RiskLevel =
    flag === 2 ? "act-now" : flag === 1 || score >= 5 ? "higher" : score >= 2 ? "moderate" : "typical";

  const actions: ActionId[] = [];
  if (level === "act-now") actions.push("report-change", "find-clinic");
  if (condition === "cancer") actions.push("follow-up");

  const mammoDue =
    (age === "40-49" || age === "50-59" || age === "60-plus") &&
    one(answers, "mammogram") !== "within-two-years";
  const cbeDue = one(answers, "previous-exam") !== "within-year";
  if (mammoDue) actions.push("mammogram");
  if (cbeDue) actions.push("cbe");
  actions.push("self-check");
  if (level !== "act-now") actions.push("find-clinic");
  actions.push("learn");

  return { level, score, reasons, actions: Array.from(new Set(actions)) };
}
