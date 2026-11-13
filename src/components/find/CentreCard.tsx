import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../../constants/theme";
import { Centre, naira } from "../../lib/find/centres";

function openLabel(open: boolean | null) {
  return open === null ? "Hours not listed" : open ? "Open now" : "Closed";
}
const openDot = (open: boolean | null) => (open === null ? "#C9C6D8" : open ? "#8FE3C8" : "#F59E9E");

type Props = { centre: Centre; width: number; selected: boolean; onSelect: () => void; onBook: () => void };

/** Bottom card on the map: photo area, name, services, price and Book. */
export function CentreCard({ centre, width, selected, onSelect, onBook }: Props) {
  return (
    <View style={[styles.card, { width }, selected && styles.selected]}>
      <Pressable accessibilityRole="button" onPress={onSelect}>
      {/* PLACEHOLDER: replace this grey area with the centre photo. */}
      <View style={styles.photo}>
        <View style={styles.heart}>
          <Ionicons name="heart" size={20} color="#C2185B" />
        </View>
        <View style={styles.openPill}>
          <View style={[styles.dot, { backgroundColor: openDot(centre.open) }]} />
          <Text style={styles.openText}>{openLabel(centre.open)}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{centre.name}</Text>
        <Text style={styles.services} numberOfLines={1}>{centre.services.join(" · ")}</Text>
        <View style={styles.tagRow}>
          {centre.nhis ? <Text style={styles.tag}>NHIS accepted</Text> : <Text style={styles.address} numberOfLines={1}>{centre.address}</Text>}
        </View>
      </View>
      </Pressable>
      <View style={styles.footer}>
        {centre.price ? (
          <View>
            <Text style={styles.price}>{naira(centre.price)}</Text>
            <Text style={styles.pay}>PAY AT CENTRE</Text>
          </View>
        ) : (
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.hours} numberOfLines={1}>{centre.hours ?? "Call to confirm hours"}</Text>
            <Text style={styles.pay} numberOfLines={1}>{centre.phone ?? "REQUEST AN APPOINTMENT"}</Text>
          </View>
        )}
        <Pressable accessibilityRole="button" accessibilityLabel={`Book ${centre.name}`} onPress={onBook} style={styles.book}>
          <Text style={styles.bookText}>Book</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 26, overflow: "hidden", shadowColor: "#2B2060", shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 4, borderWidth: 2, borderColor: "transparent" },
  selected: { borderColor: colors.purple },
  photo: { height: 104, backgroundColor: "#F3F4F9", justifyContent: "flex-end", padding: 12 },
  heart: { position: "absolute", right: 12, top: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: "#FAD0E1", alignItems: "center", justifyContent: "center" },
  openPill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#3F3D56", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  openText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.white },
  body: { paddingHorizontal: 16, paddingTop: 12, gap: 4 },
  name: { fontFamily: fonts.bold, fontSize: 18, color: colors.trackInk },
  services: { fontFamily: fonts.regular, fontSize: 14, color: "#5F5A7A" },
  tagRow: { marginTop: 8, alignItems: "flex-start" },
  tag: { fontFamily: fonts.semibold, fontSize: 12, color: colors.trackSoft, backgroundColor: "#DDD6F7", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, overflow: "hidden" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, marginTop: 10, borderTopWidth: 1, borderTopColor: "#EEE9FB", borderStyle: "dashed" },
  price: { fontFamily: fonts.bold, fontSize: 22, color: colors.trackInk },
  address: { fontFamily: fonts.regular, fontSize: 13, color: "#8A859F" },
  hours: { fontFamily: fonts.semibold, fontSize: 14, color: colors.trackInk },
  pay: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.5, color: "#8A859F" },
  book: { height: 40, paddingHorizontal: 28, borderRadius: 20, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center" },
  bookText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
});
