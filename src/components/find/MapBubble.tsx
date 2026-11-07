import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../../constants/theme";
import { formatKm } from "../../lib/find/centres";
import type { MapCentre } from "./mapTypes";

/** Round letter pin with the distance underneath. Used on every platform. */
export function MapBubble({ centre, selected }: { centre: MapCentre; selected: boolean }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.bubble, { backgroundColor: centre.tone }, selected && styles.bubbleSel]}>
        <Text style={styles.letter}>{centre.initial}</Text>
      </View>
      {centre.km !== null ? (
        <View style={[styles.km, selected && styles.kmSel]}>
          <Text style={[styles.kmText, selected && { color: colors.white }]}>{formatKm(centre.km)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", padding: 4 },
  bubble: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: colors.white, alignItems: "center", justifyContent: "center" },
  bubbleSel: { width: 62, height: 62, borderRadius: 31, borderColor: colors.purple, borderWidth: 4 },
  letter: { fontFamily: fonts.extraBold, fontSize: 21, color: colors.trackInk },
  km: { marginTop: -10, backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  kmSel: { backgroundColor: colors.purple },
  kmText: { fontFamily: fonts.bold, fontSize: 12, color: colors.trackInk },
});
