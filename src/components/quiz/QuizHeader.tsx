import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../../constants/theme";

type Props = { title: string; onBack: () => void; onQuit?: () => void; titleColor?: string };

/** Purple round back button, centred title, and a round "more" button with a one-item menu. */
export function QuizHeader({ title, onBack, onQuit, titleColor = colors.black }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.circle}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </Pressable>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="More options" onPress={() => setOpen((o) => !o)} style={styles.circle}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.white} />
        </Pressable>
      </View>
      {open && onQuit ? (
        <Pressable accessibilityRole="button" onPress={onQuit} style={styles.menu}>
          <Text style={styles.menuText}>Quit quiz</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 5 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  circle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary500, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  menu: {
    position: "absolute", right: 0, top: 46, backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  menuText: { fontFamily: fonts.medium, fontSize: 15, color: colors.black },
});
