import { Href, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { BiometricButton } from "../../components/auth/BiometricButton";
import { AuthButton, AuthError, AuthField, AuthLink, AuthShell } from "../../components/chw/AuthShell";
import { ApiError } from "../../lib/api/client";
import { biometricAvailableAsync, biometricEnabled, biometricLabel, disableBiometric, setPendingLogin, unlockWithBiometric, useBiometricSupported } from "../../lib/auth/biometric";
import { accountStatus } from "../../lib/chw/api";
import { chw } from "../../lib/chw/theme";
import { useChw } from "../../lib/chw/ChwContext";
import { clearRole } from "../../lib/role";

/** Health workers sign in with the same NCSR account they use on the web app. */
export default function ChwSignIn() {
  const router = useRouter();
  const { signIn, live } = useChw();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bioOn, setBioOn] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const autoTried = useRef(false);

  useEffect(() => {
    if (!live) return;
    void biometricEnabled("chw").then((on) => {
      setBioOn(on);
      if (on && !autoTried.current) {
        autoTried.current = true;
        void quickSignIn(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  /** Signs in with the given details; returns true when signed in. */
  const attempt = async (l: string, p: string, fromBiometric: boolean): Promise<boolean> => {
    setError(null);
    try {
      await signIn(l, p);
      return true;
    } catch (e) {
      // An inactive account is usually one still waiting for verification.
      if (e instanceof ApiError && e.code === "ACCOUNT_INACTIVE") {
        try {
          const st = await accountStatus(l, p);
          if (st.review === "pending") {
            router.replace("/chw/pending" as Href);
            return false;
          }
          setError(
            st.review === "rejected"
              ? `Your account was not approved${st.note ? `: ${st.note}` : "."} Please contact your facility.`
              : "Your account is inactive. Please contact your facility or NICRAT.",
          );
        } catch {
          setError("Your account is not active yet. If you signed up recently, it is still being checked.");
        }
      } else if (e instanceof ApiError && e.code === "USER_NOT_FOUND") {
        setError("No account found with that email or phone number. Create one below.");
      } else if (fromBiometric && e instanceof ApiError && (e.status === 401 || e.code === "INVALID_CREDENTIALS")) {
        await disableBiometric("chw");
        setBioOn(false);
        setLogin(l);
        setError(`Your password has changed. Sign in with your new password, then turn on ${biometricLabel()} again.`);
      } else {
        setError(e instanceof Error ? e.message : "Could not sign in.");
      }
      return false;
    }
  };

  const submit = async () => {
    setBusy(true);
    const ok = await attempt(login, password, false);
    setBusy(false);
    if (!ok) return;
    if ((await biometricAvailableAsync()) && !(await biometricEnabled("chw"))) {
      setPendingLogin("chw", { login: login.trim(), password });
      router.replace("/chw/biometric" as Href);
      return;
    }
    router.replace("/chw" as Href);
  };

  const bioSupported = useBiometricSupported();

  /** `enabled` is passed by the auto-prompt, which runs before the state update lands. */
  const quickSignIn = async (enabled: boolean = bioOn) => {
    setError(null);
    if (!enabled) {
      setError(`Sign in with your password once. We'll then ask if you want to use your ${biometricLabel()} next time.`);
      return;
    }
    setBioBusy(true);
    const saved = await unlockWithBiometric("chw");
    if (saved === "reset") {
      setBioOn(false);
      setError(`${biometricLabel()} sign-in was reset on this phone. Sign in with your password to turn it on again.`);
    } else if (saved && (await attempt(saved.login, saved.password, true))) {
      router.replace("/chw" as Href);
    }
    setBioBusy(false);
  };

  /** Opened the health worker side by mistake: back to the choice of Woman / Health worker. */
  const notChw = () => {
    void clearRole();
    router.replace("/role" as Href);
  };

  if (!live) {
    return (
      <AuthShell title="Community Health Worker" sub="The app is not connected to NCSR yet, so you can explore with sample cases.">
        <AuthButton label="Open dashboard" onPress={() => router.replace("/chw" as Href)} />
        <AuthLink label="I'm not a health worker" onPress={notChw} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Health worker sign-in" sub="Use your NCSR account. It is the same one you use on the NCSR web app.">
      <AuthField label="Email or phone number" value={login} onChangeText={setLogin} placeholder="you@example.com or 0803 123 4567" autoCapitalize="none" keyboardType="email-address" autoComplete="username" />
      <AuthField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secure autoComplete="password" />
      {error ? <AuthError>{error}</AuthError> : null}
      <AuthButton label={busy ? "Signing in…" : "Sign in"} disabled={busy || !login.trim() || !password} onPress={() => void submit()} />
      {bioSupported ? (
        <View>
          <BiometricButton onPress={() => void quickSignIn()} busy={bioBusy} accent={chw.teal} />
        </View>
      ) : null}
      <AuthLink label="New here? Create a health worker account" onPress={() => router.push("/chw/signup" as Href)} />
      <AuthLink label="I'm not a health worker" onPress={notChw} />
    </AuthShell>
  );
}
