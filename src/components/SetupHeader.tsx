import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../constants/theme";

type Props = {
  /** 0..1 */
  progress: number;
  onBack: () => void;
  onSkip?: () => void;
};

/** Back circle, progress bar and Skip link at the top of the profile-setup steps. */
export function SetupHeader({ progress, onBack, onSkip }: Props) {
  const pct = `${Math.round(Math.min(Math.max(progress, 0), 1) * 100)}%` as const;
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} hitSlop={8} style={styles.back}>
        <Ionicons name="arrow-back" size={20} color={colors.white} />
      </Pressable>
      <View style={styles.track}>
        <View style={[styles.fill, { width: pct }]} />
      </View>
      {onSkip ? (
        <Pressable accessibilityRole="button" onPress={onSkip} hitSlop={8}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      ) : (
        <View style={styles.skipSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 56, flexDirection: "row", alignItems: "center", gap: 16 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.setupPurple,
    alignItems: "center",
    justifyContent: "center",
  },
  track: { flex: 1, height: 8, borderRadius: 999, backgroundColor: colors.setupTrack, overflow: "hidden" },
  fill: { height: 8, borderRadius: 999, backgroundColor: colors.setupPurple },
  skip: { fontFamily: fonts.semibold, fontSize: 14, color: colors.skip },
  skipSpacer: { width: 28 },
});
