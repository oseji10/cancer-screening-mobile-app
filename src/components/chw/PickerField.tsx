import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "../../constants/theme";
import { chw } from "../../lib/chw/theme";

export type PickerOption = { value: string; label: string; sub?: string };

/**
 * A drop-down: tapping the field opens a full list to choose from.
 * With `searchable`, a filter box sits at the top (useful for long lists like facilities).
 */
export function PickerField({
  label,
  placeholder,
  options,
  value,
  onChange,
  searchable,
  loading,
  emptyText = "Nothing to choose from yet.",
}: {
  label: string;
  placeholder: string;
  options: PickerOption[];
  value: string | null;
  onChange: (value: string) => void;
  searchable?: boolean;
  loading?: boolean;
  emptyText?: string;
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const chosen = options.find((o) => o.value === value) ?? null;

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return options;
    return options.filter((o) => o.label.toLowerCase().includes(term) || (o.sub ?? "").toLowerCase().includes(term));
  }, [options, q]);

  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${chosen ? chosen.label : placeholder}`} onPress={() => setOpen(true)} style={styles.field}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.value, !chosen && styles.placeholder]} numberOfLines={1}>
            {chosen ? chosen.label : placeholder}
          </Text>
          {chosen?.sub ? <Text style={styles.sub} numberOfLines={1}>{chosen.sub}</Text> : null}
        </View>
        <Ionicons name="chevron-down" size={20} color={chw.faint} />
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        {/* Keeps the end of the list reachable while the keyboard is open. */}
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={[styles.sheet, { paddingTop: insets.top + 8, paddingBottom: insets.bottom }]}>
          <View style={styles.head}>
            <Text style={styles.headTitle}>{label}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setOpen(false)} hitSlop={10}>
              <Ionicons name="close" size={26} color={chw.text} />
            </Pressable>
          </View>
          {searchable ? (
            <View style={styles.search}>
              <Ionicons name="search" size={18} color={chw.faint} />
              <TextInput value={q} onChangeText={setQ} placeholder="Type to filter" placeholderTextColor="#A7A2B3" style={styles.searchInput} autoFocus={false} />
            </View>
          ) : null}
          {loading ? (
            <Text style={styles.empty}>Loading…</Text>
          ) : (
            <FlatList
              data={shown}
              keyExtractor={(o) => o.value}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={30}
              ListEmptyComponent={<Text style={styles.empty}>{q ? "No match. Try another part of the name." : emptyText}</Text>}
              renderItem={({ item }) => {
                const on = item.value === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                      setQ("");
                    }}
                    style={[styles.option, on && styles.optionOn]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionText}>{item.label}</Text>
                      {item.sub ? <Text style={styles.sub}>{item.sub}</Text> : null}
                    </View>
                    {on ? <Ionicons name="checkmark" size={20} color={chw.teal} /> : null}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.semibold, fontSize: 14, color: "#29243B" },
  field: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 52, borderWidth: 1, borderColor: chw.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 },
  value: { fontFamily: fonts.regular, fontSize: 15, color: "#29243B" },
  placeholder: { color: "#A7A2B3" },
  sub: { fontFamily: fonts.regular, fontSize: 13, color: "#777386", marginTop: 2 },
  sheet: { flex: 1, backgroundColor: chw.white },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10 },
  headTitle: { fontFamily: fonts.bold, fontSize: 20, color: "#29243B" },
  search: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginBottom: 8, height: 48, borderRadius: 24, backgroundColor: chw.card, paddingHorizontal: 16 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: "#29243B" },
  option: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F0EDF4" },
  optionOn: { backgroundColor: chw.tealSoft },
  optionText: { fontFamily: fonts.medium, fontSize: 15, color: "#29243B" },
  empty: { fontFamily: fonts.regular, fontSize: 15, color: "#777386", textAlign: "center", marginTop: 32, paddingHorizontal: 24 },
});
