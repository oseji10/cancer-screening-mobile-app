import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";

import { colors, radius, type } from "../constants/theme";

type Props = {
  body: string;
  backgroundColor: string;
  image: ImageSourcePropType;
  imageFit?: "contain" | "cover";
};

/** The tinted "Why we ask" card with an illustration on the right. */
export function WhyWeAskCard({ body, backgroundColor, image, imageFit = "contain" }: Props) {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.text}>
        <Text style={[type.label, styles.title]}>Why we ask</Text>
        <Text style={[type.body, styles.body]}>{body}</Text>
      </View>
      <Image source={image} resizeMode={imageFit} style={styles.image} accessibilityIgnoresInvertColors />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 180,
    borderRadius: radius.card,
    overflow: "hidden",
  },
  text: {
    width: "50%",
    paddingLeft: 16,
    paddingTop: 22,
    paddingBottom: 20,
    gap: 4,
  },
  title: {
    color: colors.primary500,
  },
  body: {
    color: colors.textBody,
  },
  image: {
    position: "absolute",
    right: 0,
    top: 22,
    width: "48%",
    height: 148,
  },
});
