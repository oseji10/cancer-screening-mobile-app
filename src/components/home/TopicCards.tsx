import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { fonts, topicCards } from "../../constants/theme";

export type TopicId = keyof typeof topicCards;

const CARDS: { id: TopicId; label: string; image: ImageSourcePropType }[] = [
  { id: "learn", label: "I want to learn about Breast health", image: require("../../../assets/home/card-learn.png") },
  { id: "change", label: "I noticed a change", image: require("../../../assets/home/card-change.png") },
  { id: "screening", label: "I want to do a screening", image: require("../../../assets/home/card-screening.png") },
  { id: "appointment", label: "I have an appointment", image: require("../../../assets/home/card-appointment.png") },
  { id: "risk", label: "I want to know my risk", image: require("../../../assets/home/card-risk.png") },
];

/** Horizontal row of the five "what do you want help with" cards. */
export function TopicCards({ onSelect }: { onSelect: (id: TopicId) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {CARDS.map((card) => (
        <Pressable
          key={card.id}
          accessibilityRole="button"
          accessibilityLabel={card.label}
          onPress={() => onSelect(card.id)}
          style={({ pressed }) => [styles.card, { backgroundColor: topicCards[card.id].bg }, pressed && { opacity: 0.9 }]}
        >
          <Text style={[styles.label, { color: topicCards[card.id].text }]}>{card.label}</Text>
          <View style={styles.imageWrap} pointerEvents="none">
            <Image source={card.image} style={styles.image} resizeMode="contain" />
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingRight: 16 },
  card: { width: 120, height: 175, borderRadius: 10, overflow: "hidden" },
  label: { position: "absolute", left: 11, right: 8, top: 14, fontFamily: fonts.extraBold, fontSize: 16, lineHeight: 16 },
  imageWrap: { position: "absolute", left: 0, right: 0, bottom: 0, height: 115, alignItems: "center", justifyContent: "flex-end" },
  image: { width: 100, height: 115 },
});
