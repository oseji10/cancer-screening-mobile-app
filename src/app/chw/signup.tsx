import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthButton, AuthError, AuthField, AuthLink, AuthShell } from "../../components/chw/AuthShell";
import { PickerField } from "../../components/chw/PickerField";
import { fonts } from "../../constants/theme";
import { FacilityOption, registerChw, searchFacilities } from "../../lib/chw/api";
import { PROFESSIONS } from "../../lib/chw/professions";
import { chw } from "../../lib/chw/theme";
import { clearRole } from "../../lib/role";

/** Sign-up for community health workers. The account stays locked until an admin verifies them. */
export default function ChwSignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [facilities, setFacilities] = useState<FacilityOption[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [profession, setProfession] = useState<string | null>(null);
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Every active facility on NCSR, for the drop-down.
  useEffect(() => {
    let alive = true;
    searchFacilities()
      .then((rows) => alive && setFacilities(rows))
      .catch(() => alive && setError("Could not load the list of facilities. Check your connection and try again."))
      .finally(() => alive && setFacilitiesLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const facilityOptions = useMemo(
    () => facilities.map((f) => ({ value: String(f.id), label: f.name, sub: [f.lga, f.state].filter(Boolean).join(", ") || undefined })),
    [facilities],
  );
  const professionOptions = useMemo(() => PROFESSIONS.map((p) => ({ value: p, label: p })), []);

  const valid =
    firstName.trim() &&
    lastName.trim() &&
    /\S+@\S+\.\S+/.test(email.trim()) &&
    phone.replace(/\D+/g, "").length >= 10 &&
    facilityId &&
    profession &&
    staffId.trim() &&
    password.length >= 8;

  const submit = async () => {
    if (!facilityId || !profession) return;
    setBusy(true);
    setError(null);
    try {
      await registerChw({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        facilityId: Number(facilityId),
        profession,
        staffId: staffId.trim(),
        password,
      });
      router.replace("/chw/pending" as Href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create a health worker account"
      sub="Your facility or NICRAT will check who you are before you can see any cases. We'll email you when you're approved."
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/chw/login" as Href))}
    >
      <View style={styles.privacy}>
        <Ionicons name="lock-closed-outline" size={18} color={chw.teal} />
        <Text style={styles.privacyText}>
          All the information you give us is treated as confidential. It is only used to verify you and to manage the cases you support.
        </Text>
      </View>

      <AuthField label="First name" value={firstName} onChangeText={setFirstName} autoComplete="given-name" />
      <AuthField label="Last name" value={lastName} onChangeText={setLastName} autoComplete="family-name" />
      <AuthField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <AuthField label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0803 123 4567" autoComplete="tel" />
      <PickerField
        label="Your facility"
        placeholder="Choose your hospital or PHC"
        options={facilityOptions}
        value={facilityId}
        onChange={setFacilityId}
        searchable
        loading={facilitiesLoading}
        emptyText="No facilities found."
      />
      <PickerField label="Your profession" placeholder="Choose your profession" options={professionOptions} value={profession} onChange={setProfession} />
      <AuthField label="Staff ID" value={staffId} onChangeText={setStaffId} placeholder="Your staff or employee ID" autoCapitalize="characters" />
      <AuthField label="Password" value={password} onChangeText={setPassword} secure placeholder="At least 8 characters" autoComplete="new-password" />
      {error ? <AuthError>{error}</AuthError> : null}
      <AuthButton label={busy ? "Sending…" : "Create account"} disabled={busy || !valid} onPress={() => void submit()} />
      <AuthLink label="Already have an account? Sign in" onPress={() => router.replace("/chw/login" as Href)} />
      <AuthLink
        label="I'm not a health worker"
        onPress={() => {
          void clearRole();
          router.replace("/role" as Href);
        }}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  privacy: { flexDirection: "row", gap: 10, backgroundColor: chw.tealSoft, borderRadius: 14, padding: 14 },
  privacyText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: "#29243B" },
});
