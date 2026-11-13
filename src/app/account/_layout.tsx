import { Stack } from "expo-router";

// Sign in, sign up, verify, forgot password and account settings: a plain stack with no tab bar.
export default function AccountLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />;
}
