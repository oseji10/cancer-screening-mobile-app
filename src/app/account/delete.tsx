import { Href, useRouter } from "expo-router";
import { useState } from "react";

import { Field, FormError, FormShell } from "../../components/account/AccountForm";
import { deleteAccount } from "../../lib/api/auth";
import { disableBiometric } from "../../lib/auth/biometric";
import { errorMessage } from "../../lib/api/client";
import { useAuth } from "../../lib/auth/AuthContext";

/** Permanently delete the account and its appointment requests. Data saved only on this phone is kept. */
export default function DeleteAccount() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/profile" as Href));

  const remove = async () => {
    setError(null);
    setBusy(true);
    try {
      await deleteAccount(password);
      await disableBiometric("client");
      await clearSession();
      router.replace("/home" as Href);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <FormShell
      showLogo={false}
      title="Delete account"
      heading="Delete your account?"
      sub="This removes your Bloom account and your appointment requests from our server. It can't be undone. Your tracker and quiz progress stay on this phone."
      onBack={back}
      action={{ label: busy ? "Deleting…" : "Delete my account", onPress: () => void remove(), disabled: busy || password.length === 0 }}
    >
      <Field label="Confirm with your password" secure value={password} onChangeText={setPassword} placeholder="Your password" />
      <FormError message={error} />
    </FormShell>
  );
}
