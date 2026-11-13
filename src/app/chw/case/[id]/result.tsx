import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthField } from "../../../../components/chw/AuthShell";
import { DateField, formatIsoDay } from "../../../../components/chw/DateField";
import { PickerField } from "../../../../components/chw/PickerField";
import { Body, ChwScreen, ErrorText, PrimaryButton, Title } from "../../../../components/chw/ui";
import { fonts } from "../../../../constants/theme";
import { useChw } from "../../../../lib/chw/ChwContext";
import {
  deriveResult,
  extraOptions,
  extraVisible,
  FINDING,
  inconclusiveRun,
  nextStep,
  resultLabel,
  Sample,
  ScreeningData,
  ScreeningTest,
} from "../../../../lib/chw/screening";
import { chw } from "../../../../lib/chw/theme";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Record (or correct) a screening result, with the fields the NCSR catalogue defines for the test. */
export default function RecordResult() {
  const router = useRouter();
  const { id, sample: sampleId } = useLocalSearchParams<{ id: string; sample: string }>();
  const { find, request } = useChw();
  const c = find(String(id));
  const [sample, setSample] = useState<Sample | null>(null);
  const [test, setTest] = useState<ScreeningTest | null>(null);
  const [resultDate, setResultDate] = useState<string | null>(today());
  const [result, setResult] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [detail, setDetail] = useState<string | null>(null);
  const [meta, setMeta] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Sample | null>(null);
  const back = () => (router.canGoBack() ? router.back() : router.replace(`/chw/case/${id}/tests` as Href));

  useEffect(() => {
    if (!c?.serverId) return;
    Promise.all([request<{ data: ScreeningData }>(`/bloom-chw/cases/${c.serverId}/screening`), request<{ data: ScreeningTest[] }>("/bloom-chw/screening-tests")])
      .then(([scr, cat]) => {
        const s = scr.data.samples.find((x) => String(x.sampleId) === String(sampleId)) ?? null;
        setSample(s);
        setTest(s ? cat.data.find((t) => t.key === s.testType) ?? null : null);
        if (s?.status === "result_released") {
          setResultDate(s.resultDate);
          setResult(s.result);
          setValue(s.resultValue != null ? String(s.resultValue) : "");
          setDetail(s.resultDetail);
          setMeta(s.resultMeta ?? {});
          setNotes(s.resultNotes ?? "");
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load the sample."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c?.serverId, sampleId]);

  const derived = test?.value && value !== "" ? deriveResult(test, parseFloat(value)) : null;
  const runInvalid = !!test && inconclusiveRun(test, meta);
  const effective = runInvalid ? null : test?.value ? derived : result;
  const needsDetail = !!test?.detail && !!effective && test.detail.requiredFor.includes(effective);
  const visibleExtras = useMemo(() => (test?.extraFields ?? []).filter((f) => extraVisible(f, meta)), [test, meta]);

  if (!c) return <ChwScreen title="Result" onBack={back}><Body>Case not found.</Body></ChwScreen>;
  if (!sample || !test) return <ChwScreen title="Result" onBack={back}>{error ? <ErrorText>{error}</ErrorText> : <Body>Loading…</Body>}</ChwScreen>;

  const missing = (): string | null => {
    for (const f of visibleExtras) if (f.required && !String(meta[f.name] ?? "").trim()) return `Select or enter: ${f.label}.`;
    if (!runInvalid) {
      if (test.value) {
        const v = parseFloat(value);
        if (Number.isNaN(v)) return `Enter the ${test.value.label}.`;
        if (v < test.value.min || v > test.value.max) return `${test.value.label} looks out of range.`;
      } else if (!result) return "Select the result.";
    }
    if (needsDetail && !detail) return `Select the ${test.detail!.label.toLowerCase()}.`;
    if (!resultDate) return "Choose the date the result was released.";
    return null;
  };

  const save = async () => {
    const m = missing();
    if (m) {
      setError(m);
      return;
    }
    setBusy(true);
    setError(null);
    const cleanMeta: Record<string, string> = {};
    for (const f of test.extraFields ?? []) if (extraVisible(f, meta) && meta[f.name] !== undefined && meta[f.name] !== "") cleanMeta[f.name] = meta[f.name];
    const payload: Record<string, unknown> = { resultDate, resultNotes: notes.trim() || null };
    if (test.extraFields?.length) payload.resultMeta = cleanMeta;
    if (runInvalid) payload.result = null;
    else if (test.value) payload.resultValue = parseFloat(value);
    else payload.result = result;
    if (test.detail && needsDetail) payload[test.detail.name] = detail;
    try {
      const res = await request<{ data: Sample }>(`/bloom-chw/samples/${sample.sampleId}/result`, "PATCH", payload);
      setSaved(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the result.");
    } finally {
      setBusy(false);
    }
  };

  if (saved) {
    const step = nextStep(test, saved.result, saved.resultMeta);
    const f = FINDING[saved.resultSeverity ?? "neutral"];
    return (
      <ChwScreen title={test.label} onBack={back}>
        <View style={styles.done}>
          <Ionicons name="checkmark-circle" size={56} color={chw.teal} />
          <Text style={styles.doneTitle}>Result recorded</Text>
          <View style={[styles.chip, { backgroundColor: f.bg }]}>
            <Text style={[styles.chipText, { color: f.color }]}>{resultLabel(test, saved.result) || f.label}</Text>
          </View>
          <Text style={styles.doneSub}>Released {formatIsoDay(saved.resultDate)} · saved in NCSR and Bloom</Text>
        </View>
        <View style={[styles.step, step.tone === "warn" ? styles.stepWarn : step.tone === "info" ? styles.stepInfo : styles.stepOk]}>
          <Text style={styles.stepText}>{step.text}</Text>
        </View>
        <PrimaryButton label="Done" onPress={back} />
      </ChwScreen>
    );
  }

  const setM = (name: string, v: string) => setMeta((p) => ({ ...p, [name]: v }));

  return (
    <ChwScreen title={test.label} onBack={back}>
      <Title sub={`${sample.sampleRef ?? ""} · ${test.kind === "procedure" ? "performed" : "sample taken"} ${formatIsoDay(sample.sampleDate)}`}>
        {sample.status === "result_released" ? "Update result" : "Record result"}
      </Title>
      <View style={{ gap: 12 }}>
        <DateField label="Date result released *" value={resultDate} onChange={setResultDate} minDate={sample.sampleDate ?? undefined} maxDate={today()} />

        {visibleExtras.map((f) =>
          f.type === "select" ? (
            <PickerField
              key={f.name}
              label={`${f.label}${f.required ? " *" : " (optional)"}`}
              placeholder="Select"
              options={extraOptions(f)}
              value={meta[f.name] ?? null}
              onChange={(v) => setM(f.name, v)}
            />
          ) : (
            <AuthField
              key={f.name}
              label={`${f.label}${f.required ? " *" : " (optional)"}`}
              value={meta[f.name] ?? ""}
              onChangeText={(v) => setM(f.name, v)}
              keyboardType={f.type === "number" ? "decimal-pad" : "default"}
            />
          ),
        )}

        {runInvalid ? (
          <Text style={styles.info}>The run is not valid, so this will be saved as inconclusive and a repeat test will be needed.</Text>
        ) : test.value ? (
          <>
            <AuthField label={`${test.value.label} (${test.value.unit}) *`} value={value} onChangeText={setValue} keyboardType="decimal-pad" />
            {derived ? <Text style={styles.info}>Result: {resultLabel(test, derived)}</Text> : null}
          </>
        ) : (
          <PickerField
            label="Result *"
            placeholder="Select"
            options={test.results.map((r) => ({ value: r.value, label: r.label }))}
            value={result}
            onChange={(v) => {
              setResult(v);
              setDetail(null);
            }}
          />
        )}

        {needsDetail && test.detail ? (
          <PickerField label={`${test.detail.label} *`} placeholder="Select" options={test.detail.options} value={detail} onChange={setDetail} />
        ) : null}

        <AuthField label="Notes (optional)" value={notes} onChangeText={setNotes} multiline />
      </View>
      {error ? <ErrorText>{error}</ErrorText> : null}
      <PrimaryButton label={busy ? "Saving…" : sample.status === "result_released" ? "Update result" : "Save result"} disabled={busy} onPress={() => void save()} />
    </ChwScreen>
  );
}

const styles = StyleSheet.create({
  done: { alignItems: "center", gap: 8, paddingVertical: 20 },
  doneTitle: { fontFamily: fonts.bold, fontSize: 22, color: chw.text },
  doneSub: { fontFamily: fonts.regular, fontSize: 14, color: chw.muted, textAlign: "center" },
  chip: { borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 },
  chipText: { fontFamily: fonts.semibold, fontSize: 14 },
  step: { borderRadius: 14, padding: 14, borderWidth: 1 },
  stepOk: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  stepWarn: { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" },
  stepInfo: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  stepText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: chw.text },
  info: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: "#1E40AF" },
});
