import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../../constants/theme";

type Props = {
  title: string;
  onBack: () => void;
  /** Text shown when the "i" button is tapped. */
  info?: string;
};

/** Outlined back button, centred title and "i" button used on the tracker screens. */
export function TrackHeader({ title, onBack, info }: Props) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.circle}>
        <Ionicons name="chevron-back" size={22} color={colors.purple} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="About this screen"
        onPress={() => info && Alert.alert(title, info)}
        style={styles.circle}
      >
        <Text style={styles.i}>i</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  circle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.trackBorder, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
  title: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, color: colors.trackInk },
  i: { fontFamily: fonts.semibold, fontStyle: "italic", fontSize: 16, color: colors.purple },
});
