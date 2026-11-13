import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { fonts } from "../../constants/theme";
import { chw } from "../../lib/chw/theme";

/**
 * Delete a sample, or ask for it to be deleted. Same rules as the NCSR web app:
 *  - no result yet: delete straight away (after a reason and a tick);
 *  - result recorded: send a deletion request that an NCSR admin approves.
 * Nothing is removed for good; admins can restore it from Deleted Records.
 */
export function DeleteSampleSheet({
  visible,
  label,
  hasResult,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  label: string;
  hasResult: boolean;
  onCancel: () => void;
  /** Returns an error message, or null when it worked. */
  onSubmit: (reason: string) => Promise<string | null>;
}) {
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const direct = !hasResult;

  const close = () => {
    setReason("");
    setConfirmed(false);
    setError(null);
    onCancel();
  };

  const submit = async () => {
    if (reason.trim().length < 5) return setError("Give a short reason (at least 5 characters).");
    if (direct && !confirmed) return setError("Tick the box to confirm the deletion.");
    setBusy(true);
    setError(null);
    const err = await onSubmit(reason.trim());
    setBusy(false);
    if (err) setError(err);
    else {
      setReason("");
      setConfirmed(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView style={styles.backdrop} behavior="padding">
        <View style={styles.card}>
          <View style={styles.head}>
            <View style={styles.icon}>
              <Ionicons name="warning-outline" size={22} color="#C23B3B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{direct ? "Delete this record?" : "Request deletion"}</Text>
              <Text style={styles.sub}>
                {label}.{" "}
                {direct
                  ? "No result has been recorded for it yet. It will be hidden and kept in Deleted Records, where an admin can restore it."
                  : "A result has already been recorded, so an NCSR admin has to approve this before it is removed."}
              </Text>
            </View>
          </View>
          <Text style={styles.label}>Reason</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="e.g. Entered against the wrong client"
            placeholderTextColor="#A7A2B3"
            multiline
            style={styles.input}
          />
          {direct ? (
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: confirmed }} onPress={() => setConfirmed((v) => !v)} style={styles.check}>
              <View style={[styles.box, confirmed && styles.boxOn]}>{confirmed ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}</View>
              <Text style={styles.checkText}>I understand this removes the record from her results.</Text>
            </Pressable>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.row}>
            <Pressable accessibilityRole="button" onPress={close} disabled={busy} style={[styles.btn, styles.ghost]}>
              <Text style={styles.ghostText}>Cancel</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => void submit()} disabled={busy} style={[styles.btn, styles.danger, busy && { opacity: 0.6 }]}>
              <Text style={styles.dangerText}>{busy ? "Sending…" : direct ? "Delete" : "Send request"}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 20 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 18, gap: 10 },
  head: { flexDirection: "row", gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: 18, color: chw.text },
  sub: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: chw.muted, marginTop: 4 },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: chw.text, marginTop: 4 },
  input: { minHeight: 80, borderWidth: 1, borderColor: chw.border, borderRadius: 14, padding: 12, fontFamily: fonts.regular, fontSize: 15, color: chw.text, textAlignVertical: "top" },
  check: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: "#CCC7D8", alignItems: "center", justifyContent: "center", marginTop: 1 },
  boxOn: { backgroundColor: "#C23B3B", borderColor: "#C23B3B" },
  checkText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: chw.text },
  error: { fontFamily: fonts.medium, fontSize: 13, color: "#C23B3B" },
  row: { flexDirection: "row", gap: 10, marginTop: 6 },
  btn: { flex: 1, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  ghost: { borderWidth: 1.5, borderColor: chw.border },
  ghostText: { fontFamily: fonts.semibold, fontSize: 15, color: chw.text },
  danger: { backgroundColor: "#C23B3B" },
  dangerText: { fontFamily: fonts.semibold, fontSize: 15, color: "#FFFFFF" },
});
