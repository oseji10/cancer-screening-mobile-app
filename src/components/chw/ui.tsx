import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "../../constants/theme";
import { ChwCase, STAGE_LABEL, STAGE_STATUS, StepStatus, stageOf, stepStatusText } from "../../lib/chw/cases";
import { chw } from "../../lib/chw/theme";

/** Full screen with a back bar, optional step progress and scrolling content. */
export function ChwScreen({ title, onBack, step, children }: { title: string; onBack: () => void; step?: number; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <View style={s.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={s.back} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={chw.teal} />
        </Pressable>
        <Text style={s.topBarTitle}>{title}</Text>
        <View style={s.back} />
      </View>
      {step ? (
        <View style={s.stepHeader}>
          <View style={s.stepTrack}>
            <View style={[s.stepFill, { width: `${(step / 4) * 100}%` }]} />
          </View>
          <Text style={s.stepText}>Step {step} of 4</Text>
        </View>
      ) : null}
      <KeyboardAwareScrollView bottomOffset={24} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 32 }]}>
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}

export function Title({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <View style={{ marginTop: 6, marginBottom: 16 }}>
      <Text style={s.screenTitle}>{children}</Text>
      {sub ? <Text style={s.screenSubtitle}>{sub}</Text> : null}
    </View>
  );
}

export function Section({ children }: { children: ReactNode }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={s.infoCard}>
      <Text style={s.infoTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.detail}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  );
}

export function Body({ children }: { children: ReactNode }) {
  return <Text style={s.bodyText}>{children}</Text>;
}

export function Callout({ title, children, tone = "teal" }: { title: string; children: ReactNode; tone?: "teal" | "danger" }) {
  return (
    <View style={[s.callout, tone === "danger" && { backgroundColor: chw.dangerLight }]}>
      <Text style={[s.calloutTitle, tone === "danger" && { color: chw.danger }]}>{title}</Text>
      <Text style={s.calloutText}>{children}</Text>
    </View>
  );
}

export function Check({ text, checked, onPress, last }: { text: string; checked: boolean; onPress: () => void; last?: boolean }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} style={[s.checkRow, last && { borderBottomWidth: 0 }]} onPress={onPress}>
      <View style={[s.checkbox, checked && s.checkboxChecked]}>{checked ? <Ionicons name="checkmark" size={15} color={chw.white} /> : null}</View>
      <Text style={s.checkText}>{text}</Text>
    </Pressable>
  );
}

export function Radio({ label, selected, onPress, last }: { label: string; selected: boolean; onPress: () => void; last?: boolean }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected }} style={[s.checkRow, last && { borderBottomWidth: 0 }]} onPress={onPress}>
      <View style={[s.radio, selected && { borderColor: chw.teal }]}>{selected ? <View style={s.radioDot} /> : null}</View>
      <Text style={s.checkText}>{label}</Text>
    </Pressable>
  );
}

export function ListCard({ children }: { children: ReactNode }) {
  return <View style={s.listCard}>{children}</View>;
}

export function Field(props: TextInputProps & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={s.sectionTitle}>{label}</Text>
      <TextInput placeholderTextColor="#A7A2B3" style={[s.input, rest.multiline && s.notes, style]} {...rest} />
    </View>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <Text style={s.error}>{children}</Text>;
}

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={[s.primary, disabled && { opacity: 0.45 }]}>
      <Text style={s.primaryText}>{label}</Text>
    </Pressable>
  );
}

/** A case in a list: code, community, stage and status. */
export function CaseRow({ item, onPress }: { item: ChwCase; onPress: () => void }) {
  const stage = stageOf(item);
  const status = STAGE_STATUS[stage];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Case ${item.id}`} style={({ pressed }) => [s.caseCard, pressed && { opacity: 0.8 }]} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={s.caseId}>{item.id}</Text>
        <Text style={s.caseCommunity}>{item.community}</Text>
        <Text style={s.caseStage}>{STAGE_LABEL[stage]} · {item.screening}</Text>
      </View>
      <View style={s.caseRight}>
        <Text style={[s.caseStatus, { color: status.color }]}>{status.text}</Text>
        <Ionicons name="chevron-forward" size={19} color="#A5A2AE" />
      </View>
    </Pressable>
  );
}

/** One row of the 4-step case timeline. */
export function TimelineRow({ index, title, status, last, enabled, onPress }: { index: number; title: string; status: StepStatus; last: boolean; enabled: boolean; onPress: () => void }) {
  const done = status === "completed";
  const active = status === "in-progress";
  const skipped = status === "not-needed";
  const color = done ? chw.teal : active ? chw.purple : chw.faint;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !enabled }} style={s.tlRow} onPress={onPress} disabled={!enabled}>
      <View style={s.tlColumn}>
        <View style={[s.tlCircle, done && { backgroundColor: chw.teal, borderColor: chw.teal }, active && { backgroundColor: "#EEE9FC", borderColor: chw.purple }, skipped && { backgroundColor: "#F0EEF2", borderColor: "#DDD9E3" }]}>
          {done ? <Ionicons name="checkmark" size={16} color={chw.white} /> : <Text style={[s.tlNumber, active && { color: chw.purple }]}>{index + 1}</Text>}
        </View>
        {!last ? <View style={[s.tlLine, done && { backgroundColor: "#B6E8DC" }]} /> : null}
      </View>
      <View style={{ flex: 1, marginLeft: 12, paddingBottom: last ? 0 : 14 }}>
        <Text style={[s.tlTitle, { color: skipped ? chw.faint : chw.text }]}>{title}</Text>
        <Text style={[s.tlStatus, { color }]}>{enabled || done || skipped ? stepStatusText(status) : "Locked until the step before is done"}</Text>
      </View>
      {enabled ? <Ionicons name="chevron-forward" size={18} color="#A6A1B1" /> : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: chw.white },
  content: { paddingHorizontal: 20 },
  topBar: { height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  topBarTitle: { flex: 1, textAlign: "center", fontFamily: fonts.bold, fontSize: 18, color: chw.text },
  stepHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12, marginBottom: 8 },
  stepTrack: { flex: 1, height: 6, borderRadius: 99, backgroundColor: "#E3EFEE", overflow: "hidden" },
  stepFill: { height: "100%", borderRadius: 99, backgroundColor: chw.teal },
  stepText: { fontFamily: fonts.medium, fontSize: 13, color: chw.muted },
  screenTitle: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, color: chw.text },
  screenSubtitle: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: chw.muted, marginTop: 6 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 17, color: chw.ink, marginTop: 18, marginBottom: 10 },
  infoCard: { padding: 16, borderWidth: 1, borderColor: chw.border, borderRadius: 16, backgroundColor: chw.white, marginBottom: 12 },
  infoTitle: { fontFamily: fonts.bold, fontSize: 15, color: chw.text, marginBottom: 8 },
  detail: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  detailLabel: { fontFamily: fonts.regular, fontSize: 14, color: chw.muted },
  detailValue: { flex: 1, textAlign: "right", fontFamily: fonts.semibold, fontSize: 14, color: chw.text, marginLeft: 16 },
  bodyText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: chw.muted },
  callout: { backgroundColor: chw.tealSoft, borderRadius: 16, padding: 16, marginTop: 14 },
  calloutTitle: { fontFamily: fonts.bold, fontSize: 15, color: chw.text },
  calloutText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: chw.muted, marginTop: 5 },
  listCard: { borderWidth: 1, borderColor: chw.border, borderRadius: 16, paddingHorizontal: 14, backgroundColor: chw.white },
  checkRow: { minHeight: 56, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#F0EDF4", paddingVertical: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: "#CCC7D8", alignItems: "center", justifyContent: "center", marginRight: 12 },
  checkboxChecked: { backgroundColor: chw.teal, borderColor: chw.teal },
  checkText: { flex: 1, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: chw.text },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: "#CFC9DD", alignItems: "center", justifyContent: "center", marginRight: 12 },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: chw.teal },
  input: { minHeight: 50, borderWidth: 1, borderColor: chw.border, borderRadius: 14, paddingHorizontal: 14, fontFamily: fonts.regular, fontSize: 15, color: chw.text },
  notes: { minHeight: 110, paddingTop: 12, textAlignVertical: "top" },
  error: { fontFamily: fonts.medium, fontSize: 14, color: "#C23B3B", marginTop: 14 },
  primary: { height: 54, borderRadius: 27, backgroundColor: chw.teal, alignItems: "center", justifyContent: "center", marginTop: 22 },
  primaryText: { fontFamily: fonts.semibold, fontSize: 16, color: chw.white },
  caseCard: { minHeight: 78, backgroundColor: chw.card, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center" },
  caseId: { fontFamily: fonts.bold, fontSize: 16, color: "#202020" },
  caseCommunity: { fontFamily: fonts.regular, fontSize: 14, color: "#666666", marginTop: 3 },
  caseStage: { fontFamily: fonts.regular, fontSize: 12, color: "#888888", marginTop: 3 },
  caseRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  caseStatus: { fontFamily: fonts.semibold, fontSize: 12 },
  tlRow: { flexDirection: "row", alignItems: "flex-start", minHeight: 64 },
  tlColumn: { width: 30, alignItems: "center", alignSelf: "stretch" },
  tlCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: chw.white, borderWidth: 1.5, borderColor: "#D5D0E2", alignItems: "center", justifyContent: "center" },
  tlNumber: { fontFamily: fonts.bold, fontSize: 13, color: chw.faint },
  tlLine: { flex: 1, width: 2, backgroundColor: "#DDD8E7", marginVertical: 2 },
  tlTitle: { fontFamily: fonts.semibold, fontSize: 15 },
  tlStatus: { fontFamily: fonts.regular, fontSize: 13, marginTop: 3 },
});
