import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../../constants/theme";

/** Small card on Home that links to the last risk-assessment result. */
export function RiskResultCard({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="View your risk assessment result" onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View style={styles.icon}><Ionicons name="shield-checkmark-outline" size={22} color={colors.white} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Your risk assessment</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 20, backgroundColor: "#849EFB" },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: "#EFF3FF" },
  title: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.white },
});
