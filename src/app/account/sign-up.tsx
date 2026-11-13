import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { Field, FormError, FormShell, TextLink } from "../../components/account/AccountForm";
import { register } from "../../lib/api/auth";
import { errorMessage } from "../../lib/api/client";
import { config } from "../../lib/config";
import { useProfile } from "../../lib/profile/ProfileContext";

/** Create a Bloom account. Age and "what brought you here" come from onboarding. */
export default function SignUp() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { profile } = useProfile();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/profile" as Href));
  const strong = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

  const submit = async () => {
    setError(null);
    if (!config.hasBackend) {
      setError("The app isn't connected to the server yet. Set EXPO_PUBLIC_API_URL and rebuild.");
      return;
    }
    setBusy(true);
    try {
      const sent = await register({ name: name.trim(), phone: phone.trim(), email: email.trim(), password, age: profile.age, need: profile.need });
      router.push({
        pathname: "/account/verify",
        params: { phone: sent.phone ?? phone.trim(), email: sent.email ?? email.trim(), dc: sent.debug_code ?? "", next: next ?? "" },
      } as unknown as Href);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormShell
      title="Create account"
      heading="Let's set you up"
      sub="We'll email you a code to confirm your account. Your phone number is how you sign in and how a centre can reach you if you book."
      onBack={back}
      action={{ label: busy ? "Sending code…" : "Continue", onPress: () => void submit(), disabled: busy || name.trim().length < 2 || phone.trim().length < 10 || !/^\S+@\S+\.\S+$/.test(email.trim()) || !strong }}
      links={<TextLink label="Already have an account? Sign in" onPress={() => router.replace({ pathname: "/account/sign-in", params: { next: next ?? "" } } as unknown as Href)} />}
    >
      <Field label="Your name" value={name} onChangeText={setName} placeholder="First name" autoCapitalize="words" autoComplete="name" maxLength={80} />
      <Field label="Phone number" value={phone} onChangeText={setPhone} placeholder="0803 123 4567" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" maxLength={20} />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" maxLength={150} hint="We send your confirmation code here." />
      <Field label="Password" secure value={password} onChangeText={setPassword} placeholder="At least 8 characters" hint="Use 8 or more characters with a letter and a number." autoComplete="new-password" textContentType="newPassword" />
      <FormError message={error} />
    </FormShell>
  );
}
