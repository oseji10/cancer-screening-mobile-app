import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "../../constants/theme";
import { getPosts, Post } from "../../lib/posts";
import { PostCard } from "./PostCard";

type Req = <T>(path: string, method?: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown) => Promise<T>;

/** Every article and announcement for one side of the app. */
export function PostList({ side, accent, onBack, onOpen, request }: { side: "women" | "chw"; accent: string; onBack: () => void; onOpen: (id: number) => void; request?: Req }) {
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await getPosts(side, request, 50));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load articles.");
    }
  }, [side, request]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={s.back} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={accent} />
        </Pressable>
        <Text style={s.topTitle}>News and articles</Text>
        <View style={s.back} />
      </View>
      <ScrollView
        contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={busy} tintColor={accent} onRefresh={async () => { setBusy(true); await load(); setBusy(false); }} />}
      >
        {error ? <Text style={s.empty}>{error}</Text> : null}
        {rows && rows.length === 0 ? <Text style={s.empty}>Nothing here yet. News and articles from NICRAT will show here.</Text> : null}
        {(rows ?? []).map((p) => (
          <PostCard key={p.id} post={p} side={side} accent={accent} wide onPress={() => onOpen(p.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  topBar: { height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  topTitle: { flex: 1, textAlign: "center", fontFamily: fonts.bold, fontSize: 18, color: "#1E1B2B" },
  list: { paddingHorizontal: 16, paddingTop: 6, gap: 10 },
  empty: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: "#6B6780", textAlign: "center", marginTop: 40 },
});
