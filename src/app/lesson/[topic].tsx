import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { VideoModal } from "../../components/VideoModal";
import { PillButton } from "../../components/PillButton";
import { Screen } from "../../components/Screen";
import { SetupHeader } from "../../components/SetupHeader";
import { colors, fonts } from "../../constants/theme";
import { findTopic } from "../../lib/learn/lessons";

/** Renders "**word**" as bold. */
function RichText({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <Text style={styles.body}>
      {parts.map((part, i) => (
        <Text key={i} style={i % 2 === 1 ? styles.bold : undefined}>
          {part}
        </Text>
      ))}
    </Text>
  );
}

/** One lesson: slide by slide (title, picture, text), then the "Yay!!" finish screen. */
export default function Lesson() {
  const router = useRouter();
  const { topic: topicId } = useLocalSearchParams<{ topic: string }>();
  const topic = findTopic(topicId);
  const [step, setStep] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  const exit = () => router.replace("/learn" as Href);

  if (!topic || topic.slides.length === 0) {
    return (
      <Screen footer={<View style={styles.footer}><PillButton label="Back to Learn" onPress={exit} /></View>}>
        <Text style={styles.soon}>{topic ? `${topic.title}: lessons are coming soon.` : "Lesson not found."}</Text>
      </Screen>
    );
  }

  if (step >= topic.slides.length) {
    return (
      <View style={styles.yay}>
        <View style={styles.yayCopy}>
          <Text style={styles.yayTitle}>Yay!!</Text>
          <Text style={styles.yaySub}>You are becoming more breast aware</Text>
        </View>
        <Image source={require("../../../assets/learn/yay-stars.png")} style={styles.yayArt} resizeMode="contain" />
        <View style={styles.yayActions}>
          <PillButton label="Test my knowledge" onPress={() => router.push("/myth-busters" as Href)} />
          <Pressable accessibilityRole="button" onPress={() => router.replace("/home" as Href)} style={styles.homeBtn}>
            <Text style={styles.homeLabel}>I want to go Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const slide = topic.slides[step];
  const goBack = () => (step === 0 ? exit() : setStep(step - 1));
  const next = () => setStep(step + 1);

  return (
    <Screen
      contentStyle={styles.content}
      footer={<View style={styles.footer}><PillButton label="Continue" onPress={next} /></View>}
    >
      <SetupHeader progress={(step + 1) / topic.slides.length} onBack={goBack} onSkip={() => setStep(topic.slides.length)} />
      <Text style={styles.title}>{slide.title}</Text>
      <View style={styles.imageBox}>
        <Image source={slide.image} style={styles.image} resizeMode="contain" />
        {slide.playable ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Play video" onPress={() => slide.video && setVideoOpen(true)} style={styles.play}>
            <Ionicons name="play" size={18} color={colors.white} />
          </Pressable>
        ) : null}
      </View>
      <RichText text={slide.body} />
      {slide.video ? <VideoModal visible={videoOpen} source={slide.video} onClose={() => setVideoOpen(false)} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  title: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 28, color: colors.setupPurple },
  imageBox: { borderRadius: 20, overflow: "hidden", backgroundColor: "#F5F1FF", aspectRatio: 728 / 824 },
  image: { width: "100%", height: "100%" },
  play: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6B7A",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24, color: colors.black },
  bold: { fontFamily: fonts.bold },
  footer: { paddingBottom: 24 },
  soon: { fontFamily: fonts.regular, fontSize: 16, color: colors.textMuted, padding: 24 },
  // Finish screen
  yay: { flex: 1, backgroundColor: "#F5F1FF", paddingHorizontal: 16, paddingTop: 72, paddingBottom: 40, justifyContent: "space-between" },
  yayCopy: { gap: 4 },
  yayTitle: { fontFamily: fonts.bold, fontSize: 40, lineHeight: 48, color: colors.black },
  yaySub: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 24, color: "#6B6880" },
  yayArt: { flex: 1, width: "100%", marginVertical: 16 },
  yayActions: { gap: 16 },
  homeBtn: { height: 56, borderRadius: 999, backgroundColor: colors.setupTrack, alignItems: "center", justifyContent: "center" },
  homeLabel: { fontFamily: fonts.semibold, fontSize: 16, color: colors.skip },
});
