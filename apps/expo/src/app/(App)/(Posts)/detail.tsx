import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useQuery } from "@tanstack/react-query";

import type { Post, PostComment } from "~/definition";
import { trpcClient } from "~/utils/api";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import Comment from "../../../../components/postpage/Comment";
import PostDetail from "../../../../components/postpage/Post";

export default function PostDetails() {
  const header = "Post Details";
  const baseColor = "255,178,0";
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [comments, setComments] = useState<PostComment[] | undefined>(
    undefined,
  );
  const postData = useQuery({
    queryKey: ["post", "byId"],
    queryFn: () => {
      return trpcClient.post.byId.query({ id });
    },
  });
  const commentsData = useQuery({
    queryKey: ["comment", "byPost"],
    queryFn: () => {
      return trpcClient.comment.byPost.query({ postId: id });
    },
  });
  const onRefresh = () => {
    void postData.refetch();
    void commentsData.refetch();
  };
  const showData = () => {
    if (postData.data) {
      const data = postData.data;
      const newPost: Post = {
        id: data.id,
        title: data.title,
        content: data.content ?? "",
        image: data.image,
        user: data.user ?? "unknown user",
        userAvatar: data.userAvatar,
        userColor: data.userColor ?? "#F5F7FB",
        time: data.createdAt.toString(),
        likes: 0,
        liked: false,
      };
      setPost(newPost);
    }
    const newComments: PostComment[] = [];
    commentsData.data?.forEach((comment) => {
      const newComment: PostComment = {
        id: comment.id,
        postId: comment.postId,
        content: comment.content ?? "",
        image: comment.image ?? undefined,
        user: comment.user ?? "unknown user",
        userAvatar: comment.userAvatar,
        userColor: comment.userColor ?? "#F5F7FB",
        likes: 0,
        liked: false,
      };
      newComments.push(newComment);
    });
    setComments(newComments);
    // setPost(await fetchPost(idNum));
    // setComments(await fetchPostComments(idNum));
  };
  const comment = () => {
    router.push({ pathname: "/(App)/(Posts)/comment", params: { postId: id } });
  };
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      setPost(undefined);
      setComments(undefined);
      onRefresh();
    }, [postData.refetch, commentsData.refetch]),
  );
  useEffect(() => {
    showData();
  }, [
    postData.data,
    postData.isLoading,
    commentsData.data,
    commentsData.isLoading,
  ]);
  return (
    <>
      <AnimatedPageFrame
        baseColor={baseColor}
        headerTitle={header}
        enableReturnButton={true}
        headerRightOnPress={comment}
        headerRightSFSymbolName="plus"
        headerRightMaterialSymbolName="comment"
      >
        {post ? <PostDetail props={post} /> : <Text>Loading...</Text>}
        {post && <View style={styles.line}></View>}
        {post &&
          comments?.map((comment, idx) => (
            <Comment key={idx} props={comment} />
          ))}
      </AnimatedPageFrame>
    </>
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
  comment: {
    width: "40%",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    margin: 10,
  },
  text20: {
    fontSize: 20,
    textAlign: "center",
  },
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
