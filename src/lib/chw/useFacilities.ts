import { useEffect, useState } from "react";

import { config } from "../config";
import { FacilityOption, searchFacilities } from "./api";

// Used only when the app is not connected to NCSR (sample mode).
const SAMPLE: FacilityOption[] = [
  { id: 1, name: "Federal Medical Centre Yola", lga: "Yola South", state: "Adamawa" },
  { id: 2, name: "Mubi General Hospital", lga: "Mubi North", state: "Adamawa" },
  { id: 3, name: "National Hospital Abuja", lga: "AMAC", state: "FCT" },
];

/** Every active facility on NCSR, for drop-downs. */
export function useFacilities() {
  const [facilities, setFacilities] = useState<FacilityOption[]>(config.hasBackend ? [] : SAMPLE);
  const [loading, setLoading] = useState(config.hasBackend);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config.hasBackend) return;
    let alive = true;
    searchFacilities()
      .then((rows) => alive && setFacilities(rows))
      .catch(() => alive && setError("Could not load the list of facilities. Check your connection."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { facilities, loading, error };
}
