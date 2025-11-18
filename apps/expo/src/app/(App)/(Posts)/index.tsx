import { Text, Pressable, StyleSheet, Button } from "react-native";
import { useEffect, useState } from "react";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import PostList from "../../../../components/postpage/PostList";
import { Post } from '~/definition';
import { fetchPostList } from "~/utils/api";
import { useRouter } from "expo-router";

export default function PostPage() {
  const header = "Posts";
  const baseColor = "255,178,0";
  const [posts, setPosts] = useState<Post[]>([]);
  const onRefresh = async () => {
    const data = await fetchPostList();
    setPosts(data);
  }
  const router = useRouter();
  const create = () => {
    router.push({ pathname: '/(App)/(Posts)/create' });
  }
  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <>
      <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
        <Pressable onPress={create}>
          <Text>New Post</Text>
        </Pressable>
        {/* <Pressable onPress={onRefresh}>
          <Text>Refresh</Text>
        </Pressable> */}
        <Button onPress={onRefresh} title="Refresh" />
        <PostList
          data={posts}
          numColumns={2}
          onRefresh={onRefresh}
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
