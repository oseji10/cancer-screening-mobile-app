import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { Field, FormError, FormShell, TextLink } from "../../components/account/AccountForm";
import { ApiError, errorMessage } from "../../lib/api/client";
import { login } from "../../lib/api/auth";
import { useAuth } from "../../lib/auth/AuthContext";
import { config } from "../../lib/config";

/** Sign in with phone number and password. */
export default function SignIn() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { completeSignIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/profile" as Href));

  const submit = async () => {
    setError(null);
    if (!config.hasBackend) {
      setError("The app isn't connected to the server yet. Set EXPO_PUBLIC_API_URL and rebuild.");
      return;
    }
    setBusy(true);
    try {
      const result = await login(phone.trim(), password);
      await completeSignIn(result);
      router.replace((next || "/home") as Href);
    } catch (e) {
      if (e instanceof ApiError && e.code === "PHONE_NOT_VERIFIED") {
        // Right password, number never confirmed: the server just sent a fresh code.
        const body = e.body as { phone?: string; email?: string; debug_code?: string };
        router.push({
          pathname: "/account/verify",
          params: { phone: body.phone ?? phone.trim(), email: body.email ?? "", dc: body.debug_code ?? "", next: next ?? "" },
        } as unknown as Href);
      } else {
        setError(errorMessage(e));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormShell
      title="Sign in"
      heading="Welcome back"
      sub="Use the phone number and password you signed up with."
      onBack={back}
      action={{ label: busy ? "Signing in…" : "Sign in", onPress: () => void submit(), disabled: busy || phone.trim().length < 10 || password.length === 0 }}
      links={
        <>
          <TextLink label="Forgot password?" onPress={() => router.push({ pathname: "/account/forgot", params: { next: next ?? "" } } as unknown as Href)} />
          <TextLink label="New here? Create an account" onPress={() => router.replace({ pathname: "/account/sign-up", params: { next: next ?? "" } } as unknown as Href)} />
        </>
      }
    >
      <Field label="Phone number" value={phone} onChangeText={setPhone} placeholder="0803 123 4567" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" maxLength={20} />
      <Field label="Password" secure value={password} onChangeText={setPassword} placeholder="Your password" autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={() => void submit()} />
      <FormError message={error} />
    </FormShell>
  );
}
