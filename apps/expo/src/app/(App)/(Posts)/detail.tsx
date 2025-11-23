import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";

import type { Post, PostComment } from "~/definition";
import { fetchPost, fetchPostComments } from "~/utils/api";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import Comment from "../../../../components/postpage/Comment";
import PostDetail from "../../../../components/postpage/Post";

export default function PostDetails() {
  const header = "Post Details";
  const baseColor = "255,178,0";
  const { id } = useLocalSearchParams();
  const idNum = Number(id);
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [comments, setComments] = useState<PostComment[] | undefined>(
    undefined,
  );
  const onRefresh = async () => {
    setPost(await fetchPost(idNum));
    setComments(await fetchPostComments(idNum));
  };
  const comment = () => {
    router.push({ pathname: "/(App)/(Posts)/comment", params: { postId: id } });
  };
  const router = useRouter();
  useEffect(() => {
    void onRefresh();
  }, []);
  return (
    <AnimatedPageFrame baseColor={baseColor} headerTitle={header} enableReturnButton={true} returnButtonText="Posts">
      <Pressable onPress={onRefresh}>
        <Text>refresh</Text>
      </Pressable>
      <Pressable onPress={comment}>
        <Text>comment</Text>
      </Pressable>
      {post ? (
        <PostDetail props={post} onRefresh={onRefresh} />
      ) : (
        <Text>post not found</Text>
      )}
      <View style={styles.line}></View>
      {post &&
        comments?.map((comment, idx) => (
          <Comment
            key={idx}
            postId={post.id}
            props={comment}
            onRefresh={onRefresh}
          />
        ))}
    </AnimatedPageFrame>
  );
}

const styles = StyleSheet.create({
  // container: {
  //   justifyContent: 'center',
  //   alignItems: 'center'
  // },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#bbb",
    marginVertical: 10,
  },
  bg: {
    backgroundColor: "#00f",
  },
});
