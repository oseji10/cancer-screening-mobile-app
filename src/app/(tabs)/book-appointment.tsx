import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PillButton } from "../../components/PillButton";
import { createAppointment } from "../../lib/api/appointments";
import { errorMessage } from "../../lib/api/client";
import { useAuth } from "../../lib/auth/AuthContext";
import { config } from "../../lib/config";
import { TrackHeader } from "../../components/track/TrackHeader";
import { colors, fonts } from "../../constants/theme";
import { findCentre, naira } from "../../lib/find/centres";
import { useTrack } from "../../lib/track/TrackContext";

const BLUE = "#1B6FE5";
const TIMES = ["7:00 PM", "7:30 PM", "8:00 PM"];
const TIME_24: Record<string, string> = { "7:00 PM": "19:00", "7:30 PM": "19:30", "8:00 PM": "20:00" };
const DAY_NAMES = ["Today", "Tomorrow", "Next day"];

function dayDate(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

/** Local calendar date as YYYY-MM-DD. */
function isoDay(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.opt, selected && styles.optOn]}>
      <Text style={[styles.optText, selected && styles.optTextOn]}>{label}</Text>
    </Pressable>
  );
}

/** Book Appointment: pick a day and time, then send the request. */
export default function BookAppointment() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const centre = findCentre(id);
  const { requestAppointment } = useTrack();
  const { signedIn } = useAuth();
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = centre !== undefined && day !== null && time !== null;
  // Booking needs an account so the centre and a navigator have a number to reach.
  const needsAccount = config.hasBackend && !signedIn;

  const send = async () => {
    if (!centre || day === null || !time) return;

    if (needsAccount) {
      router.push({ pathname: "/account/sign-in", params: { next: `/book-appointment?id=${centre.id}` } } as unknown as Href);
      return;
    }

    setError(null);
    let serverId: number | undefined;

    if (config.hasBackend) {
      setSending(true);
      try {
        const created = await createAppointment({
          facilityId: Number(centre.id),
          date: isoDay(day),
          time: TIME_24[time] ?? "19:00",
          type: "general",
        });
        serverId = created.id;
      } catch (e) {
        setError(errorMessage(e));
        setSending(false);
        return;
      }
      setSending(false);
    }

    requestAppointment({ centreId: centre.id, centreName: centre.name, slot: `${DAY_NAMES[day]}, ${time}`, serverId });
    router.replace("/request-sent" as Href);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TrackHeader title="Book Appointment" onBack={() => router.replace("/find" as Href)} info="Pick a day and time. The centre confirms your slot and a navigator will contact you." />

        <View style={styles.facility}>
          {/* PLACEHOLDER: centre logo. */}
          <View style={styles.logo} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.facName}>{centre?.name ?? "Choose a centre first"}</Text>
            <Text style={styles.facSub}>{centre ? centre.address : "Facility location"}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.h}>Appointment details</Text>
          <Text style={styles.label}>Select day</Text>
          <View style={styles.row}>
            {DAY_NAMES.map((d, i) => (
              <Option key={d} label={d} selected={day === i} onPress={() => setDay(i)} />
            ))}
          </View>
          <Text style={styles.label}>Select time</Text>
          <View style={styles.row}>
            {TIMES.map((t) => (
              <Option key={t} label={t} selected={time === t} onPress={() => setTime(t)} />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.h}>Appointment summary</Text>
          {ready && centre ? (
            <View style={{ gap: 6 }}>
              <Text style={styles.sumMain}>{dayDate(day!)} at {time}</Text>
              <Text style={styles.sumSub}>{centre.name}{centre.services.length ? ` · ${centre.services.join(", ")}` : ""}</Text>
              {centre.price ? <Text style={styles.sumSub}>{naira(centre.price)} · pay at centre</Text> : null}
            </View>
          ) : (
            <View style={{ gap: 14, marginTop: 4 }}>
              <View style={[styles.bar, { width: "58%" }]} />
              <View style={[styles.bar, { width: "42%" }]} />
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        {needsAccount && ready ? (
          <Text style={styles.note}>Create a free account or sign in so the centre can reach you about this request.</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PillButton
          label={sending ? "Sending…" : needsAccount ? "Sign in to book" : "Book Appointment"}
          disabled={!ready || sending}
          onPress={() => void send()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16, gap: 18 },
  facility: { flexDirection: "row", alignItems: "center", gap: 18, padding: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.trackBorder },
  logo: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#EFEFF3", borderWidth: 1, borderColor: "#E2E2E8" },
  facName: { fontFamily: fonts.bold, fontSize: 18, color: "#111" },
  facSub: { fontFamily: fonts.regular, fontSize: 14, color: "#757575" },
  card: { padding: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.trackBorder, gap: 12 },
  h: { fontFamily: fonts.bold, fontSize: 20, color: "#111" },
  label: { fontFamily: fonts.bold, fontSize: 16, color: "#111", marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "center", gap: 8 },
  opt: { minWidth: 78, height: 48, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1.5, borderColor: "#E3E3EA", alignItems: "center", justifyContent: "center" },
  optOn: { borderColor: BLUE, borderWidth: 2 },
  optText: { fontFamily: fonts.regular, fontSize: 15, color: "#111" },
  optTextOn: { fontFamily: fonts.semibold, color: BLUE },
  bar: { height: 10, borderRadius: 5, backgroundColor: "#ECECF0" },
  sumMain: { fontFamily: fonts.semibold, fontSize: 17, color: "#111" },
  sumSub: { fontFamily: fonts.regular, fontSize: 14, color: "#5F5A7A" },
  footer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 8 },
  note: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: "#5F5A7A", textAlign: "center" },
  error: { fontFamily: fonts.medium, fontSize: 14, color: "#C23B3B", textAlign: "center" },
});
