import { Href, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PillButton } from "../../components/PillButton";
import { colors, fonts, slideTints } from "../../constants/theme";

type Slide = {
  title: string;
  body: string;
  image: ImageSourcePropType;
  /** Share of the screen height used by the illustration area. */
  artShare: number;
};

const SLIDES: Slide[] = [
  {
    title: "Keep up with your breast health with Bloom",
    body: "Bloom is your breast health pocket app, helps you to keep track of changes and learn about breast ", // text is cut off in Figma
    image: require("../../../assets/onboarding/slide-1.png"),
    artShare: 0.51,
  },
  {
    title: "Our contents are easy to follow",
    body: "Our content were developed to ensure that every woman can perform activities on their own, and at any time.",
    image: require("../../../assets/onboarding/slide-2.png"),
    artShare: 0.545,
  },
  {
    title: "Find screening centers near you",
    body: "You can find screening centers near you through the App. We also have a preparatory guide to help you navigate screening.",
    image: require("../../../assets/onboarding/slide-3.png"),
    artShare: 0.545,
  },
];

/**
 * Three intro slides, then the profile-setup steps. Only the current slide is
 * rendered; the page is plain state, so Continue, Skip and swipes always agree.
 */
export default function OnboardingSlides() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  // Keep the latest index available to the pan responder, which outlives renders.
  const indexRef = useRef(index);
  indexRef.current = index;

  const toSetup = () => router.replace("/onboarding/intro" as Href);

  const next = () => {
    if (indexRef.current >= SLIDES.length - 1) toSetup();
    else setIndex(indexRef.current + 1);
  };

  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 16 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderRelease: (_, g) => {
          if (g.dx < -50) setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
          else if (g.dx > 50) setIndex((i) => Math.max(i - 1, 0));
        },
      }),
    [],
  );

  const slide = SLIDES[index];

  return (
    <View style={{ flex: 1, backgroundColor: slideTints[index] }} {...swipe.panHandlers}>
      <Image source={slide.image} style={{ width, height: height * slide.artShare + 40 }} resizeMode="contain" />
      <View style={[styles.card, { paddingBottom: 24 + insets.bottom }]}>
        <View style={styles.dots}>
          {SLIDES.map((s, dot) => (
            <View key={s.title} style={dot === index ? styles.dotActive : styles.dot} />
          ))}
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
        <View style={styles.actions}>
          <PillButton label="Continue" onPress={next} />
          <Pressable accessibilityRole="button" onPress={toSetup} hitSlop={12}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopRightRadius: 63,
    borderTopLeftRadius: 10,
    paddingTop: 48,
    paddingLeft: 64,
    paddingRight: 24,
    gap: 20,
  },
  dots: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 7, height: 7, borderRadius: 31, backgroundColor: colors.dotIdle },
  dotActive: { width: 33, height: 7, borderRadius: 31, backgroundColor: colors.dotActive },
  title: { fontFamily: fonts.semibold, fontSize: 28, lineHeight: 36, color: colors.black },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 24, color: colors.black },
  actions: { gap: 14, alignItems: "center" },
  skip: { fontFamily: fonts.nunito, fontSize: 15, lineHeight: 23, color: colors.skipLight },
});
