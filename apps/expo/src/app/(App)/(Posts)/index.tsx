import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query"; 
import type { Post } from "~/definition";
import { trpcClient } from "~/utils/api";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../components/frame/EmptySpace";
import SymbolButton from "../../../../components/frame/SymbolButton";
import PostList from "../../../../components/postpage/PostList";

export default function PostPage() {
  const header = "Posts";
  const baseColor = "255,178,0";
  const [posts, setPosts] = useState<Post[]>([]);
  const [load, setLoad] = useState<Boolean>(true);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["post", "all"],
    queryFn: () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
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
        content: post.content ? post.content : "",
        image: post.image,
        user: post.user ? post.user : "unknown",
        time: post.createdAt.toString(),
        likes: 0,
        liked: false
      };
      newPosts.push(newPost);
    });
    setPosts(newPosts);
  }
  
  const router = useRouter();
  const create = () => {
    router.push({ pathname: "/(App)/(Posts)/create" });
  };

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [refetch])
  );

  useEffect(() => {
    setLoad(isLoading);
    showData();
  }, [data, isLoading, error]);

  return (
    <>
      <AnimatedPageFrame
        baseColor={baseColor}
        headerTitle={header}
        onRefresh={onRefresh}
        paddingHorizontal={0}
      >
        <EmptySpace marginTop={30} />
        { load ? (
          <Text>Loading...</Text>
        ) : (
          <PostList data={posts} numColumns={2} />
        ) }
      </AnimatedPageFrame>
      <SymbolButton
        onPress={create}
        pressableStyle={styles.pressableStyle}
        glassViewStyle={styles.glassViewStyle}
        SFSymbolName="plus"
        androidStyle={styles.androidStyle}
        MaterialSymbolName="restaurant"
      />
    </>
  );
}

const styles = StyleSheet.create({
  pressableStyle: {
    position: "absolute",
    bottom: 120,
    right: 21,
  },
  glassViewStyle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  androidStyle: {
    position: "absolute",
    bottom: 140,
    right: 21,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    elevation: 5,
  },
});
