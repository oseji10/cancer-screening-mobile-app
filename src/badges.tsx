import { Href, useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { PillButton } from "../components/PillButton";
import { Screen } from "../components/Screen";
import { colors, fonts } from "../constants/theme";

// PLACEHOLDER: no Badges screen exists in the Figma file yet.
export default function Badges() {
  const router = useRouter();
  return (
    <Screen footer={<PillButton label="Back to Track" onPress={() => router.replace("/track" as Href)} />}>
      <Text style={styles.text}>Your badges: coming soon.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({ text: { fontFamily: fonts.regular, fontSize: 16, color: colors.textMuted, padding: 24 } });
