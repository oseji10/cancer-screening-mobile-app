import { infoTints } from "../../constants/theme";
import type { QuestionDef } from "./types";

// Question copy comes from the Figma screens. Items marked TODO were
// placeholders or copy-paste leftovers in Figma and need confirming with NICRAT.
// Every picture here is a placeholder file in assets/risk/ (one per slot): overwrite it with
// the real art, keeping the filename. Figma says "of 12" but only draws 8 screens. Questions 9-12 (menopause, hormones,
// lifestyle, genetics/radiation) were written for this app and have NO Figma design:
// confirm the wording and the scoring in scoring.ts with NICRAT. The progress bar and
// routes follow the length of this array.

const GENERIC_INFO = "Your answer helps us to understand your risk and guide you to the next steps";
const REPRODUCTIVE_INFO =
  "Reproductive history like onset of menstruation and pregnancy can affect breast cancer risk";

export const hintImage = require("../../../assets/risk/hint-icon.png");
export const introImage = require("../../../assets/risk/intro-illustration.png");

export const QUESTIONS: QuestionDef[] = [
  {
    id: "age",
    infoText: GENERIC_INFO,
    infoBackground: infoTints.rose,
    image: require("../../../assets/risk/q1-age.png"),
    groups: [
      {
        key: "age",
        title: "How old are you?",
        subtitle: "Please select your age range.",
        selection: "single",
        options: [
          { id: "under-30", label: "under 30 years" },
          { id: "30-39", label: "30-39 years" },
          { id: "40-49", label: "40-49 years" },
          { id: "50-59", label: "50-59 years" },
          { id: "60-plus", label: "60 years and above" },
        ],
      },
    ],
  },
  {
    id: "breast-changes",
    // TODO: Figma repeats the family-history text on this screen; using the generic line.
    infoText: GENERIC_INFO,
    infoBackground: infoTints.grey,
    image: require("../../../assets/risk/q2-breast-changes.png"),
    groups: [
      {
        key: "breast-changes",
        title: "Have you noticed any changes in either breast lately?",
        subtitle: "Please select all that apply",
        selection: "multiple",
        // Figma has no "none of these" option, so allow continuing with nothing selected.
        minSelections: 0,
        options: [
          { id: "lump", label: "A new lump or thickening" },
          { id: "nipple-discharge", label: "Nipple Discharge" },
          { id: "skin-changes", label: "Skin Changes" },
          { id: "shape-changes", label: "Changes in breast or nipple shape" },
          { id: "persistent-pain", label: "Persistent breast pain" },
        ],
      },
    ],
  },
  {
    id: "family-history",
    infoText: "Family history can increase your risk of cancer. This helps us recommend the right screening for you.",
    infoBackground: infoTints.pink,
    image: require("../../../assets/risk/q3-family-history.png"),
    ideaText: "If you are unsure, choose the option that best describes you. You can update later",
    groups: [
      {
        key: "family-history",
        title: "Has anyone in your family being diagnosed of cancer?",
        subtitle: "This could be from your father or mother’s side",
        selection: "single",
        // TODO: Figma shows four options but copied the age labels ("30-39 years").
        // Replace with the real answers.
        options: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
          { id: "not-sure", label: "I’m not sure" },
        ],
      },
    ],
  },
  {
    id: "previous-exam",
    infoText: GENERIC_INFO,
    infoBackground: infoTints.lilac,
    image: require("../../../assets/risk/q4-previous-exam.png"),
    groups: [
      {
        key: "previous-exam",
        title: "Have you ever had a breast examination before?",
        subtitle: "This could be done in a clinic or by yourself",
        selection: "single",
        options: [
          { id: "within-year", label: "Yes, within the last year" },
          { id: "over-year", label: "Yes, more than a year ago" },
          { id: "never", label: "No, never" },
          { id: "dont-remember", label: "I dont remember" },
        ],
      },
    ],
  },
  {
    id: "breast-conditions",
    infoText: "Certain breast conditions can increase your risk. This helps us guide you better",
    infoBackground: infoTints.blush,
    image: require("../../../assets/risk/q5-breast-conditions.png"),
    groups: [
      {
        key: "breast-conditions",
        title: "Have you ever been told you have a breast condition",
        subtitle: "This is usually done by a doctor or a nurse",
        selection: "single",
        options: [
          { id: "never", label: "No, I’ve never had any breast condition" },
          { id: "benign", label: "yes, a non-cancerous (benign) breast condition" },
          { id: "cancer", label: "yes, breast cancer" },
          { id: "not-sure", label: "I’m not sure" },
        ],
      },
    ],
  },
  {
    id: "pregnancy",
    infoText: REPRODUCTIVE_INFO,
    infoBackground: infoTints.blue,
    image: require("../../../assets/risk/q6-pregnancy.png"),
    groups: [
      {
        key: "pregnant",
        title: "Have you ever been pregnant?",
        selection: "single",
        options: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
        ],
      },
      {
        key: "breastfed",
        title: "Did you breast feed?",
        subtitle: "(If yes)",
        selection: "single",
        options: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
          { id: "not-applicable", label: "Not applicable" },
        ],
      },
    ],
  },
  {
    id: "first-period",
    infoText: REPRODUCTIVE_INFO,
    infoBackground: infoTints.blush,
    image: require("../../../assets/risk/q7-first-period.png"),
    imageFit: "cover",
    groups: [
      {
        key: "first-period",
        title: "At what age was your first period?",
        subtitle: "please select the age range that apply",
        selection: "single",
        options: [
          { id: "7-11", label: "7 to 11" },
          { id: "12-13", label: "12 to 13" },
          { id: "14-16", label: "14 to 16" },
          { id: "17-plus", label: "17 or Older" },
        ],
      },
    ],
  },
  {
    id: "mammogram",
    // TODO: Figma reuses the reproductive-history text and the age-range subtitle here.
    infoText: GENERIC_INFO,
    infoBackground: infoTints.blush,
    image: require("../../../assets/risk/q8-mammogram.png"),
    groups: [
      {
        key: "mammogram",
        title: "Have you had a mammogram?",
        selection: "single",
        options: [
          { id: "within-two-years", label: "Yes, within the last two years" },
          { id: "over-two-years", label: "Yes, more than two years ago" },
          { id: "never", label: "No, never" },
          { id: "dont-remember", label: "I dont remember" },
        ],
      },
    ],
  },
  {
    // Not in Figma: written to complete the "of 12" flow. Confirm with NICRAT.
    id: "menopause",
    infoText: REPRODUCTIVE_INFO,
    infoBackground: infoTints.lilac,
    image: require("../../../assets/risk/q9-menopause.png"),
    groups: [
      {
        key: "menopause",
        title: "Have you reached menopause?",
        subtitle: "This is when your periods have stopped for 12 months in a row.",
        selection: "single",
        options: [
          { id: "still-periods", label: "No, I still have periods" },
          { id: "before-45", label: "Yes, before age 45" },
          { id: "45-54", label: "Yes, between 45 and 54" },
          { id: "55-plus", label: "Yes, at 55 or later" },
          { id: "not-sure", label: "I’m not sure" },
        ],
      },
    ],
  },
  {
    // Not in Figma. Confirm with NICRAT.
    id: "hormones",
    infoText: "Some hormone medicines can slightly change breast cancer risk, so it helps us to know",
    infoBackground: infoTints.blue,
    image: require("../../../assets/risk/q10-hormones.png"),
    groups: [
      {
        key: "hormones",
        title: "Have you used hormonal contraception or hormone replacement therapy?",
        subtitle: "For example birth control pills, injections or implants.",
        selection: "single",
        options: [
          { id: "never", label: "No, never" },
          { id: "under-5", label: "Yes, for less than 5 years" },
          { id: "5-plus", label: "Yes, for 5 years or more" },
          { id: "not-sure", label: "I’m not sure" },
        ],
      },
    ],
  },
  {
    // Not in Figma. Confirm with NICRAT.
    id: "lifestyle",
    infoText: "Everyday habits like staying active and drinking less alcohol can lower your risk",
    infoBackground: infoTints.pink,
    image: require("../../../assets/risk/q11-lifestyle.png"),
    groups: [
      {
        key: "activity",
        title: "How often are you physically active?",
        subtitle: "Walking, exercise or active work all count.",
        selection: "single",
        options: [
          { id: "most-days", label: "Most days of the week" },
          { id: "some-days", label: "Once or twice a week" },
          { id: "rarely", label: "Rarely or never" },
        ],
      },
      {
        key: "alcohol",
        title: "How often do you drink alcohol?",
        selection: "single",
        options: [
          { id: "rarely", label: "Never or rarely" },
          { id: "sometimes", label: "Occasionally" },
          { id: "often", label: "Most days" },
        ],
      },
    ],
  },
  {
    // Not in Figma. Confirm with NICRAT.
    id: "genetics",
    infoText: "Some inherited genes and past chest radiation can raise breast cancer risk",
    infoBackground: infoTints.grey,
    image: require("../../../assets/risk/q12-genetics.png"),
    groups: [
      {
        key: "radiation",
        title: "Have you ever had radiation treatment to your chest?",
        subtitle: "For example as a child or young adult.",
        selection: "single",
        options: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
          { id: "not-sure", label: "I’m not sure" },
        ],
      },
      {
        key: "gene-test",
        title: "Has anyone in your family had a gene test showing higher cancer risk?",
        subtitle: "For example BRCA1 or BRCA2.",
        selection: "single",
        options: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
          { id: "not-sure", label: "I’m not sure" },
        ],
      },
    ],
  },
];
