import { Href, Redirect } from "expo-router";

// Old address kept so the splash and role page keep working: the health worker area now lives at /chw.
export default function ChwLoginRedirect() {
  return <Redirect href={"/chw" as Href} />;
}
