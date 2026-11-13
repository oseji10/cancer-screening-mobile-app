import { Ionicons } from "@expo/vector-icons";
import { Href, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AuthField } from "../../../../components/chw/AuthShell";
import { DeleteSampleSheet } from "../../../../components/chw/DeleteSampleSheet";
import { formatIsoDay } from "../../../../components/chw/DateField";
import { Body, Callout, ChwScreen, ErrorText, InfoCard, PrimaryButton, Section, Title } from "../../../../components/chw/ui";
import { fonts } from "../../../../constants/theme";
import { useChw } from "../../../../lib/chw/ChwContext";
import { collectNoun, FINDING, resultLabel, Sample, ScreeningData, ScreeningTest } from "../../../../lib/chw/screening";
import { chw } from "../../../../lib/chw/theme";

/**
 * Breast screening for one woman: her NCSR registration, the tests she can have (from the NCSR catalogue),
 * and every sample/result. Everything saved here goes to the NCSR registry and the Bloom registry.
 */
export default function CaseTests() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { find, live, request, refresh } = useChw();
  const c = find(String(id));
  const [data, setData] = useState<ScreeningData | null>(null);
  const [tests, setTests] = useState<ScreeningTest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [age, setAge] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<Sample | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const back = () => (router.canGoBack() ? router.back() : router.replace(`/chw/case/${id}` as Href));

  const load = useCallback(async () => {
    if (!live || !c?.serverId) return;
    try {
      const [scr, cat] = await Promise.all([
        request<{ data: ScreeningData }>(`/bloom-chw/cases/${c.serverId}/screening`),
        tests.length ? Promise.resolve({ data: tests }) : request<{ data: ScreeningTest[] }>("/bloom-chw/screening-tests"),
      ]);
      setData(scr.data);
      setTests(cat.data);
      setError(null);
      if (!scr.data.client) {
        setAge((a) => a || (scr.data.defaults.age ? String(scr.data.defaults.age) : ""));
        setState((s) => s || scr.data.defaults.stateOfResidence || "");
        setLga((l) => l || scr.data.defaults.lgaOfResidence || "");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load screening.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, c?.serverId, request]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!c) return <ChwScreen title="Breast screening" onBack={back}><Body>Case not found.</Body></ChwScreen>;
  if (!live) {
    return (
      <ChwScreen title="Breast screening" onBack={back}>
        <Callout title="Needs the NCSR connection">Samples and results are saved in the NCSR registry, so this works once the app is connected to NCSR.</Callout>
      </ChwScreen>
    );
  }

  const register = async () => {
    if (!c.serverId) return;
    setBusy(true);
    setError(null);
    try {
      await request(`/bloom-chw/cases/${c.serverId}/ncsr-client`, "POST", {
        age: age ? Number(age) : undefined,
        stateOfResidence: state.trim() || undefined,
        lgaOfResidence: lga.trim() || undefined,
        address: address.trim() || undefined,
      });
      await load();
      void refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not register her.");
    } finally {
      setBusy(false);
    }
  };

  const testOf = (key: string) => tests.find((t) => t.key === key);

  // Uses the NCSR deletion rules: no result yet = delete now; result recorded = request for an admin.
  const removeSample = async (s: Sample, reason: string): Promise<string | null> => {
    try {
      if (s.status === "result_released") {
        await request(`/screening-samples/${s.sampleId}/deletion-request`, "POST", { reason });
        setNotice("Deletion request sent. An NCSR admin has to approve it.");
      } else {
        await request(`/screening-samples/${s.sampleId}`, "DELETE", { reason, confirm: true });
        setNotice("Deleted. An admin can restore it from Deleted Records if needed.");
      }
      setDeleting(null);
      await load();
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Could not complete the request.";
    }
  };
  const go = (path: string) => router.push(`/chw/case/${c.id}/${path}` as Href);

  return (
    <ChwScreen title="Breast screening" onBack={back}>
      <Title sub="Take samples, perform tests and record results. They are saved in the NCSR registry and in Bloom.">{c.clientName ?? `Patient ${c.id}`}</Title>
      {error ? <ErrorText>{error}</ErrorText> : null}

      {!data ? (
        <Body>Loading…</Body>
      ) : !data.client ? (
        <View>
          <InfoCard title="Register her in NCSR">
            <Body>
              She needs an NCSR client record before samples can be saved. We'll check for an existing record with her phone or email first,
              and only create a new Client ID if none is found.
            </Body>
          </InfoCard>
          <View style={{ gap: 12 }}>
            <AuthField label="Age (years)" value={age} onChangeText={(v) => setAge(v.replace(/\D+/g, "").slice(0, 3))} keyboardType="number-pad" placeholder="e.g. 45" />
            <AuthField label="State of residence" value={state} onChangeText={setState} placeholder="e.g. Adamawa" />
            <AuthField label="LGA of residence" value={lga} onChangeText={setLga} placeholder="e.g. Mubi North" />
            <AuthField label="Address (optional)" value={address} onChangeText={setAddress} placeholder="House, street, town" />
          </View>
          <Text style={styles.hint}>State and LGA make up her Client ID. They start as your facility's; change them if she lives elsewhere.</Text>
          <PrimaryButton label={busy ? "Registering…" : "Register in NCSR"} disabled={busy || !age || !state.trim() || !lga.trim()} onPress={() => void register()} />
        </View>
      ) : (
        <>
          <View style={styles.client}>
            <Ionicons name="id-card-outline" size={22} color={chw.teal} />
            <View style={{ flex: 1 }}>
              <Text style={styles.clientLabel}>NCSR Client ID</Text>
              <Text style={styles.clientId} selectable>{data.client.clientId}</Text>
            </View>
          </View>

          <Section>Tests</Section>
          {tests.map((t) => {
            const mine = data.samples.filter((s) => s.testType === t.key);
            const waiting = mine.filter((s) => s.status === "collected").length;
            return (
              <View key={t.key} style={styles.test}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.testName}>{t.label}</Text>
                  <Text style={styles.testSub}>
                    {t.kind === "procedure" ? "Procedure / imaging" : "Lab sample"}
                    {waiting ? ` · ${waiting} awaiting result` : ""}
                  </Text>
                </View>
                <Pressable accessibilityRole="button" onPress={() => go(`sample?test=${t.key}`)} style={styles.testBtn}>
                  <Text style={styles.testBtnText}>{t.kind === "procedure" ? "Perform" : "Take sample"}</Text>
                </Pressable>
              </View>
            );
          })}

          <Section>Screenings done</Section>
          <View style={styles.who}>
            <View style={styles.whoItem}>
              <Text style={styles.whoLabel}>Client</Text>
              <Text style={styles.whoValue}>{data.client.fullName}</Text>
            </View>
            <View style={styles.whoItem}>
              <Text style={styles.whoLabel}>Client ID</Text>
              <Text style={styles.whoValue} selectable>{data.client.clientId}</Text>
            </View>
            <View style={styles.whoItem}>
              <Text style={styles.whoLabel}>Age</Text>
              <Text style={styles.whoValue}>{data.client.age != null ? `${data.client.age} yrs` : "—"}</Text>
            </View>
          </View>
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          {data.samples.length === 0 ? <Body>Nothing recorded yet.</Body> : null}
          {data.samples.map((s) => (
            <SampleRow key={s.sampleId} s={s} t={testOf(s.testType)} onResult={() => go(`result?sample=${s.sampleId}`)} onDelete={() => setDeleting(s)} />
          ))}
          <DeleteSampleSheet
            visible={!!deleting}
            label={deleting ? `${testOf(deleting.testType)?.label ?? deleting.testType} · ${deleting.sampleRef ?? ""}` : ""}
            hasResult={deleting?.status === "result_released"}
            onCancel={() => setDeleting(null)}
            onSubmit={(reason) => (deleting ? removeSample(deleting, reason) : Promise.resolve(null))}
          />
        </>
      )}
    </ChwScreen>
  );
}

function SampleRow({ s, t, onResult, onDelete }: { s: Sample; t?: ScreeningTest; onResult: () => void; onDelete: () => void }) {
  const done = s.status === "result_released";
  const f = FINDING[s.resultSeverity ?? "neutral"];
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.testName}>{t?.label ?? s.testType}</Text>
        <Text style={styles.testSub}>
          {s.sampleRef ?? "—"} · {s.status === "booked" ? "Booked for" : t ? (t.kind === "procedure" ? "Performed" : "Taken") : ""} {formatIsoDay(s.sampleDate)}
        </Text>
        {done ? (
          <View style={[styles.chip, { backgroundColor: f.bg }]}>
            <Text style={[styles.chipText, { color: f.color }]}>
              {resultLabel(t, s.result) || f.label}
              {s.resultValue != null && t?.value ? ` · ${s.resultValue} ${t.value.unit}` : ""}
            </Text>
          </View>
        ) : (
          <Text style={styles.waiting}>{s.status === "booked" ? "Booked" : "Awaiting result"}</Text>
        )}
        {!s.fromBloom ? <Text style={styles.testSub}>Recorded at the facility</Text> : null}
        {s.deletionPending ? (
          <Text style={styles.pending}>Deletion requested · waiting for an admin</Text>
        ) : s.fromBloom ? (
          <Pressable accessibilityRole="button" onPress={onDelete} hitSlop={8} style={styles.del}>
            <Ionicons name="trash-outline" size={14} color="#C23B3B" />
            <Text style={styles.delText}>{done ? "Request deletion" : "Delete"}</Text>
          </Pressable>
        ) : null}
      </View>
      {s.status === "collected" || (done && s.fromBloom) ? (
        <Pressable accessibilityRole="button" onPress={onResult} style={styles.testBtnGhost}>
          <Text style={styles.testBtnGhostText}>{done ? "Update" : "Record result"}</Text>
        </Pressable>
      ) : null}
      {t && s.status === "booked" ? <Text style={styles.testSub}>{collectNoun(t)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: chw.muted, marginTop: 10 },
  client: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, backgroundColor: chw.tealSoft, padding: 14 },
  clientLabel: { fontFamily: fonts.medium, fontSize: 12, color: chw.muted },
  clientId: { fontFamily: fonts.bold, fontSize: 17, color: chw.text, letterSpacing: 0.5 },
  test: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: chw.border, borderRadius: 16, padding: 14, marginBottom: 8 },
  testName: { fontFamily: fonts.semibold, fontSize: 15, color: chw.text },
  testSub: { fontFamily: fonts.regular, fontSize: 13, color: chw.muted },
  testBtn: { backgroundColor: chw.teal, borderRadius: 18, paddingHorizontal: 14, height: 36, justifyContent: "center" },
  testBtnText: { fontFamily: fonts.semibold, fontSize: 13, color: chw.white },
  testBtnGhost: { borderWidth: 1.5, borderColor: chw.teal, borderRadius: 18, paddingHorizontal: 12, height: 36, justifyContent: "center" },
  testBtnGhostText: { fontFamily: fonts.semibold, fontSize: 13, color: chw.teal },
  who: { flexDirection: "row", flexWrap: "wrap", gap: 12, borderWidth: 1, borderColor: chw.border, borderRadius: 14, padding: 12, marginBottom: 10 },
  whoItem: { minWidth: "28%", flexGrow: 1 },
  whoLabel: { fontFamily: fonts.medium, fontSize: 12, color: chw.muted },
  whoValue: { fontFamily: fonts.semibold, fontSize: 14, color: chw.text, marginTop: 2 },
  notice: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: chw.teal, marginBottom: 8 },
  pending: { fontFamily: fonts.semibold, fontSize: 12, color: "#B45309", marginTop: 4 },
  del: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  delText: { fontFamily: fonts.semibold, fontSize: 12, color: "#C23B3B" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: chw.card, borderRadius: 16, padding: 14, marginBottom: 8 },
  chip: { alignSelf: "flex-start", borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  chipText: { fontFamily: fonts.semibold, fontSize: 12 },
  waiting: { fontFamily: fonts.semibold, fontSize: 12, color: chw.amber, marginTop: 4 },
});
