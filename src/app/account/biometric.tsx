import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { BiometricOffer } from "../../components/auth/BiometricOffer";
import { colors } from "../../constants/theme";
import { errorMessage } from "../../lib/api/client";
import { login } from "../../lib/api/auth";
import { useAuth } from "../../lib/auth/AuthContext";
import { takePendingLogin } from "../../lib/auth/biometric";

/** Turn on fingerprint / Face ID sign-in (after signing in, or from Profile). */
export default function ClientBiometric() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { account } = useAuth();
  const [saved] = useState(() => takePendingLogin("client"));

  return (
    <BiometricOffer
      scope="client"
      saved={saved}
      login={account?.email || account?.phone || ""}
      verify={async (l, p) => {
        try {
          await login(l, p);
          return null;
        } catch (e) {
          return errorMessage(e);
        }
      }}
      onDone={() => router.replace((next || "/home") as Href)}
      accent={colors.purple}
    />
  );
}
