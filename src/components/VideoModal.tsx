import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../constants/theme";

type Props = { visible: boolean; source: number; onClose: () => void };

function Player({ source }: { source: number }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.play();
  });
  return <VideoView player={player} style={styles.video} nativeControls contentFit="contain" />;
}

/** Full-screen video player. The player is only mounted while visible, so closing stops playback. */
export function VideoModal({ visible, source, onClose }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} supportedOrientations={["portrait", "landscape"]}>
      <View style={styles.root}>
        {visible ? <Player source={source} /> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close video"
          onPress={onClose}
          hitSlop={10}
          style={[styles.close, { top: insets.top + 12 }]}
        >
          <Ionicons name="close" size={24} color={colors.white} />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  video: { width: "100%", aspectRatio: 16 / 9 },
  close: { position: "absolute", right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
});
