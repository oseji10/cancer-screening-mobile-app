import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "../../constants/theme";
import { chw } from "../../lib/chw/theme";

/** Teal form screen for health worker sign-in / sign-up. */
export function AuthShell({ title, sub, onBack, children }: { title: string; sub?: string; onBack?: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: chw.white }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
        {onBack ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={styles.back} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={chw.teal} />
          </Pressable>
        ) : null}
        <Image accessibilityLabel="Bloom" source={require("../../../assets/brand/logo.png")} style={styles.logo} resizeMode="contain" />
        <View style={styles.tag}>
          <Ionicons name="people" size={16} color={chw.teal} />
          <Text style={styles.tagText}>Community Health Worker</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
        <View style={{ gap: 14, marginTop: 20 }}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function AuthField({ label, secure, ...rest }: TextInputProps & { label: string; secure?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput placeholderTextColor="#A7A2B3" style={styles.input} secureTextEntry={secure && !show} autoCapitalize={secure ? "none" : rest.autoCapitalize} {...rest} />
        {secure ? (
          <Pressable accessibilityRole="button" accessibilityLabel={show ? "Hide password" : "Show password"} onPress={() => setShow((v) => !v)} hitSlop={8}>
            <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color={chw.faint} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function AuthButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button, disabled && { opacity: 0.5 }]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function AuthLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={{ alignItems: "center", paddingVertical: 6 }}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  return <Text style={styles.error}>{children}</Text>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24 },
  back: { width: 44, height: 44, justifyContent: "center", marginLeft: -8 },
  logo: { alignSelf: "center", width: 170, height: 91, marginTop: 4 },
  tag: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: chw.tealLight, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 },
  tagText: { fontFamily: fonts.semibold, fontSize: 13, color: chw.teal },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, color: "#29243B", marginTop: 16 },
  sub: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: "#777386", marginTop: 6 },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: "#29243B" },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 52, borderWidth: 1, borderColor: chw.border, borderRadius: 14, paddingHorizontal: 14 },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: "#29243B", paddingVertical: 12 },
  button: { height: 54, borderRadius: 27, backgroundColor: chw.teal, alignItems: "center", justifyContent: "center", marginTop: 8 },
  buttonText: { fontFamily: fonts.semibold, fontSize: 16, color: chw.white },
  link: { fontFamily: fonts.semibold, fontSize: 15, color: chw.teal },
  error: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: "#C23B3B" },
});
