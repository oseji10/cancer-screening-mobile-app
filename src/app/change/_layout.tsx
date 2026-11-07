import { Stack } from "expo-router";

// "I noticed a change" flow: intro -> questions -> result. No bottom bar, like the Figma screens.
export default function ChangeLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
