import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { Body, Callout, ErrorText, Check, ChwScreen, Field, ListCard, PrimaryButton, Section, Title } from "../../../../components/chw/ui";
import { useChw } from "../../../../lib/chw/ChwContext";

const ITEMS = [
  "Explain why the PHC visit is important",
  "Answer her questions",
  "Address her concerns",
  "Agree on a convenient time",
  "Provide the PHC location and directions",
];

/** Step 1: help her get to the PHC. */
export default function CommunityFollowUp() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { find, completeCommunity } = useChw();
  const c = find(String(id));
  const done = c?.steps[0] === "completed";
  const [checks, setChecks] = useState<boolean[]>(ITEMS.map(() => done));
  const [notes, setNotes] = useState(c?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const back = () => (router.canGoBack() ? router.back() : router.replace(`/chw/case/${id}` as Href));

  if (!c) return <ChwScreen title="Community follow-up" onBack={back}><Body>Case not found.</Body></ChwScreen>;

  const toggle = (i: number) => setChecks((cur) => cur.map((v, j) => (j === i ? !v : v)));
  const complete = async () => {
    setBusy(true);
    const err = await completeCommunity(c.id, notes.trim());
    setBusy(false);
    if (err) setError(err);
    else back();
  };

  return (
    <ChwScreen title="Community follow-up" onBack={back} step={1}>
      <Title sub="Help her come to the PHC and make sure she understands why the visit is important.">Support Patient {c.id}</Title>
      <Callout title="Conversation guide">Listen first. Explain clearly. Encourage questions. Make sure she understands the next step.</Callout>
      <Section>Before the PHC visit</Section>
      <ListCard>
        {ITEMS.map((t, i) => (
          <Check key={t} text={t} checked={checks[i]} onPress={() => toggle(i)} last={i === ITEMS.length - 1} />
        ))}
      </ListCard>
      <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Add a note (no names, please)…" multiline />
      {error ? <ErrorText>{error}</ErrorText> : null}
      <PrimaryButton label={busy ? "Saving…" : done ? "Save notes" : "Mark as completed"} disabled={busy || (!done && !checks.every(Boolean))} onPress={() => void complete()} />
    </ChwScreen>
  );
}
