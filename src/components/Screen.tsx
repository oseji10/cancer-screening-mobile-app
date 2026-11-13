import { ReactNode, useState } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing } from "../constants/theme";

type Props = {
  children: ReactNode;
  /** Pinned below the scrolling content (primary button, privacy note...). Rides above the keyboard. */
  footer?: ReactNode;
  contentStyle?: ViewStyle;
};

export function Screen({ children, footer, contentStyle }: Props) {
  const insets = useSafeAreaInsets();
  const [footerH, setFooterH] = useState(0);
  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom", "left", "right"]}>
      <KeyboardAwareScrollView
        // The focused field is scrolled to sit above the keyboard and the pinned footer.
        bottomOffset={footerH + 16}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </KeyboardAwareScrollView>
      {footer ? (
        // opened: the safe-area bottom padding is already below the footer, so don't lift it twice.
        <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
          <View style={styles.footer} onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}>
            {footer}
          </View>
        </KeyboardStickyView>
      ) : null}
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
    paddingBottom: 8,
    backgroundColor: colors.white,
  },
});
