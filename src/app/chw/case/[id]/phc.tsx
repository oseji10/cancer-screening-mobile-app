import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Body, Callout, ErrorText, ChwScreen, ListCard, PrimaryButton, Radio, Section, Title } from "../../../../components/chw/ui";
import { fonts } from "../../../../constants/theme";
import { useChw } from "../../../../lib/chw/ChwContext";
import { chw } from "../../../../lib/chw/theme";

type Choice = "no-change" | "concerning-change";

/** Step 2: record what the PHC found. */
export default function PhcScreening() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { find, completePhc } = useChw();
  const c = find(String(id));
  const [outcome, setOutcome] = useState<Choice | "">(c && c.outcome !== "pending" ? c.outcome : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const back = () => (router.canGoBack() ? router.back() : router.replace(`/chw/case/${id}` as Href));

  if (!c) return <ChwScreen title="PHC screening" onBack={back}><Body>Case not found.</Body></ChwScreen>;

  const complete = async () => {
    if (!outcome) return;
    setBusy(true);
    const err = await completePhc(c.id, outcome);
    setBusy(false);
    if (err) setError(err);
    else back();
  };

  return (
    <ChwScreen title="PHC screening" onBack={back} step={2}>
      <Title sub="Record what happened after the clinical screening.">Patient {c.id} at the PHC</Title>
      <View style={styles.box}>
        <Ionicons name="medical-outline" size={40} color={chw.teal} />
        <Text style={styles.boxTitle}>PHC screening</Text>
        <Text style={styles.boxSub}>Clinical assessment at {c.facility}</Text>
      </View>
      <PrimaryButton label="Record tests and results" onPress={() => router.push(`/chw/case/${c.id}/tests` as Href)} />
      <Section>Screening outcome</Section>
      <ListCard>
        <Radio label="No concerning change" selected={outcome === "no-change"} onPress={() => setOutcome("no-change")} />
        <Radio label="Lump or concerning change" selected={outcome === "concerning-change"} onPress={() => setOutcome("concerning-change")} last />
      </ListCard>
      {outcome === "concerning-change" ? (
        <Callout title="Referral required" tone="danger">
          The case will move to the referral step so you can support her access to the next facility.
        </Callout>
      ) : outcome === "no-change" ? (
        <Callout title="No referral needed">The case will close. Encourage her to keep checking her breasts every month and to come back if she notices a change.</Callout>
      ) : null}
      {error ? <ErrorText>{error}</ErrorText> : null}
      <PrimaryButton label={busy ? "Saving…" : "Mark as completed"} disabled={!outcome || busy} onPress={() => void complete()} />
    </ChwScreen>
  );
}

const styles = StyleSheet.create({
  box: { height: 150, borderRadius: 20, backgroundColor: chw.tealSoft, alignItems: "center", justifyContent: "center" },
  boxTitle: { fontFamily: fonts.bold, fontSize: 16, color: chw.text, marginTop: 8 },
  boxSub: { fontFamily: fonts.regular, fontSize: 13, color: chw.muted, marginTop: 3 },
});
