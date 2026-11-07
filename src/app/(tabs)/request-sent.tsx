import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PillButton } from "../../components/PillButton";
import { colors, fonts } from "../../constants/theme";
import { useTrack } from "../../lib/track/TrackContext";

function sentLabel(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return `Today, ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

/** Confirmation after booking: what happens next. */
export default function RequestSent() {
  const router = useRouter();
  const { appointments } = useTrack();
  const latest = appointments[0];

  const steps = [
    { title: "Request sent", sub: sentLabel(latest?.requestedAt), done: true },
    { title: "Centre confirms your slot", sub: "Usually within one working day", done: false },
    { title: "A Navigator messages you", sub: "They'll confirm the time and answer any questions", done: false },
  ];

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.check}>
          <Ionicons name="checkmark" size={110} color={colors.white} />
        </View>
        <Text style={styles.title}>Request sent</Text>
        <Text style={styles.sub}>
          {latest ? `${latest.centreName}, ${latest.slot}. ` : ""}A navigator will reach out once the centre confirms your time.
        </Text>

        <View style={styles.timeline}>
          {steps.map((s, i) => (
            <View key={s.title} style={styles.step}>
              <View style={styles.rail}>
                <View style={[styles.node, s.done && styles.nodeDone]}>{s.done ? <View style={styles.nodeCore} /> : <View style={styles.nodeDim} />}</View>
                {i < steps.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={{ flex: 1, paddingBottom: 18 }}>
                <Text style={[styles.stepTitle, !s.done && styles.dim]}>{s.title}</Text>
                <Text style={styles.stepSub}>{s.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PillButton label="Remind me" onPress={() => router.replace("/home" as Href)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FBFAFF" },
  content: { paddingHorizontal: 16, paddingTop: 44, paddingBottom: 16, alignItems: "center" },
  check: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#27D367", alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.extraBold, fontSize: 32, color: colors.trackInk, marginTop: 52, letterSpacing: -0.5 },
  sub: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24, textAlign: "center", color: "#5F5A7A", marginTop: 22, paddingHorizontal: 4 },
  timeline: { alignSelf: "stretch", marginTop: 40, paddingHorizontal: 18 },
  step: { flexDirection: "row", gap: 14 },
  rail: { alignItems: "center", width: 22 },
  node: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#E6E3F4", alignItems: "center", justifyContent: "center" },
  nodeDone: { backgroundColor: colors.purple },
  nodeCore: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.white },
  nodeDim: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#B5B0CC" },
  line: { width: 2, flex: 1, backgroundColor: "#E6E3F4", marginTop: 2 },
  stepTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.trackInk },
  dim: { color: "#8B87A8" },
  stepSub: { fontFamily: fonts.regular, fontSize: 15, color: "#8B87A8", marginTop: 2 },
  footer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
});
