import type { ImageSourcePropType } from "react-native";

export type OptionDef = {
  id: string;
  label: string;
};

/** One question block on a screen: a heading plus its answer options. */
export type GroupDef = {
  /** Key used in the answers object, e.g. "age". */
  key: string;
  title: string;
  subtitle?: string;
  selection: "single" | "multiple";
  /** Defaults to 1. Use 0 to let the person continue without picking anything. */
  minSelections?: number;
  options: OptionDef[];
};

/** One screen of the risk assessment. */
export type QuestionDef = {
  id: string;
  /** Text inside the tinted "Why we ask" card. */
  infoText: string;
  infoBackground: string;
  image: ImageSourcePropType;
  imageFit?: "contain" | "cover";
  /** Optional pink hint card shown under the options. */
  ideaText?: string;
  groups: GroupDef[];
};

/** Selected option ids per group key. */
export type Answers = Record<string, string[]>;
