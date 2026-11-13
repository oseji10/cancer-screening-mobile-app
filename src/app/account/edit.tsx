import { Href, useRouter } from "expo-router";
import { useState } from "react";

import { Field, FormError, FormShell } from "../../components/account/AccountForm";
import { updateProfile } from "../../lib/api/auth";
import { errorMessage } from "../../lib/api/client";
import { useAuth } from "../../lib/auth/AuthContext";
import { type HelpTopic, useProfile } from "../../lib/profile/ProfileContext";

/** Change name and age. The phone number is how the account is found, so it is read-only. */
export default function EditDetails() {
  const router = useRouter();
  const { account, setAccount } = useAuth();
  const { finishOnboarding } = useProfile();
  const [name, setName] = useState(account?.name ?? "");
  const [age, setAge] = useState(account?.age ? String(account.age) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/profile" as Href));
  const ageNumber = age.trim() === "" ? null : Number(age);
  const ageOk = ageNumber === null || (Number.isInteger(ageNumber) && ageNumber >= 10 && ageNumber <= 110);

  const save = async () => {
    setError(null);
    setBusy(true);
    try {
      const { user } = await updateProfile({ name: name.trim(), age: ageNumber });
      setAccount(user);
      await finishOnboarding({ name: user.name, age: user.age, need: user.need as HelpTopic | null });
      back();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormShell
      showLogo={false}
      title="Edit details"
      heading="Your details"
      onBack={back}
      action={{ label: busy ? "Saving…" : "Save", onPress: () => void save(), disabled: busy || name.trim().length < 2 || !ageOk }}
    >
      <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" maxLength={80} />
      <Field label="Age" value={age} onChangeText={(t) => setAge(t.replace(/\D/g, "").slice(0, 3))} keyboardType="number-pad" placeholder="Optional" hint={ageOk ? undefined : "Enter an age between 10 and 110."} />
      <Field label="Phone number" value={account?.phone ?? ""} editable={false} hint="Your number is your sign-in. To change it, contact support." />
      <Field label="Email" value={account?.email ?? ""} editable={false} />
      <FormError message={error} />
    </FormShell>
  );
}
