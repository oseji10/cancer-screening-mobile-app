import { Ionicons } from "@expo/vector-icons";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DateStrip } from "../../components/home/DateStrip";
import { RiskResultCard } from "../../components/home/RiskResultCard";
import { SbeReminderCard } from "../../components/home/SbeReminderCard";
import { TopicCards, TopicId } from "../../components/home/TopicCards";
import { PostStrip } from "../../components/posts/PostStrip";
import { colors, fonts } from "../../constants/theme";
import { BiometricNudge } from "../../components/auth/BiometricNudge";
import { useAuth } from "../../lib/auth/AuthContext";
import { useNotifications } from "../../lib/notifications/NotificationsContext";
import { useProfile } from "../../lib/profile/ProfileContext";
import { assessRisk, RiskLevel } from "../../lib/risk/scoring";
import { loadAssessment } from "../../lib/risk/storage";

const RESULT_TITLE: Record<RiskLevel, string> = {
  "act-now": "See a health worker soon",
  higher: "Risk may be higher than average",
  moderate: "Risk looks average to moderate",
  typical: "Risk looks typical",
};

function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Where each Home card goes. Only the risk assessment exists so far; the rest
// land on the section's tab until that section is built.
const ROUTES: Record<TopicId, string> = {
  learn: "/learn",
  change: "/symptoms",
  screening: "/screening/intro",
  appointment: "/find",
  risk: "/risk-assessment",
};

// What the user picked in setup -> the Home card to put first.
// "Finding communities" has no card yet, so it features nothing.
const FEATURED: Record<string, TopicId | undefined> = {
  "breast-health": "learn",
  screening: "screening",
  appointment: "appointment",
  community: undefined,
};

export default function Home() {
  const router = useRouter();
  const { unread } = useNotifications();
  const { signedIn } = useAuth();
  const { profile, reset } = useProfile();
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  useFocusEffect(
    useCallback(() => {
      void loadAssessment().then((r) => setRiskLevel(r ? assessRisk(r.answers).level : null));
    }, []),
  );
  const hello = profile.name ? `${greeting(new Date().getHours())}, ${profile.name}` : greeting(new Date().getHours());

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.greetings}>
            {/* DEV ONLY: long-press the greeting (about 1 second) to restart from the splash.
                __DEV__ is false in production builds, so this does nothing for real users. */}
            <Pressable
              disabled={!__DEV__}
              delayLongPress={800}
              onLongPress={() => void reset().then(() => router.replace("/" as Href))}
            >
              <Text style={styles.hello} numberOfLines={1}>{hello}</Text>
            </Pressable>
            <Text style={styles.welcome}>Welcome back to Bloom</Text>
          </View>
          <Pressable
            style={styles.bell}
            accessibilityLabel={unread > 0 ? `Notifications, ${unread} new` : "Notifications"}
            accessibilityRole="button"
            onPress={() => router.push("/notifications" as Href)}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.black} />
            {unread > 0 ? <View style={styles.badge} /> : null}
          </Pressable>
        </View>

        <DateStrip />
        <BiometricNudge scope="client" accent={colors.purple} visible={signedIn} onEnable={() => router.push({ pathname: "/account/biometric", params: { next: "/home" } } as unknown as Href)} />
        <SbeReminderCard onStart={() => router.push("/change-tracker" as Href)} />
        {riskLevel ? <RiskResultCard title={RESULT_TITLE[riskLevel]} onPress={() => router.push("/risk-assessment/done" as Href)} /> : null}

        <Text style={styles.quickFind}>What do you want help with today?</Text>
        <TopicCards featured={profile.need ? FEATURED[profile.need] : undefined} onSelect={(id) => router.push(ROUTES[id] as Href)} />

        <PostStrip side="women" accent={colors.purple} inset={16} onOpen={(id) => router.push(`/posts/${id}` as Href)} onViewAll={() => router.push("/posts" as Href)} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 69 },
  greetings: { flex: 1, gap: 8, paddingRight: 12 },
  hello: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 32, color: colors.black },
  welcome: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.black },
  bell: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.reminderBg, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -2, right: -2, width: 13, height: 13, borderRadius: 7, backgroundColor: colors.badge },
  quickFind: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.black, paddingHorizontal: 10 },
});
