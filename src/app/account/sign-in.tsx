import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { Field, FormError, FormShell, HealthWorkerSwitch, TextLink } from "../../components/account/AccountForm";
import { setRole } from "../../lib/role";
import { BiometricButton } from "../../components/auth/BiometricButton";
import { colors } from "../../constants/theme";
import { ApiError, errorMessage } from "../../lib/api/client";
import { login } from "../../lib/api/auth";
import { useAuth } from "../../lib/auth/AuthContext";
import { biometricAvailableAsync, biometricEnabled, biometricLabel, disableBiometric, setPendingLogin, unlockWithBiometric, useBiometricSupported } from "../../lib/auth/biometric";
import { config } from "../../lib/config";

/** Sign in with email or phone number, plus password. */
export default function SignIn() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { completeSignIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bioOn, setBioOn] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const autoTried = useRef(false);

  useEffect(() => {
    void biometricEnabled("client").then((on) => {
      setBioOn(on);
      // Open the fingerprint prompt straight away the first time the screen shows.
      if (on && !autoTried.current) {
        autoTried.current = true;
        void quickSignIn(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bioSupported = useBiometricSupported();

  /** `enabled` is passed by the auto-prompt, which runs before the state update lands. */
  const quickSignIn = async (enabled: boolean = bioOn) => {
    setError(null);
    if (!enabled) {
      // Not set up yet: it needs the password once, then we offer to turn it on.
      setError(`Sign in with your password once. We'll then ask if you want to use your ${biometricLabel()} next time.`);
      return;
    }
    setBioBusy(true);
    const saved = await unlockWithBiometric("client");
    if (saved === "reset") {
      setBioOn(false);
      setBioBusy(false);
      setError(`${biometricLabel()} sign-in was reset on this phone. Sign in with your password to turn it on again.`);
      return;
    }
    if (!saved) {
      setBioBusy(false);
      return;
    }
    try {
      const result = await login(saved.login, saved.password);
      await completeSignIn(result);
      router.replace((next || "/home") as Href);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 422)) {
        // The password was changed since quick sign-in was turned on.
        await disableBiometric("client");
        setBioOn(false);
        setPhone(saved.login);
        setError(`Your password has changed. Sign in with your new password, then turn on ${biometricLabel()} again.`);
      } else {
        setError(errorMessage(e));
      }
    } finally {
      setBioBusy(false);
    }
  };

  /** Opened the women's side by mistake: go to the health worker sign-in (and open there next time). */
  const toHealthWorker = () => {
    void setRole("chw");
    router.replace("/chw/login" as Href);
  };

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
      // Offer fingerprint / Face ID sign-in for next time (the password stays in memory only until then).
      if ((await biometricAvailableAsync()) && !(await biometricEnabled("client"))) {
        setPendingLogin("client", { login: phone.trim(), password });
        router.replace({ pathname: "/account/biometric", params: { next: next || "/home" } } as unknown as Href);
        return;
      }
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
      sub="Use your email or phone number, and your password."
      onBack={back}
      action={{ label: busy ? "Signing in…" : "Sign in", onPress: () => void submit(), disabled: busy || phone.trim().length < 5 || password.length === 0 }}
      links={
        <>
          {bioSupported ? (
            <View style={{ alignSelf: "stretch", marginBottom: 8 }}>
              <BiometricButton onPress={() => void quickSignIn()} busy={bioBusy} accent={colors.purple} />
            </View>
          ) : null}
          <TextLink label="Forgot password?" onPress={() => router.push({ pathname: "/account/forgot", params: { next: next ?? "" } } as unknown as Href)} />
          <TextLink label="New here? Create an account" onPress={() => router.replace({ pathname: "/account/sign-up", params: { next: next ?? "" } } as unknown as Href)} />
        </>
      }
    >
      <Field label="Email or phone number" value={phone} onChangeText={setPhone} placeholder="you@example.com or 0803 123 4567" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="username" maxLength={150} />
      <Field label="Password" secure value={password} onChangeText={setPassword} placeholder="Your password" autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={() => void submit()} />
      <FormError message={error} />
      <HealthWorkerSwitch onPress={toHealthWorker} />
    </FormShell>
  );
}
