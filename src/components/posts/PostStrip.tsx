import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { fonts } from "../../constants/theme";
import { getPosts, Post } from "../../lib/posts";
import { PostCard } from "./PostCard";

type Req = <T>(path: string, method?: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown) => Promise<T>;

/** Dashboard section: the latest few articles/announcements in a sideways strip. Hidden when there are none. */
export function PostStrip({ side, accent, title = "News and articles", onOpen, onViewAll, request, inset = 0, style }: {
  side: "women" | "chw";
  accent: string;
  title?: string;
  onOpen: (id: number) => void;
  onViewAll: () => void;
  request?: Req;
  /** Horizontal padding of the parent, so the strip can run edge to edge. */
  inset?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [rows, setRows] = useState<Post[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getPosts(side, request, 6)
        .then((r) => alive && setRows(r))
        .catch(() => undefined);
      return () => {
        alive = false;
      };
    }, [side, request]),
  );

  if (rows.length === 0) return null;
  return (
    <View style={style}>
      <View style={s.head}>
        <Text style={s.title}>{title}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`View all ${title.toLowerCase()}`} onPress={onViewAll} hitSlop={10}>
          <Text style={[s.all, { color: accent }]}>View all</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -inset }} contentContainerStyle={{ gap: 10, paddingHorizontal: inset }}>
        {rows.map((p) => (
          <PostCard key={p.id} post={p} side={side} accent={accent} onPress={() => onOpen(p.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontFamily: fonts.bold, fontSize: 18, color: "#171717" },
  all: { fontFamily: fonts.semibold, fontSize: 13 },
});
