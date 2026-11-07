import { StyleSheet, Text, View } from "react-native";

import { colors, radius, type } from "../constants/theme";

type Props = {
  /** 1-based number of the question being answered. */
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: Props) {
  const fraction = Math.min(1, Math.max(0, current / total));
  const percent = `${Math.round(fraction * 100)}%` as `${number}%`;
  // Rough estimate: about half a minute per question that is still to do.
  const minutesLeft = Math.max(1, Math.ceil((total - current + 1) * 0.45));

  return (
    <View style={styles.wrap}>
      <View style={styles.labels}>
        <Text style={[type.bodyMedium, styles.count]}>
          Question {current} of {total}
        </Text>
        <Text style={[type.bodySmall, styles.time]}>
          About {minutesLeft} {minutesLeft === 1 ? "minute" : "minutes"} left
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: percent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 16,
  },
  labels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  count: {
    fontFamily: "Inter_600SemiBold",
    color: colors.black,
  },
  time: {
    color: colors.black,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    borderWidth: 0.5,
    borderColor: colors.primary50,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary500,
  },
});
