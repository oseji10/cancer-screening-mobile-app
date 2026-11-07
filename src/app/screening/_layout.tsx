import { Stack } from "expo-router";

// "I want to do a screening" flow: intro -> barriers -> hub -> detail. No bottom bar, like the Figma screens.
export default function ScreeningLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
