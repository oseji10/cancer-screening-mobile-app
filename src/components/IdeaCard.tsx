import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";

import { colors, radius, type } from "../constants/theme";

type Props = {
  text: string;
  icon: ImageSourcePropType;
};

/** Small pink hint card with the thinking-bubble icon ("If you are unsure..."). */
export function IdeaCard({ text, icon }: Props) {
  return (
    <View style={styles.card}>
      <Image source={icon} resizeMode="contain" style={styles.icon} accessibilityIgnoresInvertColors />
      <Text style={[type.bodySmall, styles.text]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 10,
    borderRadius: radius.card,
    backgroundColor: colors.ideaCard,
  },
  icon: {
    width: 36,
    height: 36,
    opacity: 0.75,
  },
  text: {
    flex: 1,
    color: colors.textBody,
  },
});
