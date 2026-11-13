import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { colors, fonts } from "../../constants/theme";
import { PillButton } from "../PillButton";
import { Screen } from "../Screen";
import { ScreenHeader } from "../ScreenHeader";

type ShellProps = {
  title: string;
  heading: string;
  sub?: string;
  onBack: () => void;
  children: ReactNode;
  /** Primary button. */
  action: { label: string; onPress: () => void; disabled?: boolean };
  /** Small text links under the button. */
  links?: ReactNode;
};

/** Shared layout for the account screens: header, heading, fields, pinned button. */
export function FormShell({ title, heading, sub, onBack, children, action, links }: ShellProps) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen
        contentStyle={styles.content}
        footer={
          <View style={styles.footer}>
            <PillButton tone="purple" label={action.label} disabled={action.disabled} onPress={action.onPress} />
            {links ? <View style={styles.links}>{links}</View> : null}
          </View>
        }
      >
        <ScreenHeader title={title} onBack={onBack} />
        <View style={styles.head}>
          <Text style={styles.heading}>{heading}</Text>
          {sub ? <Text style={styles.sub}>{sub}</Text> : null}
        </View>
        <View style={styles.fields}>{children}</View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  hint?: string;
  /** Password field with a show/hide eye. */
  secure?: boolean;
};

export function Field({ label, hint, secure = false, style, ...input }: FieldProps) {
  const [hidden, setHidden] = useState(secure);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          {...input}
          secureTextEntry={hidden}
          placeholderTextColor={colors.skipLight}
          autoCapitalize={secure ? "none" : input.autoCapitalize}
          autoCorrect={secure ? false : input.autoCorrect}
          style={[styles.input, secure && { paddingRight: 52 }, style]}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            hitSlop={8}
            onPress={() => setHidden((h) => !h)}
            style={styles.eye}
          >
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={22} color={colors.skip} />
          </Pressable>
        ) : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function FormError({ message }: { message: string | null }) {
  return message ? (
    <Text accessibilityRole="alert" style={styles.error}>
      {message}
    </Text>
  ) : null;
}

export function TextLink({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} hitSlop={10}>
      <Text style={[styles.link, disabled && { opacity: 0.45 }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 24 },
  head: { gap: 8, paddingHorizontal: 4 },
  heading: { fontFamily: fonts.semibold, fontSize: 26, lineHeight: 34, color: colors.black },
  sub: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.textBody },
  fields: { gap: 18 },
  field: { gap: 8 },
  label: { fontFamily: fonts.medium, fontSize: 15, color: colors.black },
  inputWrap: { justifyContent: "center" },
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
  eye: { position: "absolute", right: 16 },
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  error: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: "#C23B3B" },
  footer: { gap: 14, paddingBottom: 16 },
  links: { alignItems: "center", gap: 14 },
  link: { fontFamily: fonts.semibold, fontSize: 15, color: colors.purple },
});
