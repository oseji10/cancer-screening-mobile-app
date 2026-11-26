import Constants from "expo-constants";
import { useEffect, useRef } from "react";
import { Platform, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { DEFAULT_CENTRE } from "../../lib/find/centres";
import { MapBubble } from "./MapBubble";
import OsmMap from "./OsmMap";
import type { MapCanvasProps } from "./mapTypes";

/**
 * Google Maps on Android needs an API key in the build; without one the app closes as soon as the map
 * opens. app.config.js sets extra.hasGoogleMapsKey when GOOGLE_MAPS_ANDROID_API_KEY was provided.
 * Without a key, Android uses an OpenStreetMap map instead (no key or account needed).
 * Expo Go has its own Google key, so the Google map is fine there.
 */
const androidMapOk =
  Platform.OS !== "android" ||
  Constants.executionEnvironment === "storeClient" ||
  Constants.expoConfig?.extra?.hasGoogleMapsKey === true;

export default function MapCanvas(props: MapCanvasProps) {
  return androidMapOk ? <RealMap {...props} /> : <OsmMap {...props} />;
}

/** Real map (Apple Maps on iPhone, Google Maps on Android) with the live blue dot for the person. */
function RealMap({ centres, selectedId, user, onSelect, bottomInset, topInset }: MapCanvasProps) {
  const ref = useRef<MapView>(null);
  const fitted = useRef(false);

  // Frame the person and the three nearest centres the first time we know where they are.
  useEffect(() => {
    if (fitted.current) return;
    const pts = [...(user ? [user] : []), ...centres.slice(0, 3).map((c) => ({ latitude: c.lat, longitude: c.lng }))];
    if (pts.length === 0) return;
    if (user) fitted.current = true;
    ref.current?.fitToCoordinates(pts, { edgePadding: { top: topInset + 40, bottom: bottomInset + 30, left: 50, right: 50 }, animated: true });
  }, [user, centres, topInset, bottomInset]);

  // Move to a centre when its card is selected.
  useEffect(() => {
    const c = centres.find((x) => x.id === selectedId);
    if (c) ref.current?.animateCamera({ center: { latitude: c.lat, longitude: c.lng } }, { duration: 400 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return (
    <MapView
      ref={ref}
      style={styles.map}
      initialRegion={{ ...DEFAULT_CENTRE, latitudeDelta: 0.12, longitudeDelta: 0.12 }}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}
      mapPadding={{ top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {centres.map((c) => (
        <Marker
          key={`${c.id}-${c.id === selectedId}-${c.km === null ? "x" : Math.round(c.km * 10)}`}
          coordinate={{ latitude: c.lat, longitude: c.lng }}
          onPress={() => onSelect(c.id)}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <MapBubble centre={c} selected={c.id === selectedId} />
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
});
