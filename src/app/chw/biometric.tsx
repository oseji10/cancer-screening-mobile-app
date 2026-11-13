import { Href, useRouter } from "expo-router";
import { useState } from "react";

import { BiometricOffer } from "../../components/auth/BiometricOffer";
import { takePendingLogin } from "../../lib/auth/biometric";
import { signInRequest } from "../../lib/chw/api";
import { useChw } from "../../lib/chw/ChwContext";
import { chw } from "../../lib/chw/theme";

/** Turn on fingerprint / Face ID sign-in for a health worker (after sign-in, or from Profile). */
export default function ChwBiometric() {
  const router = useRouter();
  const { user } = useChw();
  const [saved] = useState(() => takePendingLogin("chw"));

  return (
    <BiometricOffer
      scope="chw"
      saved={saved}
      login={user?.email || user?.phone || ""}
      verify={async (l, p) => {
        try {
          await signInRequest(l, p);
          return null;
        } catch (e) {
          return e instanceof Error ? e.message : "That password is not correct.";
        }
      }}
      onDone={() => router.replace("/chw" as Href)}
      accent={chw.teal}
    />
  );
}
