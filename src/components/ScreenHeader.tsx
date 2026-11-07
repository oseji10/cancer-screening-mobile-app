import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, type } from "../constants/theme";

type Props = {
  title: string;
  onBack: () => void;
};

/** Back-arrow circle on the left, centred title ("Risk Assessment"). */
export function ScreenHeader({ title, onBack }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={onBack}
        style={styles.back}
      >
        <Ionicons name="arrow-back-circle-outline" size={48} color={colors.primary500} />
      </Pressable>
      <View pointerEvents="none" style={styles.titleWrap}>
        <Text style={[type.h3, styles.title]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 56,
    justifyContent: "center",
  },
  back: {
    alignSelf: "flex-start",
  },
  titleWrap: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.black,
  },
});
