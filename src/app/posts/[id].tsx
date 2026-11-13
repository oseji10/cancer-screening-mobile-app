import { Href, useLocalSearchParams, useRouter } from "expo-router";

import { PostView } from "../../components/posts/PostView";
import { colors } from "../../constants/theme";

export default function WomenPost() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PostView id={Number(id)} side="women" accent={colors.purple} onBack={() => (router.canGoBack() ? router.back() : router.replace("/home" as Href))} />;
}
