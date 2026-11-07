import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../../constants/theme";

type Props<T extends string> = {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
};

/** Lilac track with a white pill under the selected option. */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.label, { color: selected ? colors.trackInk : colors.trackSoft }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 56, borderRadius: 28, backgroundColor: colors.trackBand, flexDirection: "row", padding: 6 },
  option: { flex: 1, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  selected: {
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
});
