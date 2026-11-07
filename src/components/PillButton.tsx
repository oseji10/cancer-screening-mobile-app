import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts } from "../constants/theme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** "purple" = onboarding slides (#7C5CE0, fully round); "lilac" = setup steps (#8B7FF5, 24px corners). */
  tone?: "purple" | "lilac";
};

export function PillButton({ label, onPress, disabled = false, tone = "purple" }: Props) {
  const lilac = tone === "lilac";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: lilac ? colors.primary500 : colors.purple, borderRadius: lilac ? 24 : 999 },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { fontFamily: lilac ? fonts.medium : fonts.semibold }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    letterSpacing: -0.1,
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
});
