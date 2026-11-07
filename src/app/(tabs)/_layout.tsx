import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomNav } from "../../components/home/BottomNav";
import { colors } from "../../constants/theme";

// Home, Learn, Track, Find and Profile share one floating bottom bar.
// Screens that live inside the tabs (so the bar stays visible) but are not bar items.
const HIDDEN_PARENT: Record<string, string> = { "change-tracker": "track", "screening-tracker": "track", symptoms: "home", "book-appointment": "track", "request-sent": "track" };

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <View style={{ backgroundColor: colors.white, paddingBottom: insets.bottom }}>
          <BottomNav
            activeName={HIDDEN_PARENT[props.state.routes[props.state.index].name] ?? props.state.routes[props.state.index].name}
            onSelect={(name) => {
              const route = props.state.routes.find((r) => r.name === name);
              if (route) props.navigateToTab(route.key);
            }}
          />
        </View>
      )}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="track" />
      <Tabs.Screen name="find" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="change-tracker" />
      <Tabs.Screen name="screening-tracker" />
      <Tabs.Screen name="symptoms" />
      <Tabs.Screen name="book-appointment" />
      <Tabs.Screen name="request-sent" />
    </Tabs>
  );
}
