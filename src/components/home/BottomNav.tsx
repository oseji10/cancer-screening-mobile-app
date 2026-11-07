import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, shadows } from "../../constants/theme";

type IconName = keyof typeof Ionicons.glyphMap;
export type NavItem = { name: string; label: string; icon: IconName; iconActive: IconName };

export const NAV_ITEMS: NavItem[] = [
  { name: "home", label: "Home", icon: "home-outline", iconActive: "home" },
  { name: "learn", label: "Learn", icon: "book-outline", iconActive: "book" },
  { name: "track", label: "Track", icon: "flower-outline", iconActive: "flower" },
  { name: "find", label: "Find", icon: "location-outline", iconActive: "location" },
  { name: "profile", label: "Profile", icon: "person-circle-outline", iconActive: "person-circle" },
];

/** Floating pill with the five sections; the current one is a filled purple pill (as on the Track screens in Figma). */
export function BottomNav({ activeName, onSelect }: { activeName: string; onSelect: (name: string) => void }) {
  return (
    <View style={styles.bar}>
      {NAV_ITEMS.map((item) => {
        const active = item.name === activeName;
        return (
          <Pressable
            key={item.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(item.name)}
            style={[styles.item, active && styles.itemActive]}
          >
            <Ionicons name={active ? item.iconActive : item.icon} size={20} color={active ? colors.white : colors.iconIdle} />
            <Text style={[styles.label, active && { color: colors.white }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 67,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 24,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    ...shadows.small,
  },
  item: { minWidth: 56, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", gap: 3, paddingHorizontal: 8 },
  itemActive: { backgroundColor: colors.primary500 },
  label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: colors.textMuted, textAlign: "center" },
});
