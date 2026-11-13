import { Stack } from "expo-router";

import { ChwProvider } from "../../lib/chw/ChwContext";

// Everything a Community Health Worker sees lives under /chw and shares the case data.
export default function ChwLayout() {
  return (
    <ChwProvider>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
    </ChwProvider>
  );
}
