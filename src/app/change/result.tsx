import { Href, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PillButton } from "../../components/PillButton";
import { TrackHeader } from "../../components/track/TrackHeader";
import { colors, fonts } from "../../constants/theme";
import { CHANGE_IMAGES } from "../../lib/change/images";

/** After the questionnaire: encourage the person and offer next steps. */
export default function ChangeResult() {
  const router = useRouter();

  const keepWatching = () => router.replace("/home" as Href); // No reminder is scheduled yet.
  const contactFriend = () => {
    void Share.share({ message: "I noticed a change in my breast and I'd like to talk. Can you call me when you're free?" }).catch(() => undefined);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TrackHeader title="Change Tracker" onBack={() => router.back()} info="Most breast changes are not cancer, but it is always best to get a new change checked." />

        {/* Picture: assets/change/result-illustration.png */}
        <View style={styles.art}>
          <Image source={CHANGE_IMAGES.resultIllustration} style={styles.artImg} resizeMode="cover" />
        </View>

        <Text style={styles.msg}>Trust your Instincts. Most changes are normal, but that doesn’t mean you should ignore them.</Text>
        <Text style={styles.ask}>What do you want to do next?</Text>

        <View style={styles.options}>
          <Pressable accessibilityRole="button" onPress={keepWatching} style={styles.soft}>
            <Text style={styles.softText}>Keep an eye on it. Remind me to check again in a few days</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={contactFriend} style={styles.soft}>
            <Text style={styles.softText}>Contact a friend</Text>
          </Pressable>
          <PillButton label="I want to contact a doctor" onPress={() => router.push("/find" as Href)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, gap: 18 },
  art: { height: 270, borderRadius: 40, backgroundColor: "#E4E0F3", overflow: "hidden", marginTop: 8 },
  artImg: { width: "100%", height: "100%" },
  msg: { fontFamily: fonts.regular, fontSize: 22, lineHeight: 29, textAlign: "center", color: "#4A4A4A", marginTop: 6 },
  ask: { fontFamily: fonts.semibold, fontSize: 21, textAlign: "center", color: "#4A4A4A", marginTop: 8 },
  options: { gap: 12, marginTop: 4 },
  soft: { minHeight: 56, borderRadius: 28, borderWidth: 1, borderColor: "#E4DEFA", backgroundColor: "#F3F0FF", alignItems: "center", justifyContent: "center", paddingHorizontal: 20, paddingVertical: 8 },
  softText: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 20, color: colors.trackInk, textAlign: "center" },
});
