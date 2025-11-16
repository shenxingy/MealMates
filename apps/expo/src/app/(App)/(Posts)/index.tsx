import { Text, Pressable, StyleSheet, Button } from "react-native";
import { useEffect, useState } from "react";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import PostItem, { PostProps } from "../../../../components/postpage/PostItem";
import PostList from "../../../../components/postpage/PostList";
import { fetchPostList } from "~/utils/api";
import { useRouter } from "expo-router";

export default function PostPage() {
  const header = "Posts";
  const baseColor = "255,178,0";
  const [posts, setPosts] = useState<PostProps[]>([]);
  const refresh = async () => {
    const data = await fetchPostList();
    setPosts(await fetchPostList());
  }
  const router = useRouter();
  const create = () => {
    router.push({ pathname: '/(App)/(Posts)/create' });
  }
  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
        <Pressable onPress={create}>
          <Text>New Post</Text>
        </Pressable>
        <Pressable onPress={refresh}>
          <Text>Refresh</Text>
        </Pressable>
        <PostList
          data={posts}
          numColumns={2}
        />
      </AnimatedPageFrame>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  posts: {
    fontSize: 30,
    marginTop: 30
  },
  bg: {
    backgroundColor: '#ff0'
  }
})