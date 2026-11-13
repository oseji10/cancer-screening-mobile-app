import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";

import { fonts } from "../../constants/theme";
import { Post, postDate } from "../../lib/posts";

// PLACEHOLDER slots: replace assets/posts/placeholder-women.png / placeholder-chw.png (same names) with final artwork.
const PLACEHOLDER: Record<"women" | "chw", ImageSourcePropType> = {
  women: require("../../../assets/posts/placeholder-women.png"),
  chw: require("../../../assets/posts/placeholder-chw.png"),
};

/** An article or announcement in a list. `wide` = full width row, otherwise a card for a horizontal strip. */
export function PostCard({ post, side, accent, onPress, wide }: { post: Post; side: "women" | "chw"; accent: string; onPress: () => void; wide?: boolean }) {
  const label = post.kind === "announcement" ? "Announcement" : "Article";
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${post.title}`} onPress={onPress} style={({ pressed }) => [wide ? s.row : s.card, pressed && { opacity: 0.85 }]}>
      <Image source={post.coverUrl ? { uri: post.coverUrl } : PLACEHOLDER[side]} style={wide ? s.rowImg : s.cardImg} resizeMode="cover" />
      <View style={wide ? s.rowText : s.cardText}>
        <Text style={[s.kind, { color: accent }]}>{post.pinned ? `Pinned · ${label}` : label}</Text>
        <Text style={s.title} numberOfLines={2}>{post.title}</Text>
        {post.summary ? <Text style={s.summary} numberOfLines={wide ? 2 : 2}>{post.summary}</Text> : null}
        <Text style={s.date}>{postDate(post.publishedAt)}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { width: 250, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#ECE9F2", overflow: "hidden" },
  cardImg: { width: "100%", height: 120, backgroundColor: "#F3F1F8" },
  cardText: { padding: 12, gap: 4 },
  row: { flexDirection: "row", gap: 12, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#ECE9F2", padding: 10 },
  rowImg: { width: 92, height: 92, borderRadius: 12, backgroundColor: "#F3F1F8" },
  rowText: { flex: 1, gap: 3, justifyContent: "center" },
  kind: { fontFamily: fonts.semibold, fontSize: 12 },
  title: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: "#1E1B2B" },
  summary: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: "#6B6780" },
  date: { fontFamily: fonts.medium, fontSize: 12, color: "#9A96AA", marginTop: 2 },
});
