import { Href, Redirect } from "expo-router";

// Old route kept so existing links still work: the quiz now lives in src/app/myth-busters/.
export default function Quiz() {
  return <Redirect href={"/myth-busters" as Href} />;
}
