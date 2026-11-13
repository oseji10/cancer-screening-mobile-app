import { Href, Redirect, useRouter } from "expo-router";

import { PostList } from "../../components/posts/PostList";
import { useChw } from "../../lib/chw/ChwContext";
import { chw } from "../../lib/chw/theme";

export default function ChwPosts() {
  const router = useRouter();
  const { live, user, ready, request } = useChw();
  if (live && ready && !user) return <Redirect href={"/chw/login" as Href} />;
  return (
    <PostList
      side="chw"
      accent={chw.teal}
      request={live ? request : undefined}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/chw" as Href))}
      onOpen={(id) => router.push(`/chw/post/${id}` as Href)}
    />
  );
}
