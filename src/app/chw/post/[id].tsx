import { Href, Redirect, useLocalSearchParams, useRouter } from "expo-router";

import { PostView } from "../../../components/posts/PostView";
import { useChw } from "../../../lib/chw/ChwContext";
import { chw } from "../../../lib/chw/theme";

/** Opened from the dashboard or by tapping a phone notification. Signed out: sign in first. */
export default function ChwPost() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { live, user, ready, request } = useChw();
  if (live && ready && !user) return <Redirect href={"/chw/login" as Href} />;
  if (live && !ready) return null;
  return (
    <PostView
      id={Number(id)}
      side="chw"
      accent={chw.teal}
      request={live ? request : undefined}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/chw" as Href))}
    />
  );
}
