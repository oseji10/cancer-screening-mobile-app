import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { formatIsoDay } from "../../../../components/chw/DateField";
import { Body, ChwScreen, Detail, InfoCard, TimelineRow } from "../../../../components/chw/ui";
import { fonts } from "../../../../constants/theme";
import { canOpen, formatDay, STAGE_LABEL, STEP_ROUTES, STEP_TITLES, stageOf } from "../../../../lib/chw/cases";
import { useChw } from "../../../../lib/chw/ChwContext";
import { chw } from "../../../../lib/chw/theme";

const BOOKING: Record<string, string> = {
  pending: "Waiting for the centre",
  confirmed: "Confirmed by the centre",
  declined: "Declined by the centre",
  cancelled: "Cancelled by the woman",
  completed: "Attended",
};

const slotText = (v: string) => {
  const [d, t] = v.split(" ");
  return t ? `${formatDay(d)}, ${t}` : formatDay(d);
};

/** Patient details: the request, contact, and the four-step case timeline. */
export default function CaseOverview() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { find, startCase, loaded } = useChw();
  const c = find(String(id));

  // Opening a new case starts the community follow-up.
  useEffect(() => {
    if (loaded && c && c.steps[0] === "not-started") startCase(c.id);
  }, [loaded, c, startCase]);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/chw" as Href));

  if (!c) {
    return (
      <ChwScreen title="Patient details" onBack={back}>
        <Body>{loaded ? "This case could not be found." : "Loading…"}</Body>
      </ChwScreen>
    );
  }

  const done = c.steps.filter((s) => s === "completed").length;
  const needed = c.steps.filter((s) => s !== "not-needed").length;
  const phone = c.contact.replace(/\s+/g, "");

  return (
    <ChwScreen title="Patient details" onBack={back}>
      <View style={styles.heading}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{c.id.slice(-3)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{c.clientName ?? `Patient ${c.id}`}</Text>
          {c.clientName ? <Text style={styles.sub}>{c.id}{c.clientAge ? ` · ${c.clientAge} years` : ""}</Text> : null}
          <Text style={styles.sub}>{c.community}</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{STAGE_LABEL[stageOf(c)]}</Text>
          </View>
        </View>
      </View>

      <InfoCard title="Appointment">
        <Detail label="Screening" value={c.screening} />
        <Detail label="Facility" value={c.facility} />
        <Detail label="Requested" value={formatDay(c.initiated)} />
        {c.appointmentSlot ? <Detail label={c.appointmentStatus === "confirmed" ? "Booked for" : "Asked for"} value={slotText(c.appointmentSlot)} /> : null}
        {c.appointmentStatus ? <Detail label="Booking" value={BOOKING[c.appointmentStatus] ?? c.appointmentStatus} /> : null}
        {c.outcome !== "pending" ? <Detail label="PHC outcome" value={c.outcome === "no-change" ? "No concerning change" : "Lump or concerning change"} /> : null}
        {c.referralFacility ? <Detail label="Referred to" value={c.referralFacility} /> : null}
        {c.referralDate ? <Detail label="Referral date" value={formatIsoDay(c.referralDate)} /> : null}
        {c.followUpDate ? <Detail label="Follow-up date" value={formatIsoDay(c.followUpDate)} /> : null}
      </InfoCard>

      <InfoCard title="Contact">
        {phone ? (
          <Pressable accessibilityRole="button" onPress={() => void Linking.openURL(`tel:${phone}`)}>
            <Text style={styles.call}>{c.contact} · Call</Text>
          </Pressable>
        ) : (
          <Body>No contact provided. Reach her through the community.</Body>
        )}
      </InfoCard>

      <Pressable accessibilityRole="button" onPress={() => router.push(`/chw/case/${c.id}/tests` as Href)} style={styles.tests}>
        <Ionicons name="flask-outline" size={22} color={chw.teal} />
        <View style={{ flex: 1 }}>
          <Text style={styles.testsTitle}>Breast screening tests</Text>
          <Text style={styles.testsSub}>{c.ncsrClientId ? `NCSR Client ID ${c.ncsrClientId}` : "Take samples and record results (saved in NCSR)"}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#A6A1B1" />
      </Pressable>

      <View style={styles.progressHead}>
        <Text style={styles.section}>Case progress</Text>
        <Text style={styles.count}>
          {done}/{needed}
        </Text>
      </View>
      <View style={styles.timeline}>
        {STEP_TITLES.map((t, i) => (
          <TimelineRow
            key={t}
            index={i}
            title={t}
            status={c.steps[i]}
            last={i === 3}
            enabled={canOpen(c, i)}
            onPress={() => router.push(`/chw/case/${c.id}/${STEP_ROUTES[i]}` as Href)}
          />
        ))}
      </View>

      {c.notes ? (
        <View style={{ marginTop: 12 }}>
          <InfoCard title="Notes">
            <Body>{c.notes}</Body>
          </InfoCard>
        </View>
      ) : null}
    </ChwScreen>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 6, marginBottom: 16 },
  badge: { width: 64, height: 64, borderRadius: 32, backgroundColor: chw.tealLight, alignItems: "center", justifyContent: "center" },
  badgeText: { fontFamily: fonts.bold, fontSize: 18, color: chw.teal },
  title: { fontFamily: fonts.bold, fontSize: 21, color: chw.text },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: chw.muted, marginTop: 2 },
  pill: { alignSelf: "flex-start", backgroundColor: "#FDEAF1", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, marginTop: 6 },
  pillText: { fontFamily: fonts.semibold, fontSize: 12, color: "#C35277" },
  call: { fontFamily: fonts.semibold, fontSize: 15, color: chw.teal },
  tests: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, backgroundColor: chw.tealSoft, padding: 14, marginBottom: 4 },
  testsTitle: { fontFamily: fonts.semibold, fontSize: 15, color: chw.text },
  testsSub: { fontFamily: fonts.regular, fontSize: 13, color: chw.muted, marginTop: 2 },
  progressHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 10 },
  section: { fontFamily: fonts.bold, fontSize: 17, color: chw.ink },
  count: { fontFamily: fonts.semibold, fontSize: 14, color: chw.teal },
  timeline: { borderWidth: 1, borderColor: chw.border, borderRadius: 18, backgroundColor: "#F8FBFB", padding: 16 },
});
