import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "../../constants/theme";
import { getPost, Post, postDate } from "../../lib/posts";

type Req = <T>(path: string, method?: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown) => Promise<T>;

/**
 * Full article/announcement. The body is plain text: a blank line starts a new paragraph,
 * "## " starts a heading and "- " a bullet point (the admin page explains this).
 */
export function PostView({ id, side, accent, onBack, request }: { id: number; side: "women" | "chw"; accent: string; onBack: () => void; request?: Req }) {
  const insets = useSafeAreaInsets();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setError(null);
    getPost(side, id, request)
      .then((p) => alive && setPost(p))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Could not open this article."));
    return () => {
      alive = false;
    };
  }, [id, side, request]);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={s.back} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={accent} />
        </Pressable>
        <Text style={s.topTitle}>{post?.kind === "announcement" ? "Announcement" : "Article"}</Text>
        <View style={s.back} />
      </View>
      {error ? (
        <Text style={s.error}>{error}</Text>
      ) : !post ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={accent} />
      ) : (
        <ScrollView contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
          {post.coverUrl ? <Image source={{ uri: post.coverUrl }} style={s.cover} resizeMode="cover" /> : null}
          <Text style={s.title}>{post.title}</Text>
          <Text style={s.date}>{postDate(post.publishedAt)}</Text>
          {post.summary ? <Text style={s.summary}>{post.summary}</Text> : null}
          <Body text={post.body ?? ""} accent={accent} />
          {post.linkUrl ? (
            <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(post.linkUrl!).catch(() => undefined)} style={[s.link, { borderColor: accent }]}>
              <Ionicons name="open-outline" size={18} color={accent} />
              <Text style={[s.linkText, { color: accent }]}>Read more</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

function Body({ text, accent }: { text: string; accent: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <View style={{ gap: 14, marginTop: 6 }}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        return (
          <View key={i} style={{ gap: 6 }}>
            {lines.map((line, j) => {
              const t = line.trim();
              if (t.startsWith("## ")) return <Text key={j} style={s.h2}>{t.slice(3)}</Text>;
              if (t.startsWith("- ") || t.startsWith("• ")) {
                return (
                  <View key={j} style={s.bulletRow}>
                    <View style={[s.dot, { backgroundColor: accent }]} />
                    <Text style={s.p}>{t.slice(2)}</Text>
                  </View>
                );
              }
              return t ? <Text key={j} style={s.p}>{t}</Text> : null;
            })}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  topBar: { height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  topTitle: { flex: 1, textAlign: "center", fontFamily: fonts.bold, fontSize: 18, color: "#1E1B2B" },
  content: { paddingHorizontal: 20, gap: 8 },
  cover: { width: "100%", aspectRatio: 16 / 9, borderRadius: 16, backgroundColor: "#F3F1F8", marginBottom: 8 },
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 31, color: "#1E1B2B" },
  date: { fontFamily: fonts.medium, fontSize: 13, color: "#9A96AA" },
  summary: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24, color: "#3B3650", marginTop: 6 },
  h2: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, color: "#1E1B2B", marginTop: 4 },
  p: { flex: 1, fontFamily: fonts.regular, fontSize: 16, lineHeight: 25, color: "#3B3650" },
  bulletRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 10 },
  link: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 24, borderWidth: 1.5, marginTop: 18 },
  linkText: { fontFamily: fonts.semibold, fontSize: 15 },
  error: { fontFamily: fonts.regular, fontSize: 15, color: "#6B6780", textAlign: "center", marginTop: 40, paddingHorizontal: 24 },
});
