import { Ionicons } from "@expo/vector-icons";
import { Href, Redirect, Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "../../../constants/theme";
import { useChw } from "../../../lib/chw/ChwContext";
import { chw } from "../../../lib/chw/theme";

const ITEMS: { name: string; label: string; icon: keyof typeof Ionicons.glyphMap; active: keyof typeof Ionicons.glyphMap }[] = [
  { name: "index", label: "Dashboard", icon: "grid-outline", active: "grid" },
  { name: "cases", label: "My cases", icon: "people-outline", active: "people" },
  { name: "learn", label: "Learn", icon: "book-outline", active: "book" },
  { name: "profile", label: "Profile", icon: "person-outline", active: "person" },
];

export default function ChwTabs() {
  const insets = useSafeAreaInsets();
  const { live, ready, user } = useChw();
  // Live mode needs a verified health worker signed in.
  if (live && !ready) return <View style={{ flex: 1, backgroundColor: chw.white }} />;
  if (live && !user) return <Redirect href={"/chw/login" as Href} />;
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => {
        const current = props.state.routes[props.state.index].name;
        return (
          <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
            {ITEMS.map((it) => {
              const on = current === it.name;
              return (
                <Pressable
                  key={it.name}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={it.label}
                  style={styles.item}
                  onPress={() => {
                    const route = props.state.routes.find((r) => r.name === it.name);
                    if (route) props.navigateToTab(route.key);
                  }}
                >
                  <Ionicons name={on ? it.active : it.icon} size={23} color={on ? chw.teal : "#999999"} />
                  <Text style={[styles.label, on && styles.labelOn]}>{it.label}</Text>
                </Pressable>
              );
            })}
          </View>
        );
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="cases" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", backgroundColor: chw.white, borderTopWidth: 1, borderTopColor: "#E9E9E9", paddingTop: 8 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, minHeight: 50 },
  label: { fontFamily: fonts.regular, fontSize: 11, color: "#999999" },
  labelOn: { fontFamily: fonts.bold, color: chw.teal },
});
