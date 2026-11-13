import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { fonts } from "../../constants/theme";
import { chw } from "../../lib/chw/theme";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (v: string | null) => {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const formatIsoDay = (v: string | null | undefined) => {
  const d = parse(v ?? null);
  return d ? d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : v ?? "";
};

/** A date field that opens a small calendar. Value is YYYY-MM-DD. No native module needed. */
export function DateField({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Choose a date",
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  /** YYYY-MM-DD; earlier days can't be picked. */
  minDate?: string;
  /** YYYY-MM-DD; later days can't be picked. */
  maxDate?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const chosen = parse(value);
  const min = parse(minDate ?? null);
  const max = parse(maxDate ?? null);
  const [cursor, setCursor] = useState(() => {
    const base = chosen ?? max ?? min ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const lead = (first.getDay() + 6) % 7; // Monday first
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const out: (Date | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= days; d++) out.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (out.length % 7) out.push(null);
    return out;
  }, [cursor]);

  const canPrev = !min || new Date(cursor.getFullYear(), cursor.getMonth(), 0) >= min;
  const canNext = !max || new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1) <= max;
  const today = iso(new Date());

  return (
    <View style={{ gap: 6, marginTop: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value ? formatIsoDay(value) : placeholder}`} onPress={() => setOpen(true)} style={styles.field}>
        <Ionicons name="calendar-outline" size={20} color={chw.teal} />
        <Text style={[styles.value, !value && styles.placeholder]}>{value ? formatIsoDay(value) : placeholder}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={() => undefined}>
            <View style={styles.head}>
              <Pressable accessibilityRole="button" accessibilityLabel="Previous month" disabled={!canPrev} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} hitSlop={10}>
                <Ionicons name="chevron-back" size={22} color={canPrev ? chw.text : "#D5D0E2"} />
              </Pressable>
              <Text style={styles.month}>
                {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
              </Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Next month" disabled={!canNext} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} hitSlop={10}>
                <Ionicons name="chevron-forward" size={22} color={canNext ? chw.text : "#D5D0E2"} />
              </Pressable>
            </View>
            <View style={styles.grid}>
              {DAYS.map((d) => (
                <Text key={d} style={styles.dow}>{d}</Text>
              ))}
              {cells.map((d, i) => {
                if (!d) return <View key={`e${i}`} style={styles.cell} />;
                const key = iso(d);
                const disabled = (!!min && d < min) || (!!max && d > max);
                const on = key === value;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityLabel={formatIsoDay(key)}
                    accessibilityState={{ disabled, selected: on }}
                    disabled={disabled}
                    onPress={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                    style={[styles.cell, on && styles.cellOn]}
                  >
                    <Text style={[styles.day, disabled && styles.dayOff, key === today && !on && styles.today, on && styles.dayOn]}>{d.getDate()}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={styles.close}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.semibold, fontSize: 14, color: "#29243B" },
  field: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 50, borderWidth: 1, borderColor: chw.border, borderRadius: 14, paddingHorizontal: 14 },
  value: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: chw.text },
  placeholder: { color: "#A7A2B3" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: 20 },
  card: { width: "100%", maxWidth: 380, backgroundColor: chw.white, borderRadius: 20, padding: 16 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  month: { fontFamily: fonts.bold, fontSize: 17, color: chw.text },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dow: { width: `${100 / 7}%`, textAlign: "center", fontFamily: fonts.semibold, fontSize: 12, color: chw.faint, paddingVertical: 6 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 99 },
  cellOn: { backgroundColor: chw.teal },
  day: { fontFamily: fonts.medium, fontSize: 15, color: chw.text },
  dayOff: { color: "#D5D0E2" },
  dayOn: { color: chw.white, fontFamily: fonts.bold },
  today: { color: chw.teal, fontFamily: fonts.bold },
  close: { alignSelf: "flex-end", paddingVertical: 8, paddingHorizontal: 4, marginTop: 4 },
  closeText: { fontFamily: fonts.semibold, fontSize: 15, color: chw.teal },
});
