import { ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../../constants/theme";

const LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const DAYS_BEFORE = 3;
const DAYS_TOTAL = 21;

/** Scrollable row of days: three days before today, today highlighted, then upcoming days. */
export function DateStrip({ today = new Date() }: { today?: Date }) {
  const days = Array.from({ length: DAYS_TOTAL }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i - DAYS_BEFORE);
    return { key: d.toISOString(), date: d.getDate(), letter: LETTERS[d.getDay()], offset: i - DAYS_BEFORE };
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {days.map((day) => {
        const isToday = day.offset === 0;
        const isPast = day.offset < 0;
        return (
          <View key={day.key} style={styles.item}>
            <View style={[styles.circle, isToday ? styles.today : styles.dashed, isPast && styles.past]}>
              <Text
                style={[
                  styles.number,
                  { color: isToday ? colors.white : isPast ? colors.pinkStrong : colors.black },
                ]}
              >
                {day.date}
              </Text>
            </View>
            <Text style={styles.letter}>{day.letter}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 10, paddingHorizontal: 7, height: 72 },
  item: { width: 43, alignItems: "center", gap: 8 },
  circle: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  dashed: { borderWidth: 1, borderStyle: "dashed", borderColor: colors.pinkStrong },
  past: { backgroundColor: colors.white },
  today: { backgroundColor: colors.pinkSoft, borderWidth: 1, borderStyle: "dashed", borderColor: colors.pinkWash },
  number: { fontFamily: fonts.nunitoBold, fontSize: 12, lineHeight: 16 },
  letter: { fontFamily: fonts.nunito, fontSize: 12, lineHeight: 16, color: colors.black },
});
