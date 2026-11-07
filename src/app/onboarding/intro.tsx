import { Href, useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

import { PillButton } from "../../components/PillButton";
import { Screen } from "../../components/Screen";
import { colors, fonts } from "../../constants/theme";

/** "Before you start, tell us more about you" */
export default function SetupIntro() {
  const router = useRouter();

  return (
    <Screen
      contentStyle={styles.content}
      footer={
        <View style={styles.footer}>
          <PillButton label="Continue" onPress={() => router.push("/onboarding/age" as Href)} />
        </View>
      }
    >
      <Image source={require("../../../assets/onboarding/bloom-mascot.png")} style={styles.art} resizeMode="cover" />
      <View style={styles.copy}>
        <Text style={styles.title}>Before you start, tell us more about you</Text>
        <Text style={styles.body}>Bloom is curious on how she can help you grow</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingTop: 16, gap: 24 },
  art: { width: "100%", aspectRatio: 342 / 382, borderRadius: 4 },
  copy: { alignItems: "center", gap: 16, paddingVertical: 16 },
  title: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 32, color: colors.black, textAlign: "center" },
  body: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 28, color: colors.black, textAlign: "center" },
  footer: { paddingHorizontal: 8, paddingBottom: 24 },
});
