import { Href, useRouter } from "expo-router";

import { PostList } from "../../components/posts/PostList";
import { colors } from "../../constants/theme";

export default function WomenPosts() {
  const router = useRouter();
  return (
    <PostList
      side="women"
      accent={colors.purple}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/home" as Href))}
      onOpen={(id) => router.push(`/posts/${id}` as Href)}
    />
  );
}
