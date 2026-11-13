import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthField } from "../../../../components/chw/AuthShell";
import { DateField } from "../../../../components/chw/DateField";
import { PickerField } from "../../../../components/chw/PickerField";
import { Body, ChwScreen, ErrorText, PrimaryButton, Title } from "../../../../components/chw/ui";
import { fonts } from "../../../../constants/theme";
import { useChw } from "../../../../lib/chw/ChwContext";
import { collectDateLabel, collectNoun, Sample, ScreeningTest } from "../../../../lib/chw/screening";
import { chw } from "../../../../lib/chw/theme";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Take a sample / perform a test (same fields as the web app's pop-up). */
export default function TakeSample() {
  const router = useRouter();
  const { id, test: testKey } = useLocalSearchParams<{ id: string; test: string }>();
  const { find, request, user } = useChw();
  const c = find(String(id));
  const [test, setTest] = useState<ScreeningTest | null>(null);
  const [sampleDate, setSampleDate] = useState<string | null>(today());
  const [specimenType, setSpecimenType] = useState<string | null>(null);
  const [collectionMethod, setCollectionMethod] = useState<string | null>(null);
  const [labSampleNumber, setLabSampleNumber] = useState("");
  const [collectedBy, setCollectedBy] = useState(user ? `${user.firstName} ${user.lastName}` : "");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Sample | null>(null);
  const back = () => (router.canGoBack() ? router.back() : router.replace(`/chw/case/${id}/tests` as Href));

  useEffect(() => {
    request<{ data: ScreeningTest[] }>("/bloom-chw/screening-tests")
      .then((r) => setTest(r.data.find((t) => t.key === testKey) ?? null))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load the test."));
  }, [request, testKey]);

  if (!c) return <ChwScreen title="Screening" onBack={back}><Body>Case not found.</Body></ChwScreen>;
  if (!test) return <ChwScreen title="Screening" onBack={back}>{error ? <ErrorText>{error}</ErrorText> : <Body>Loading…</Body>}</ChwScreen>;

  const needsSpecimen = !!test.specimenTypes?.length;
  const needsMethod = !!test.collectionMethods?.length;
  const valid = !!sampleDate && (!needsSpecimen || !!specimenType) && (!needsMethod || !!collectionMethod);

  const save = async () => {
    if (!c.serverId || !sampleDate) return;
    setBusy(true);
    setError(null);
    try {
      const res = await request<{ data: Sample }>(`/bloom-chw/cases/${c.serverId}/samples`, "POST", {
        testType: test.key,
        sampleDate,
        specimenType,
        collectionMethod,
        labSampleNumber: labSampleNumber.trim() || null,
        collectedBy: collectedBy.trim() || null,
        notes: notes.trim() || null,
      });
      setSaved(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  if (saved) {
    return (
      <ChwScreen title={test.label} onBack={back}>
        <View style={styles.done}>
          <Ionicons name="checkmark-circle" size={56} color={chw.teal} />
          <Text style={styles.doneTitle}>{collectNoun(test) === "test" ? "Test recorded" : "Sample recorded"}</Text>
          <Text style={styles.doneSub}>Saved in NCSR and Bloom. {test.kind === "procedure" ? "Write this reference on the request form." : "Write this reference on the sample and the lab form."}</Text>
          <Text style={styles.ref} selectable>{saved.sampleRef}</Text>
        </View>
        <PrimaryButton label="Record the result now" onPress={() => router.replace(`/chw/case/${c.id}/result?sample=${saved.sampleId}` as Href)} />
        <PrimaryButton label="Done" onPress={back} />
      </ChwScreen>
    );
  }

  return (
    <ChwScreen title={test.label} onBack={back}>
      <Title sub={test.kind === "procedure" ? "Procedure / imaging" : "Lab sample"}>{test.kind === "procedure" ? "Perform test" : "Take a sample"}</Title>
      <View style={{ gap: 12 }}>
        <DateField label={`${collectDateLabel(test)} *`} value={sampleDate} onChange={setSampleDate} maxDate={today()} />
        {needsSpecimen ? (
          <PickerField label="Specimen type *" placeholder="Select" options={test.specimenTypes!.map((s) => ({ value: s, label: s }))} value={specimenType} onChange={setSpecimenType} />
        ) : null}
        {needsMethod ? (
          <PickerField label="Collection method *" placeholder="Select" options={test.collectionMethods!} value={collectionMethod} onChange={setCollectionMethod} />
        ) : null}
        <AuthField label={`${test.kind === "procedure" ? "Request / accession number" : "Lab / barcode number"} (optional)`} value={labSampleNumber} onChangeText={setLabSampleNumber} />
        <AuthField label={`${test.kind === "procedure" ? "Performed by" : "Collected by"} (optional)`} value={collectedBy} onChangeText={setCollectedBy} />
        <AuthField label="Notes (optional)" value={notes} onChangeText={setNotes} multiline />
      </View>
      {error ? <ErrorText>{error}</ErrorText> : null}
      <PrimaryButton label={busy ? "Saving…" : `Save ${collectNoun(test)}`} disabled={busy || !valid} onPress={() => void save()} />
    </ChwScreen>
  );
}

const styles = StyleSheet.create({
  done: { alignItems: "center", gap: 8, paddingVertical: 24 },
  doneTitle: { fontFamily: fonts.bold, fontSize: 22, color: chw.text },
  doneSub: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: chw.muted, textAlign: "center" },
  ref: { fontFamily: fonts.bold, fontSize: 20, letterSpacing: 1.5, color: chw.teal, backgroundColor: chw.tealSoft, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginTop: 6 },
});
