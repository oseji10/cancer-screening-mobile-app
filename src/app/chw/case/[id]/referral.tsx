import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { DateField } from "../../../../components/chw/DateField";
import { PickerField } from "../../../../components/chw/PickerField";
import { Body, Callout, ChwScreen, ErrorText, InfoCard, PrimaryButton, Title } from "../../../../components/chw/ui";
import { useChw } from "../../../../lib/chw/ChwContext";
import { useFacilities } from "../../../../lib/chw/useFacilities";

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Step 3: only when the PHC found a concerning change. */
export default function Referral() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { find, completeReferral } = useChw();
  const c = find(String(id));
  const { facilities, loading, error: loadError } = useFacilities();
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(c?.referralDate && /^\d{4}-\d{2}-\d{2}$/.test(c.referralDate) ? c.referralDate : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const back = () => (router.canGoBack() ? router.back() : router.replace(`/chw/case/${id}` as Href));

  const options = useMemo(
    () => facilities.map((f) => ({ value: String(f.id), label: f.name, sub: [f.lga, f.state].filter(Boolean).join(", ") || undefined })),
    [facilities],
  );
  // Pre-select the facility saved earlier, if it is in the list.
  const selected = facilityId ?? (c?.referralFacility ? options.find((o) => o.label === c.referralFacility)?.value ?? null : null);

  if (!c) return <ChwScreen title="Referral" onBack={back}><Body>Case not found.</Body></ChwScreen>;

  const complete = async () => {
    const f = facilities.find((x) => String(x.id) === selected);
    if (!f || !date) return;
    setBusy(true);
    const err = await completeReferral(c.id, f.name, date, f.id);
    setBusy(false);
    if (err) setError(err);
    else back();
  };

  return (
    <ChwScreen title="Referral" onBack={back} step={3}>
      <Title sub="This step is only required because a concerning change was identified.">Refer Patient {c.id}</Title>
      <InfoCard title="Reason for referral">
        <Body>A lump or concerning change was identified during the PHC assessment.</Body>
      </InfoCard>
      <View style={{ marginTop: 6 }}>
        <PickerField
          label="Secondary facility"
          placeholder="Choose the facility she is referred to"
          options={options}
          value={selected}
          onChange={setFacilityId}
          searchable
          loading={loading}
          emptyText="No facilities found."
        />
      </View>
      {loadError ? <ErrorText>{loadError}</ErrorText> : null}
      <DateField label="Referral date" value={date} onChange={setDate} minDate={todayIso()} placeholder="Choose the appointment date" />
      <Callout title="Support her through the referral">
        Explain why she is being referred, answer questions and help her understand where she needs to go next.
      </Callout>
      {error ? <ErrorText>{error}</ErrorText> : null}
      <PrimaryButton label={busy ? "Saving…" : "Mark referral as completed"} disabled={!selected || !date || busy} onPress={() => void complete()} />
    </ChwScreen>
  );
}
