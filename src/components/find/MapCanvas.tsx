import { Image, Pressable, StyleSheet, View } from "react-native";

import { colors } from "../../constants/theme";
import { MapBubble } from "./MapBubble";
import type { MapCanvasProps } from "./mapTypes";

/** Web preview: a drawn map picture with the pins laid on top. Phones use the real map (MapCanvas.native.tsx). */
export default function MapCanvas({ centres, selectedId, user, onSelect, bottomInset, topInset }: MapCanvasProps) {
  return (
    <View style={styles.fill}>
      <Image source={require("../../../assets/find/map.png")} style={styles.fill} resizeMode="cover" />
      <View style={[styles.area, { top: topInset + 40, bottom: bottomInset }]} pointerEvents="box-none">
        <View style={styles.userDot}>
          <View style={styles.userCore} />
        </View>
        {centres.map((c) => (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            accessibilityLabel={c.name}
            onPress={() => onSelect(c.id)}
            style={[styles.marker, { left: `${c.pos.x * 100}%`, top: `${c.pos.y * 100}%` }]}
          >
            <MapBubble centre={c} selected={c.id === selectedId} />
          </Pressable>
        ))}
      </View>
      {user ? null : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", left: 0, top: 0, width: "100%", height: "100%" },
  area: { position: "absolute", left: 0, right: 0 },
  userDot: { position: "absolute", left: "50%", top: "62%", width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(27,111,229,0.22)", alignItems: "center", justifyContent: "center" },
  userCore: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#1B6FE5", borderWidth: 3, borderColor: colors.white },
  marker: { position: "absolute", marginLeft: -30, marginTop: -40 },
});
