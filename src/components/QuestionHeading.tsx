import { StyleSheet, Text, View } from "react-native";

import { colors, type } from "../constants/theme";

type Props = {
  title: string;
  subtitle?: string;
};

export function QuestionHeading({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[type.h3, styles.title]} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={[type.body, styles.subtitle]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 16,
  },
  title: {
    color: colors.black,
  },
  subtitle: {
    color: colors.textMuted,
  },
});
