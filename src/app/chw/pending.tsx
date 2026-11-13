import { Href, useRouter } from "expo-router";

import { AuthButton, AuthShell } from "../../components/chw/AuthShell";

/** After sign-up (or signing in before approval). */
export default function ChwPending() {
  const router = useRouter();
  return (
    <AuthShell
      title="Waiting for verification"
      sub="Thanks for signing up. Your facility or NICRAT will check your details before you can see any cases. We'll email you as soon as you're approved, then you can sign in here or on the NCSR web app."
    >
      <AuthButton label="Back to sign-in" onPress={() => router.replace("/chw/login" as Href)} />
    </AuthShell>
  );
}
