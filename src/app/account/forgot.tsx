import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { Field, FormError, FormShell } from "../../components/account/AccountForm";
import { forgotPassword, resetPassword } from "../../lib/api/auth";
import { errorMessage } from "../../lib/api/client";
import { useAuth } from "../../lib/auth/AuthContext";
import { config } from "../../lib/config";
import { colors, fonts } from "../../constants/theme";

/** Reset a forgotten password: phone number, then SMS code plus a new password. */
export default function Forgot() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { completeSignIn } = useAuth();
  const [step, setStep] = useState<"phone" | "reset">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState("");

  const back = () => (step === "reset" ? setStep("phone") : router.canGoBack() ? router.back() : router.replace("/account/sign-in" as Href));
  const strong = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

  const sendCode = async () => {
    setError(null);
    if (!config.hasBackend) {
      setError("The app isn't connected to the server yet. Set EXPO_PUBLIC_API_URL and rebuild.");
      return;
    }
    setBusy(true);
    try {
      const sent = await forgotPassword(phone.trim());
      setDevCode(sent.debug_code ?? "");
      setStep("reset");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await resetPassword(phone.trim(), code, password);
      await completeSignIn(result);
      router.replace((next || "/home") as Href);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return step === "phone" ? (
    <FormShell
      title="Forgot password"
      heading="Reset your password"
      sub="Enter your phone number and we'll email a code to the address on your account."
      onBack={back}
      action={{ label: busy ? "Sending…" : "Send code", onPress: () => void sendCode(), disabled: busy || phone.trim().length < 10 }}
    >
      <Field label="Phone number" value={phone} onChangeText={setPhone} placeholder="0803 123 4567" keyboardType="phone-pad" autoComplete="tel" maxLength={20} />
      <FormError message={error} />
    </FormShell>
  ) : (
    <FormShell
      title="New password"
      heading="Check your email"
      sub="If that number has a Bloom account, a 6-digit code is on its way to its email. Enter it with your new password."
      onBack={back}
      action={{ label: busy ? "Saving…" : "Change password", onPress: () => void reset(), disabled: busy || code.length !== 6 || !strong }}
    >
      <Field label="Code" value={code} onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))} placeholder="123456" keyboardType="number-pad" textContentType="oneTimeCode" maxLength={6} />
      {devCode ? <Text style={styles.dev}>Test code: {devCode}</Text> : null}
      <Field label="New password" secure value={password} onChangeText={setPassword} placeholder="At least 8 characters" hint="Use 8 or more characters with a letter and a number." textContentType="newPassword" />
      <FormError message={error} />
    </FormShell>
  );
}

const styles = StyleSheet.create({
  dev: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, textAlign: "center" },
});
