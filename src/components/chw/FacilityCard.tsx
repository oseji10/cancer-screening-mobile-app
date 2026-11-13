import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { fonts } from "../../constants/theme";
import { DirectoryFacility, waNumber } from "../../lib/chw/facilities";
import { chw } from "../../lib/chw/theme";

type Action = { key: string; icon: keyof typeof Ionicons.glyphMap; label: string; url: string };

const open = (url: string) => void Linking.openURL(url).catch(() => undefined);

function actions(f: DirectoryFacility): Action[] {
  const list: Action[] = [];
  if (f.phone) list.push({ key: "call", icon: "call-outline", label: "Call", url: `tel:${f.phone.replace(/\s+/g, "")}` });
  if (f.whatsapp) list.push({ key: "wa", icon: "logo-whatsapp", label: "WhatsApp", url: `https://wa.me/${waNumber(f.whatsapp)}` });
  if (f.email) list.push({ key: "mail", icon: "mail-outline", label: "Email", url: `mailto:${f.email}` });
  if (f.lat != null && f.lng != null) {
    const label = encodeURIComponent(f.name);
    list.push({
      key: "map",
      icon: "navigate-outline",
      label: "Directions",
      url: Platform.OS === "ios" ? `http://maps.apple.com/?daddr=${f.lat},${f.lng}&q=${label}` : `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`,
    });
  } else if (f.address) {
    list.push({ key: "map", icon: "navigate-outline", label: "Directions", url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${f.name}, ${f.address}`)}` });
  }
  return list;
}

/** A facility with its contact details. Tap to show the focal person and opening hours. */
export function FacilityCard({ item, compact }: { item: DirectoryFacility; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const acts = actions(item);
  const cp = item.contactPerson;
  const hasMore = !!(item.hours || cp || item.email);

  return (
    <View style={[s.card, item.isMine && s.cardMine]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.name}${hasMore ? (expanded ? ", hide details" : ", show details") : ""}`}
        accessibilityState={{ expanded }}
        disabled={!hasMore}
        onPress={() => setExpanded((e) => !e)}
        style={s.head}
      >
        <View style={[s.icon, item.isMine && { backgroundColor: chw.teal }]}>
          <Ionicons name="business-outline" size={19} color={item.isMine ? chw.white : chw.teal} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={s.nameRow}>
            <Text style={s.name}>{item.name}</Text>
          </View>
          {item.address ? <Text style={s.meta} numberOfLines={compact && !expanded ? 1 : undefined}>{item.address}</Text> : null}
          <View style={s.tags}>
            {item.isMine ? <Text style={[s.tag, s.tagMine]}>Your facility</Text> : null}
            {item.kinds.map((k) => (
              <Text key={k} style={[s.tag, k === "Treatment" && s.tagTreat]}>{k}</Text>
            ))}
          </View>
          {item.phone ? <Text style={s.phone}>{item.phone}</Text> : !acts.length ? <Text style={s.meta}>No contact details recorded</Text> : null}
        </View>
        {hasMore ? <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color="#A5A2AE" /> : null}
      </Pressable>

      {expanded ? (
        <View style={s.more}>
          {item.hours ? (
            <View style={s.line}>
              <Ionicons name="time-outline" size={16} color={chw.faint} />
              <Text style={s.lineText}>{item.hours}</Text>
            </View>
          ) : null}
          {item.email ? (
            <View style={s.line}>
              <Ionicons name="mail-outline" size={16} color={chw.faint} />
              <Text style={s.lineText} selectable>{item.email}</Text>
            </View>
          ) : null}
          {cp ? (
            <View style={s.person}>
              <Text style={s.personLabel}>Contact person</Text>
              {cp.name ? <Text style={s.personName}>{cp.name}</Text> : null}
              <View style={s.personActions}>
                {cp.phone ? (
                  <Pressable accessibilityRole="link" onPress={() => open(`tel:${cp.phone!.replace(/\s+/g, "")}`)} hitSlop={6}>
                    <Text style={s.link}>{cp.phone} · Call</Text>
                  </Pressable>
                ) : null}
                {cp.email ? (
                  <Pressable accessibilityRole="link" onPress={() => open(`mailto:${cp.email}`)} hitSlop={6}>
                    <Text style={s.link}>{cp.email}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {acts.length ? (
        <View style={s.actions}>
          {acts.map((a) => (
            <Pressable key={a.key} accessibilityRole="link" accessibilityLabel={`${a.label} ${item.name}`} onPress={() => open(a.url)} style={({ pressed }) => [s.action, pressed && { opacity: 0.7 }]}>
              <Ionicons name={a.icon} size={16} color={chw.teal} />
              <Text style={s.actionText}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderColor: chw.border, borderRadius: 16, padding: 14, backgroundColor: chw.white },
  cardMine: { borderColor: chw.teal, backgroundColor: "#F6FCFB" },
  head: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: chw.tealSoft, alignItems: "center", justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { flexShrink: 1, fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: chw.text },
  meta: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: chw.muted, marginTop: 2 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  tag: { fontFamily: fonts.semibold, fontSize: 11, color: chw.teal, backgroundColor: chw.tealSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, overflow: "hidden" },
  tagMine: { color: chw.white, backgroundColor: chw.teal },
  tagTreat: { color: chw.purple, backgroundColor: "#F0EEFE" },
  phone: { fontFamily: fonts.semibold, fontSize: 14, color: chw.text, marginTop: 6 },
  more: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F0EDF4", gap: 8 },
  line: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  lineText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: chw.text },
  person: { backgroundColor: chw.card, borderRadius: 12, padding: 12, marginTop: 2 },
  personLabel: { fontFamily: fonts.medium, fontSize: 12, color: chw.faint },
  personName: { fontFamily: fonts.bold, fontSize: 14, color: chw.text, marginTop: 3 },
  personActions: { gap: 4, marginTop: 4 },
  link: { fontFamily: fonts.semibold, fontSize: 14, color: chw.teal },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  action: { flexDirection: "row", alignItems: "center", gap: 5, height: 34, borderRadius: 17, paddingHorizontal: 12, borderWidth: 1, borderColor: chw.tealLight, backgroundColor: chw.white },
  actionText: { fontFamily: fonts.semibold, fontSize: 13, color: chw.teal },
});
