import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PillButton } from "../../components/PillButton";
import { colors, fonts } from "../../constants/theme";
import { BARRIERS, NO_ISSUES } from "../../lib/screening/content";
import { SCREENING_IMAGES } from "../../lib/screening/images";

/** "What makes it hard to do screening": pick any that apply. */
export default function Barriers() {
  const router = useRouter();
  const [picked, setPicked] = useState<number[]>([]);

  const toggle = (i: number) =>
    setPicked((cur) => {
      if (cur.includes(i)) return cur.filter((x) => x !== i);
      return i === NO_ISSUES ? [i] : [...cur.filter((x) => x !== NO_ISSUES), i];
    });
  const next = () => router.push("/screening" as Href);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={26} color="#1F2540" />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.replace("/screening" as Href)} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What makes it hard to do screening</Text>
        <View style={styles.list}>
          {BARRIERS.map((label, i) => {
            const on = picked.includes(i);
            return (
              <Pressable key={label} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => toggle(i)} style={styles.ringWrap}>
                <View style={[styles.row, on && styles.rowOn]}>
                  {/* Icon: assets/screening/barrier-<n>.png */}
                  <Image source={SCREENING_IMAGES.barrier[i]} style={styles.icon} resizeMode="contain" />
                  <Text style={[styles.label, on && { color: colors.white }]}>{label}</Text>
                  <View style={[styles.box, on && styles.boxOn]}>{on ? <Ionicons name="checkmark" size={20} color={colors.primary500} /> : null}</View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PillButton label="Explore Screening" onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FBFBFE" },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 8 },
  back: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#EFEFF1", alignItems: "center", justifyContent: "center" },
  skip: { fontFamily: fonts.medium, fontSize: 17, color: "#1F2540", paddingRight: 20 },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 16, gap: 18 },
  title: { fontFamily: fonts.semibold, fontSize: 31, lineHeight: 36, color: "#1F2540", letterSpacing: -0.3 },
  list: { gap: 10 },
  ringWrap: { borderRadius: 24 },
  row: { minHeight: 56, borderRadius: 18, backgroundColor: colors.white, paddingHorizontal: 18, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 14, shadowColor: "#2B2060", shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2, borderWidth: 4, borderColor: "transparent" },
  rowOn: { backgroundColor: "#8B7FF5", borderColor: "#BFD4FB" },
  icon: { width: 22, height: 22 },
  label: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 20, color: "#1F2540", letterSpacing: -0.2 },
  box: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: "#1F2540", alignItems: "center", justifyContent: "center" },
  boxOn: { backgroundColor: colors.white, borderColor: colors.white },
  footer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
});
