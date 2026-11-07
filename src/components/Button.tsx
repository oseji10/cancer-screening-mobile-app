import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, type } from "../constants/theme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Circle-arrow icon after the label, as on the "Next" buttons. */
  showArrow?: boolean;
  /** "large" is the taller, rounder variant used on the intro screen. */
  size?: "default" | "large";
};

export function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  showArrow = false,
  size = "default",
}: Props) {
  const inactive = disabled || loading;
  const large = size === "large";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        large ? styles.large : styles.default,
        inactive && styles.inactive,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <View style={styles.row}>
          <Text style={[large ? type.buttonLarge : type.button, styles.label]}>{label}</Text>
          {showArrow ? (
            <Ionicons name="arrow-forward-circle-outline" size={28} color={colors.white} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primary500,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  default: {
    height: 56,
    borderRadius: radius.button,
  },
  large: {
    height: 61,
    borderRadius: radius.buttonLarge,
  },
  inactive: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: colors.white,
  },
});
