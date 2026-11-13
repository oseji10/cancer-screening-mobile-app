import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { PillButton } from "../../components/PillButton";
import { TrackHeader } from "../../components/track/TrackHeader";
import { colors, fonts } from "../../constants/theme";
import { CHANGE_IMAGES, slug } from "../../lib/change/images";
import { useTrack } from "../../lib/track/TrackContext";

type Tone = { bg: string; on: string; dot: string };
const PINK: Tone = { bg: "#FBE6EC", on: "#F6C8D4", dot: "#F3A9BC" };
const GREEN: Tone = { bg: "#DDF1EC", on: "#BFE5DA", dot: "#9ED6C7" };
const YELLOW: Tone = { bg: "#FFF1D0", on: "#FFE4A3", dot: "#F7CE73" };
const LILAC: Tone = { bg: "#E9E6FA", on: "#D3CCF5", dot: "#B8AEEF" };

const FEELINGS = ["Lump", "Pain", "Skin change", "Nipple change"];
const FEELING_COLORS = ["#E7E1FA", "#D4EEF2", "#FDEBD3", "#FADDE6"];
const DESCRIBE = ["Hard lump", "Thick area", "Dimpling", "Nipple crust", "New fluid", "Skin change", "New shape or size", "Orange-peel skin", "Growing veins", "Red or hot nipple", "Unusual discharge"];
const WHERE = ["Left breast", "Right breast", "Both breasts", "Nipple", "Underarm", "Chest", "Collarbone"];
const WHEN = ["Last few days", "Last few weeks", "1–3 months", "3–6 months", "More than 6 months", "Not sure"];
const TREND = ["Getting better", "Staying the same", "Getting worse", "Comes and goes", "Not sure"];
const OTHER = ["Headaches", "Body aches", "Mood swings", "Cramps", "Skin redness", "Diarrhea"];

function Chip({ label, tone, selected, onPress }: { label: string; tone: Tone; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? tone.on : tone.bg }, selected && styles.chipOn]}
    >
      {/* Icon: assets/change/chip-<label>.png (see src/lib/change/images.ts). */}
      <View style={[styles.chipIcon, { backgroundColor: tone.dot }]}>
        <Image source={CHANGE_IMAGES.chip[slug(label)]} style={styles.chipImg} resizeMode="contain" />
        {selected ? <View style={styles.tick}><Ionicons name="checkmark" size={11} color={colors.white} /></View> : null}
      </View>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

function Group({ title, options, tone, value, multi, onChange, query }: {
  title: string; options: string[]; tone: Tone; value: string[]; multi: boolean; onChange: (v: string[]) => void; query: string;
}) {
  const shown = options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()));
  if (shown.length === 0) return null;
  const toggle = (o: string) => {
    if (multi) onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
    else onChange(value.includes(o) ? [] : [o]);
  };
  return (
    <View style={styles.card}>
      <Text style={styles.q}>{title}</Text>
      <View style={styles.chips}>
        {shown.map((o) => (
          <Chip key={o} label={o} tone={tone} selected={value.includes(o)} onPress={() => toggle(o)} />
        ))}
      </View>
    </View>
  );
}

/** Change Tracker questionnaire: what, where, when, how it is changing, other symptoms, notes. */
export default function ChangeForm() {
  const router = useRouter();
  const { logChange } = useTrack();
  const [query, setQuery] = useState("");
  const [feeling, setFeeling] = useState<string | null>(null);
  const [described, setDescribed] = useState<string[]>([]);
  const [where, setWhere] = useState<string[]>([]);
  const [when, setWhen] = useState<string[]>([]);
  const [trend, setTrend] = useState<string[]>([]);
  const [other, setOther] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const next = () => {
    logChange({ feeling, described, where, firstNoticed: when[0] ?? null, trend: trend[0] ?? null, otherSymptoms: other, note: note.trim() });
    router.push("/change/result" as Href);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <KeyboardAwareScrollView bottomOffset={24} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TrackHeader title="Change Tracker" onBack={() => router.back()} info="Answer what you can. Everything here stays on your phone, and you can skip any question." />

          <View style={styles.search}>
            <Ionicons name="search-outline" size={18} color="#8A8A93" />
            <TextInput value={query} onChangeText={setQuery} placeholder="Search" placeholderTextColor="#8A8A93" style={styles.searchInput} />
          </View>

          <View style={styles.card}>
            <Text style={styles.q}>What are you feeling today?</Text>
            <View style={styles.feelRow}>
              {FEELINGS.map((f, i) => (
                <Pressable key={f} accessibilityRole="button" accessibilityState={{ selected: feeling === f }} onPress={() => setFeeling(feeling === f ? null : f)} style={styles.feel}>
                  {/* Picture: assets/change/feeling-<name>.png */}
                  <View style={[styles.feelCircle, { backgroundColor: FEELING_COLORS[i] }, feeling === f && styles.feelOn]}>
                    <Image source={CHANGE_IMAGES.feeling[slug(f)]} style={styles.feelImg} resizeMode="cover" />
                  </View>
                  <Text style={styles.feelText}>{f}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={styles.h2}>Categories</Text>
          <Group title="How would you describe the change?" options={DESCRIBE} tone={PINK} value={described} multi onChange={setDescribed} query={query} />
          <Group title="Where is the change located?" options={WHERE} tone={GREEN} value={where} multi onChange={setWhere} query={query} />
          <Group title="When did you first notice the change?" options={WHEN} tone={YELLOW} value={when} multi={false} onChange={setWhen} query={query} />
          <Group title="Is the change..." options={TREND} tone={LILAC} value={trend} multi={false} onChange={setTrend} query={query} />
          <Group title="Do you have any other symptoms?" options={OTHER} tone={PINK} value={other} multi onChange={setOther} query={query} />

          <View style={styles.card}>
            <Text style={styles.q}>Anything else you'd like to note?</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add any additional details..."
              placeholderTextColor="#9B9BA5"
              multiline
              style={styles.note}
            />
          </View>

          <PillButton label="Continue" onPress={next} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3F4FA" },
  content: { paddingHorizontal: 15, paddingTop: 16, paddingBottom: 28, gap: 14 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, height: 44, borderRadius: 22, backgroundColor: "#E5E5EA", paddingHorizontal: 16 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.trackInk, paddingVertical: 0 },
  h2: { fontFamily: fonts.bold, fontSize: 24, color: colors.trackInk, marginTop: 2 },
  card: { backgroundColor: colors.white, borderRadius: 22, padding: 16, gap: 14 },
  q: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 22, color: colors.trackInk },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 10, height: 38, borderRadius: 19, paddingLeft: 8, paddingRight: 16, borderWidth: 1.5, borderColor: "transparent" },
  chipOn: { borderColor: colors.purple },
  chipImg: { width: 22, height: 22, borderRadius: 11 },
  tick: { position: "absolute", right: -4, bottom: -4, width: 15, height: 15, borderRadius: 8, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center" },
  feelImg: { width: "100%", height: "100%" },
  chipIcon: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  chipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.trackInk },
  feelRow: { flexDirection: "row", justifyContent: "space-between" },
  feel: { alignItems: "center", gap: 6, width: 72 },
  feelCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: "transparent", overflow: "hidden" },
  feelOn: { borderColor: colors.purple },
  feelText: { fontFamily: fonts.medium, fontSize: 12, color: colors.trackInk, textAlign: "center" },
  note: { minHeight: 76, borderRadius: 14, borderWidth: 1, borderColor: "#D7D7DE", padding: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.trackInk, textAlignVertical: "top" },
});
