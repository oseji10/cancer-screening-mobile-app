import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../../constants/theme";
import { AppointmentDto } from "../../lib/api/appointments";
import { errorMessage } from "../../lib/api/client";
import { useAppointments } from "../../lib/appointments/AppointmentsContext";
import { formatSlot, STATUS_LABEL } from "../../lib/appointments/format";

/**
 * "You have a booking" card for the Find tab: what was booked, where it stands,
 * and the options to change the time or cancel it.
 */
export function BookingCard({ appointment: a, compact = false }: { appointment: AppointmentDto; compact?: boolean }) {
  const router = useRouter();
  const { cancel, remind, hasReminder } = useAppointments();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reminded, setReminded] = useState<"phone" | "inbox" | null>(null);

  const confirmed = a.status === "confirmed";
  const phone = a.centre?.phone;

  const reschedule = () =>
    router.push({ pathname: "/book-appointment", params: { id: String(a.centre?.id ?? ""), reschedule: String(a.id) } } as unknown as Href);

  const doCancel = async () => {
    setBusy(true);
    setError(null);
    try {
      await cancel(a.id);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
      setConfirming(false);
    }
  };

  const doRemind = async () => setReminded(await remind(a));

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.pill, confirmed ? styles.pillOk : styles.pillWait]}>
          <Ionicons name={confirmed ? "checkmark-circle" : "time-outline"} size={14} color={confirmed ? "#14803C" : "#9A6A00"} />
          <Text style={[styles.pillText, { color: confirmed ? "#14803C" : "#9A6A00" }]}>{STATUS_LABEL[a.status]}</Text>
        </View>
        <Text style={styles.label}>Your booking</Text>
      </View>

      <Text style={styles.centre} numberOfLines={1}>{a.centre?.name ?? "Screening centre"}</Text>
      <Text style={styles.when}>{formatSlot(a)}</Text>
      {!confirmed && !compact ? <Text style={styles.sub}>Asked for this time. The centre will confirm or suggest another.</Text> : null}
      {confirmed && a.date !== a.confirmedDate ? <Text style={styles.sub}>The centre moved this from your first choice.</Text> : null}
      {a.staffNote ? <Text style={styles.staff}>Centre: {a.staffNote}</Text> : null}

      {confirming ? (
        <View style={styles.confirm}>
          <Text style={styles.confirmText}>Cancel this booking?</Text>
          <View style={styles.row}>
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => setConfirming(false)} style={[styles.btn, styles.btnGhost]}>
              <Text style={styles.btnGhostText}>Keep it</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => void doCancel()} style={[styles.btn, styles.btnDanger]}>
              <Text style={styles.btnDangerText}>{busy ? "Cancelling…" : "Yes, cancel"}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.row}>
          <Pressable accessibilityRole="button" onPress={reschedule} style={[styles.btn, styles.btnSolid]}>
            <Text style={styles.btnSolidText}>Reschedule</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setConfirming(true)} style={[styles.btn, styles.btnGhost]}>
            <Text style={styles.btnGhostText}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {!confirming && !compact ? (
        <View style={styles.links}>
          <Pressable accessibilityRole="button" onPress={() => void doRemind()} hitSlop={8} style={styles.link}>
            <Ionicons name={hasReminder(a.id) || reminded ? "notifications" : "notifications-outline"} size={16} color={colors.purple} />
            <Text style={styles.linkText}>
              {reminded === "phone" ? "Reminder set" : reminded === "inbox" ? "Reminder in notifications" : hasReminder(a.id) ? "Reminder on" : "Remind me"}
            </Text>
          </Pressable>
          {phone ? (
            <Pressable accessibilityRole="button" onPress={() => void Linking.openURL(`tel:${phone}`)} hitSlop={8} style={styles.link}>
              <Ionicons name="call-outline" size={16} color={colors.purple} />
              <Text style={styles.linkText}>Call centre</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 14, gap: 4, shadowColor: "#2B2060", shadowOpacity: 0.14, shadowRadius: 10, elevation: 5 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  label: { fontFamily: fonts.semibold, fontSize: 12, color: "#8B87A8", textTransform: "uppercase", letterSpacing: 0.6 },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  pillOk: { backgroundColor: "#E3F6EA" },
  pillWait: { backgroundColor: "#FFF3D6" },
  pillText: { fontFamily: fonts.semibold, fontSize: 12 },
  centre: { fontFamily: fonts.bold, fontSize: 17, color: colors.trackInk },
  when: { fontFamily: fonts.semibold, fontSize: 15, color: colors.purple },
  sub: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: "#5F5A7A" },
  staff: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.trackInk, backgroundColor: "#F3F0FF", borderRadius: 10, padding: 8, marginTop: 4 },
  row: { flexDirection: "row", gap: 10, marginTop: 8 },
  btn: { flex: 1, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  btnSolid: { backgroundColor: colors.purple },
  btnSolidText: { fontFamily: fonts.bold, fontSize: 14, color: colors.white },
  btnGhost: { borderWidth: 1.5, borderColor: colors.trackBorder, backgroundColor: colors.white },
  btnGhostText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.trackInk },
  btnDanger: { backgroundColor: "#D64545" },
  btnDangerText: { fontFamily: fonts.bold, fontSize: 14, color: colors.white },
  confirm: { marginTop: 8 },
  confirmText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.trackInk },
  links: { flexDirection: "row", gap: 18, marginTop: 8 },
  link: { flexDirection: "row", alignItems: "center", gap: 5 },
  linkText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.purple },
  error: { fontFamily: fonts.medium, fontSize: 13, color: "#C23B3B", marginTop: 6 },
});
