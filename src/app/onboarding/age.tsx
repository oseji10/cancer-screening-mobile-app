import { Href, useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";

import { PillButton } from "../../components/PillButton";
import { Screen } from "../../components/Screen";
import { SetupHeader } from "../../components/SetupHeader";
import { colors, fonts } from "../../constants/theme";
import { useProfile } from "../../lib/profile/ProfileContext";

const MIN_AGE = 12;
const MAX_AGE = 100;
const DEFAULT_AGE = 25;
const STEP_PX = 48; // how far a drag has to travel to move one number

// [offset from the chosen age, font size, line height, letter spacing, colour]
const ROWS = [
  { offset: -2, size: 30, line: 38, spacing: -0.3, color: colors.ageFar },
  { offset: -1, size: 60, line: 68, spacing: -1.2, color: colors.ageNear },
  { offset: 1, size: 60, line: 68, spacing: -1.2, color: colors.ageNear },
  { offset: 2, size: 30, line: 38, spacing: -0.3, color: colors.ageFar },
] as const;

const clamp = (n: number) => Math.min(Math.max(n, MIN_AGE), MAX_AGE);

/** Age picker: drag up/down or tap a neighbouring number. */
export default function SetupAge() {
  const router = useRouter();
  const { profile, update } = useProfile();
  const age = profile.age ?? DEFAULT_AGE;

  // The pan responder outlives renders, so keep the latest age in a ref.
  const ageRef = useRef(age);
  ageRef.current = age;
  const startAge = useRef(age);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
        onPanResponderGrant: () => {
          startAge.current = ageRef.current;
        },
        onPanResponderMove: (_, g) => {
          // Dragging down shows smaller numbers, like a scroll wheel.
          const next = clamp(startAge.current - Math.round(g.dy / STEP_PX));
          if (next !== ageRef.current) update({ age: next });
        },
      }),
    [update],
  );

  const goNext = () => {
    if (profile.age === null) update({ age });
    router.push("/onboarding/need" as Href);
  };

  return (
    <Screen
      contentStyle={styles.content}
      footer={
        <View style={styles.footer}>
          <PillButton tone="lilac" label="Continue" onPress={goNext} />
        </View>
      }
    >
      <SetupHeader progress={0.45} onBack={() => router.back()} onSkip={() => router.push("/onboarding/need" as Href)} />
      <Text style={styles.title}>What is your age?</Text>

      <View style={styles.wheel} {...pan.panHandlers}>
        {ROWS.filter((row) => row.offset < 0).map((row) => (
          <AgeRow key={row.offset} value={age + row.offset} row={row} onPick={(v) => update({ age: v })} />
        ))}
        <View style={styles.ring}>
          <View style={styles.selected}>
            <Text style={styles.selectedText}>{age}</Text>
          </View>
        </View>
        {ROWS.filter((row) => row.offset > 0).map((row) => (
          <AgeRow key={row.offset} value={age + row.offset} row={row} onPick={(v) => update({ age: v })} />
        ))}
      </View>
    </Screen>
  );
}

function AgeRow({
  value,
  row,
  onPick,
}: {
  value: number;
  row: (typeof ROWS)[number];
  onPick: (value: number) => void;
}) {
  const inRange = value >= MIN_AGE && value <= MAX_AGE;
  return (
    <Pressable disabled={!inRange} onPress={() => onPick(value)} hitSlop={6}>
      <Text
        style={{
          fontFamily: fonts.jakartaExtraBold,
          fontSize: row.size,
          lineHeight: row.line,
          letterSpacing: row.spacing,
          color: row.color,
          textAlign: "center",
          opacity: inRange ? 1 : 0,
        }}
      >
        {inRange ? value : ""}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 24 },
  title: {
    fontFamily: fonts.jakartaExtraBold,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.3,
    color: colors.heading,
    paddingHorizontal: 8,
  },
  wheel: { alignItems: "center", gap: 12, paddingTop: 16 },
  selected: {
    backgroundColor: colors.primary500,
    borderWidth: 1,
    borderColor: "#EDF5FF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  // Figma "Focus/ring-blue": a 4px ring at 25% blue. React Native has no
  // shadow spread, so the ring is a border on a wrapper.
  ring: {
    borderWidth: 4,
    borderColor: "rgba(15,103,254,0.25)",
    borderRadius: 28,
  },
  selectedText: {
    fontFamily: fonts.jakartaExtraBold,
    fontSize: 128,
    lineHeight: 136,
    letterSpacing: -3.84,
    color: colors.white,
    textAlign: "center",
  },
  footer: { paddingHorizontal: 8, paddingBottom: 24 },
});
