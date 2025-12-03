import { useCallback, useMemo } from "react";
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
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["post", "all"],
    queryFn: () => {
      return trpcClient.post.all.query();
    },
  });
  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const posts = useMemo(() => {
    if (!data) return [];
    return data.map(
      (post): Post => ({
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
      }),
    );
  }, [data]);

  const router = useRouter();
  const create = () => {
    router.push({ pathname: "/(App)/(Posts)/create" });
  };

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh]),
  );

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
        {error ? (
          <Text>Failed to load posts</Text>
        ) : isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <PostList data={posts} numColumns={2} />
        )}
      </AnimatedPageFrame>
    </>
  );
}
