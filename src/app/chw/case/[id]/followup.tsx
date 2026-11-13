import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { DateField, formatIsoDay } from "../../../../components/chw/DateField";
import { Body, Check, ErrorText, ChwScreen, Detail, InfoCard, ListCard, PrimaryButton, Section, Title } from "../../../../components/chw/ui";
import { useChw } from "../../../../lib/chw/ChwContext";

const ACTIONS = ["Confirm she attended", "Check the outcome", "Support her with the next step"];

/** Step 4: make sure she reached the next point of care. */
export default function FollowUp() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { find, completeFollowUp } = useChw();
  const c = find(String(id));
  const done = c?.steps[3] === "completed";
  const [checks, setChecks] = useState<boolean[]>(ACTIONS.map(() => done));
  const [date, setDate] = useState<string | null>(c?.followUpDate && /^\d{4}-\d{2}-\d{2}$/.test(c.followUpDate) ? c.followUpDate : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const back = () => (router.canGoBack() ? router.back() : router.replace(`/chw/case/${id}` as Href));

  if (!c) return <ChwScreen title="Follow-up" onBack={back}><Body>Case not found.</Body></ChwScreen>;

  const complete = async () => {
    setBusy(true);
    const err = await completeFollowUp(c.id, date ?? "");
    setBusy(false);
    if (err) setError(err);
    else back();
  };

  return (
    <ChwScreen title="Follow-up" onBack={back} step={4}>
      <Title sub="Make sure she reaches the next point of care and understands what happens next.">Continue supporting Patient {c.id}</Title>
      <InfoCard title="Referral">
        <Detail label="Facility" value={c.referralFacility || "Secondary facility"} />
        <Detail label="Date" value={c.referralDate ? formatIsoDay(c.referralDate) : "Not scheduled"} />
      </InfoCard>
      <Section>Follow-up actions</Section>
      <ListCard>
        {ACTIONS.map((t, i) => (
          <Check key={t} text={t} checked={checks[i]} onPress={() => setChecks((cur) => cur.map((v, j) => (j === i ? !v : v)))} last={i === ACTIONS.length - 1} />
        ))}
      </ListCard>
      <DateField label="Follow-up date" value={date} onChange={setDate} placeholder="When you checked on her" />
      {error ? <ErrorText>{error}</ErrorText> : null}
      <PrimaryButton label={busy ? "Saving…" : "Mark follow-up as completed"} disabled={busy || !checks.every(Boolean)} onPress={() => void complete()} />
    </ChwScreen>
  );
}
