import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, View, ViewStyle } from "react-native";

// The logo in two layers so they can move separately:
//   logo-mark.png = the flower and "B" (left 440 px of logo.png), logo-word.png = "loom" (the rest).
// If you replace assets/brand/logo.png, cut these two from it the same way (same height, split at the B).
const MARK_SHARE = 440 / 849;

/**
 * The Bloom logo, animated: the flower-and-B mark blooms in (grows and turns into place), then "loom"
 * slides in beside it, then the mark gives one soft pulse. Respects the phone's "reduce motion" setting.
 */
export function AnimatedLogo({ style, onDone }: { style?: ViewStyle; onDone?: () => void }) {
  const mark = useRef(new Animated.Value(0)).current;
  const word = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (cancelled) return;
        if (reduce) {
          mark.setValue(1);
          word.setValue(1);
          onDone?.();
          return;
        }
        Animated.sequence([
          Animated.timing(mark, { toValue: 1, duration: 850, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }),
          Animated.timing(word, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 300, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]).start(() => onDone?.());
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markStyle = {
    opacity: mark.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
    transform: [
      { scale: Animated.add(mark.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }), pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.05] })) },
      { rotate: mark.interpolate({ inputRange: [0, 1], outputRange: ["-25deg", "0deg"] }) },
    ],
  };
  const wordStyle = {
    opacity: word,
    transform: [{ translateX: word.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
  };

  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Bloom" style={[styles.box, style]}>
      <Animated.View style={[styles.mark, markStyle]}>
        <Image source={require("../../assets/brand/logo-mark.png")} style={styles.fill} resizeMode="contain" />
      </Animated.View>
      <Animated.View style={[styles.word, wordStyle]}>
        <Image source={require("../../assets/brand/logo-word.png")} style={styles.fill} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { aspectRatio: 849 / 456 },
  mark: { position: "absolute", left: 0, top: 0, bottom: 0, width: `${MARK_SHARE * 100}%` },
  word: { position: "absolute", right: 0, top: 0, bottom: 0, width: `${(1 - MARK_SHARE) * 100}%` },
  fill: { width: "100%", height: "100%" },
});
