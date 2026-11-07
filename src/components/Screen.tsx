import { ReactNode } from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "../constants/theme";

type Props = {
  children: ReactNode;
  /** Pinned below the scrolling content (primary button, privacy note...). */
  footer?: ReactNode;
  contentStyle?: ViewStyle;
};

export function Screen({ children, footer, contentStyle }: Props) {
  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom", "left", "right"]}>
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.gap,
    paddingBottom: spacing.screen,
    gap: spacing.gap,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.gap,
    backgroundColor: colors.white,
  },
});
