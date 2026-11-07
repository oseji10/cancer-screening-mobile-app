// Design tokens taken from the DBCAA Figma file (Bloom).
// Colors, type styles and shadows come from the file's variables; values marked
// "approx" were read off the rendered screens because Figma did not expose a variable.

export const colors = {
  primary500: "#8B7FF5", // Figma: Primary 500
  primary50: "#F5C8F3", // Figma: primary 50 (progress track border)
  white: "#FFFFFF",
  black: "#000000",
  track: "#F2F4F7",
  textBody: "rgba(0,0,0,0.75)",
  textMuted: "rgba(0,0,0,0.5)",
  secondary800: "#431005", // Figma: secondary-800 (intro screen heading)
  radioRing: "#8A2F6E", // approx: radio ring colour, Figma draws it as an SVG
  ideaCard: "#FFF5FE",
  selectedBorder: "#8B7FF5",
  // Onboarding / Home
  purple: "#7C5CE0", // Figma: Medium Purple (onboarding buttons)
  setupPurple: "#6750A4", // setup progress bar fill + back circle
  setupTrack: "#E9E3FC",
  skip: "#918DA8",
  skipLight: "#ABABAB",
  dotActive: "#90ADFC",
  dotIdle: "#C4C4C4",
  heading: "#242E49", // Asklepios Gray/80
  ageNear: "#5D6A85", // Asklepios Gray/60
  ageFar: "#BEC5D2", // Asklepios Gray/30
  pinkStrong: "#F24187",
  pinkSoft: "#FC91B6",
  pinkWash: "#FFE2EC",
  reminderBg: "#FFD7DE",
  reminderBorder: "#FBEAEA",
  reminderTitle: "#251D1B",
  reminderButton: "#E9717B",
  badge: "#FF3041",
  // Track section
  trackBand: "#E9E3FC",
  trackInk: "#1F1B3D",
  trackSoft: "#4F4A78",
  trackBg: "#FBFAFF",
  trackBorder: "#E9E3FC",
  iconIdle: "#BDBDBD",
};

// Full-screen backgrounds of the three intro slides.
export const slideTints = ["#AFE9E5", "#FFE3AD", "#F5D2DF"] as const;

// Colours of the five topic cards on Home: [background, text].
export const topicCards = {
  learn: { bg: "#F5F1FF", text: "#8B7FF5" },
  change: { bg: "#CAFFFC", text: "#31CBC2" },
  screening: { bg: "#FFD7DE", text: "#E1697E" },
  appointment: { bg: "#E6C7FF", text: "#A66ED2" },
  risk: { bg: "#849EFB", text: "#EFF3FF" },
} as const;

// Tint behind the "Why we ask" card; Figma uses a different one on each question.
export const infoTints = {
  rose: "#FFF3F3",
  grey: "#EFF0F6",
  pink: "#FFF5FE",
  lilac: "#F9F6FF",
  blush: "#FFEDF0",
  blue: "#EDF1FF",
};

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold",
  nunito: "Nunito_400Regular",
  nunitoBold: "Nunito_700Bold",
  nunitoExtraBold: "Nunito_800ExtraBold",
  jakartaExtraBold: "PlusJakartaSans_800ExtraBold",
};

// Text styles. Spread into a StyleSheet entry: { ...type.h3, color: colors.black }
export const type = {
  h3: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 32 }, // BH3
  display: { fontFamily: fonts.bold, fontSize: 40, lineHeight: 46 },
  bodyLarge: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 }, // BBody
  bodyMedium: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }, // Bbodysmall
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 }, // Bcaption
  button: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 28 },
  buttonLarge: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 28 },
  label: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
} as const;

export const radius = {
  card: 16,
  button: 16,
  buttonLarge: 22,
  pill: 999,
};

export const spacing = {
  screen: 16,
  gap: 8,
};

export const shadows = {
  // Figma: Small shadow (0, 2, blur 8, 10%)
  small: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  // Figma: Medium shadow (0, 6, blur 20, 12%)
  medium: {
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};
