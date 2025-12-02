import { useCallback, useEffect, useState } from "react";
import { Text, useColorScheme } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import type { Post } from "~/definition";
import { trpcClient } from "~/utils/api";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../components/frame/EmptySpace";
import PostList from "../../../../components/postpage/PostList";

export default function PostPage() {
  const header = "Posts";
  const [posts, setPosts] = useState<Post[]>([]);
  const [load, setLoad] = useState<boolean>(true);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["post", "all"],
    queryFn: () => {
      return trpcClient.post.all.query();
    },
  });
  const onRefresh = () => {
    void refetch();
  };

  const showData = () => {
    const newPosts: Post[] = [];
    data?.forEach((post) => {
      const newPost: Post = {
        id: post.id,
        title: post.title,
        content: post.content ?? "",
        image: post.image,
        user: post.user ?? "unknown user",
        userAvatar: post.userAvatar,
        userColor: post.userColor ?? "#F5F7FB",
        time: post.createdAt.toString(),
        likes: 0,
        liked: false,
      };
      newPosts.push(newPost);
    });
    setPosts(newPosts);
  };

  const router = useRouter();
  const create = () => {
    router.push({ pathname: "/(App)/(Posts)/create" });
  };

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [refetch]),
  );

  useEffect(() => {
    setLoad(isLoading);
    showData();
  }, [data, isLoading, error]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const baseColor = isDark ? "70,70,70" : "255,178,0";
  return (
    <>
      <AnimatedPageFrame
        baseColor={baseColor}
        headerTitle={header}
        onRefresh={onRefresh}
        paddingHorizontal={0}
        headerRightOnPress={create}
        headerRightSFSymbolName="plus"
        headerRightMaterialSymbolName="restaurant"
      >
        <EmptySpace marginTop={30} />
        {load ? (
          <Text>Loading...</Text>
        ) : (
          <PostList data={posts} numColumns={2} />
        )}
      </AnimatedPageFrame>
    </>
  );
}
