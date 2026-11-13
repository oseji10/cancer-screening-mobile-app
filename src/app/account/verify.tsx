import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";

import { Field, FormError, FormShell, TextLink } from "../../components/account/AccountForm";
import { resendCode, verifyPhone } from "../../lib/api/auth";
import { ApiError, errorMessage } from "../../lib/api/client";
import { useAuth } from "../../lib/auth/AuthContext";
import { colors, fonts } from "../../constants/theme";

const RESEND_SECONDS = 60;

/** Enter the 6-digit SMS code. Success signs the person in. */
export default function Verify() {
  const router = useRouter();
  const { phone = "", email = "", dc = "", next } = useLocalSearchParams<{ phone?: string; email?: string; dc?: string; next?: string }>();
  const { completeSignIn } = useAuth();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [wait, setWait] = useState(RESEND_SECONDS);
  const [devCode, setDevCode] = useState(dc);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/account/sign-in" as Href));

  const submit = async (value = code) => {
    setError(null);
    setBusy(true);
    try {
      const result = await verifyPhone(phone, value);
      await completeSignIn(result);
      router.replace((next || "/home") as Href);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError(null);
    setNotice(null);
    try {
      const sent = await resendCode(phone);
      setNotice(sent.message);
      if (sent.debug_code) setDevCode(sent.debug_code);
      setWait(RESEND_SECONDS);
    } catch (e) {
      setError(errorMessage(e));
      if (e instanceof ApiError && e.code === "OTP_TOO_SOON") setWait(RESEND_SECONDS);
    }
  };

  const onChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (digits.length === 6 && !busy) void submit(digits);   // sends as soon as the 6th digit is typed
  };

  return (
    <FormShell
      title="Confirm your account"
      heading="Check your email"
      sub={`We sent a 6-digit code to ${email || "your email"}. It can take a minute to arrive, so check your spam folder too.`}
      onBack={back}
      action={{ label: busy ? "Checking…" : "Confirm", onPress: () => void submit(), disabled: busy || code.length !== 6 }}
      links={<TextLink label={wait > 0 ? `Send a new code in ${wait}s` : "Send a new code"} disabled={wait > 0} onPress={() => void resend()} />}
    >
      <Field label="Code" value={code} onChangeText={onChange} placeholder="123456" keyboardType="number-pad" textContentType="oneTimeCode" maxLength={6} style={styles.code} />
      {devCode ? <Text style={styles.dev}>Test code: {devCode}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      <FormError message={error} />
    </FormShell>
  );
}

const styles = StyleSheet.create({
  code: { fontFamily: fonts.semibold, fontSize: 24, letterSpacing: 8, textAlign: "center" },
  dev: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, textAlign: "center" },
  notice: { fontFamily: fonts.medium, fontSize: 14, color: colors.setupPurple, textAlign: "center" },
});
