import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";

import { PillButton } from "../../components/PillButton";
import { Screen } from "../../components/Screen";
import { colors, fonts } from "../../constants/theme";
import { useProfile } from "../../lib/profile/ProfileContext";

/** "Bloom should call you..." Last setup step, then Home. */
export default function SetupName() {
  const router = useRouter();
  const { profile, finishOnboarding } = useProfile();
  const [name, setName] = useState(profile.name);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    await finishOnboarding({ name: name.trim() });
    router.replace("/home" as Href);
  };

  return (
    <>
      <Screen
        contentStyle={styles.content}
        footer={
          <View style={styles.footer}>
            <PillButton tone="purple" label="Continue" disabled={name.trim().length === 0 || saving} onPress={() => void finish()} />
          </View>
        }
      >
        <Image source={require("../../../assets/onboarding/bloom-mascot-name.png")} style={styles.art} resizeMode="cover" />
        <View style={styles.form}>
          <Text style={styles.title}>Now that you have met Bloom</Text>
          <Text style={styles.label}>Bloom should call you...</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.skipLight}
            autoCapitalize="words"
            autoComplete="given-name"
            returnKeyType="done"
            maxLength={40}
            onSubmitEditing={() => name.trim() && void finish()}
            style={styles.input}
          />
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 16, paddingTop: 48, gap: 32, alignItems: "center" },
  art: { width: 211, height: 266, borderRadius: 24 },
  form: { alignSelf: "stretch", gap: 12 },
  title: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 32, color: colors.black, textAlign: "center" },
  label: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.textBody, textAlign: "center" },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.setupTrack,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.black,
  },
  footer: { paddingHorizontal: 0, paddingBottom: 24 },
});
