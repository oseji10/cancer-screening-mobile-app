import { useCallback, useEffect, useState } from "react";

import { errorMessage } from "../api/client";
import { fetchCentres } from "../api/centres";
import { config } from "../config";
import { CENTRES, Centre, Coords, DEFAULT_CENTRE, rememberCentres, toCentres } from "./centres";

/** "nearest" = within about 150 km (or the nearest ones anywhere); "all" = every listed centre in the country. */
export type CentresMode = "nearest" | "all";

export type CentresState = {
  centres: Centre[];
  loading: boolean;
  /** Plain-language reason the list could not load, or null. */
  error: string | null;
  /** True when no centre is listed near the person, so the list shows the nearest ones anywhere. */
  expanded: boolean;
  /** True while showing the built-in sample list (no backend configured). */
  sample: boolean;
  retry: () => void;
};

/**
 * Loads centres from the NCSR backend around the person (or around Abuja until we
 * know where they are). Reloads when they move more than about a kilometre.
 */
export function useCentres(user: Coords | null, mode: CentresMode = "nearest"): CentresState {
  const [centres, setCentres] = useState<Centre[]>(config.hasBackend ? [] : CENTRES);
  const [loading, setLoading] = useState(config.hasBackend);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Round to ~1 km so GPS jitter does not cause a request every few seconds.
  const lat = user ? Math.round(user.latitude * 100) / 100 : DEFAULT_CENTRE.latitude;
  const lng = user ? Math.round(user.longitude * 100) / 100 : DEFAULT_CENTRE.longitude;

  useEffect(() => {
    if (!config.hasBackend) {
      rememberCentres(CENTRES);
      return;
    }
    const abort = new AbortController();
    setLoading(true);
    setError(null);

    fetchCentres(mode === "all" ? { lat, lng, radiusKm: 500, limit: 200 } : { lat, lng, radiusKm: 150, limit: 50 }, abort.signal)
      .then(({ data, expanded: wide }) => {
        setExpanded(wide);
        const next = toCentres(data);
        rememberCentres(next);
        setCentres(next);
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(errorMessage(e));
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });

    return () => abort.abort();
  }, [lat, lng, attempt, mode]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { centres, loading, error, expanded, sample: !config.hasBackend, retry };
}
