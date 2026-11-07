import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, type } from "../constants/theme";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Changes the accessibility role only; the circle look is the same as in Figma. */
  multiple?: boolean;
};

/** White answer row with a circle on the left. Figma only draws the unselected state. */
export function OptionCard({ label, selected, onPress, multiple = false }: Props) {
  return (
    <Pressable
      accessibilityRole={multiple ? "checkbox" : "radio"}
      accessibilityState={multiple ? { checked: selected } : { selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && styles.pressed]}
    >
      <View style={[styles.ring, selected && styles.ringSelected]}>
        {selected ? <View style={styles.dot} /> : null}
      </View>
      <Text style={[type.bodyMedium, styles.label]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "transparent",
    ...shadows.small,
  },
  cardSelected: {
    borderColor: colors.selectedBorder,
    borderRadius: radius.card,
  },
  pressed: {
    opacity: 0.85,
  },
  ring: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.radioRing,
    alignItems: "center",
    justifyContent: "center",
  },
  ringSelected: {
    borderColor: colors.primary500,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary500,
  },
  label: {
    flex: 1,
    color: colors.black,
  },
});
