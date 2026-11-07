import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Coords } from "./centres";

export type LocationStatus = "idle" | "asking" | "live" | "denied" | "error";

/** Asks for permission, then follows the person's position in real time until the screen unmounts. */
export function useUserLocation() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [coords, setCoords] = useState<Coords | null>(null);
  const sub = useRef<Location.LocationSubscription | null>(null);

  const stop = useCallback(() => {
    sub.current?.remove();
    sub.current = null;
  }, []);

  const start = useCallback(async () => {
    stop();
    setStatus("asking");
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        setStatus("denied");
        return;
      }
      // Show something quickly, then keep updating as they move.
      const last = await Location.getLastKnownPositionAsync();
      if (last) setCoords({ latitude: last.coords.latitude, longitude: last.coords.longitude });
      sub.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 25 },
        (pos) => {
          setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setStatus("live");
        },
      );
    } catch {
      setStatus("error");
    }
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { status, coords, start };
}
