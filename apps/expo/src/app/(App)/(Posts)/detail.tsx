import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";

import type { Post, PostComment } from "~/definition";
import { fetchPost, fetchPostComments, trpcClient } from "~/utils/api";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import Comment from "../../../../components/postpage/Comment";
import PostDetail from "../../../../components/postpage/Post";
import { useQuery } from "@tanstack/react-query";

// const getComments = (postId: string) => {
//   console.log("getting comments!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
//   const { data } = useQuery({
//     queryKey: ["comment", "byPost"],
//     queryFn: () => {
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//       return trpcClient.comment.byPost.query({ postId });
//     },
//   });
//   const comments: PostComment[] = [];
//   data?.forEach((comment) => {
//     const newComment: PostComment = {
//       id: comment.id,
//       postId: comment.postId,
//       content: comment.content ? comment.content : "",
//       image: comment.image ? comment.image : undefined,
//       user: "current user",
//       likes: 0,
//       liked: false
//     };
//   })
//   return comments;
// }

export default function PostDetails() {
  // const header = "Post Details";
  const baseColor = "255,178,0";
  const { id } = useLocalSearchParams() as { id: string };
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [comments, setComments] = useState<PostComment[] | undefined>(
    undefined,
  );
  const postData = useQuery({
    queryKey: ["post", "byId"],
    queryFn: () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return trpcClient.post.byId.query({ id });
    },
  });
  const commentsData = useQuery({
    queryKey: ["comment", "byPost"],
    queryFn: () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return trpcClient.comment.byPost.query({ postId: id });
    },
  });
  const onRefresh = async () => {
    console.log("refreshing!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(postData);
    console.log(commentsData);
    if (postData.data) {
      const data = postData.data;
      const newPost: Post = {
        id: data.id,
        title: data.title,
        content: data.content ? data.content : "",
        image: data.image,
        user: "current user",
        time: data.createdAt.toString(),
        likes: 0,
        liked: false
      };
      setPost(newPost);
    }
    const newComments: PostComment[] = [];
    commentsData.data?.forEach((comment) => {
      const newComment: PostComment = {
        id: comment.id,
        postId: comment.postId,
        content: comment.content ? comment.content : "",
        image: comment.image ? comment.image : undefined,
        user: "current user",
        likes: 0,
        liked: false
      };
      newComments.push(newComment);
    })
    setComments(newComments);
    // setPost(await fetchPost(idNum));
    // setComments(await fetchPostComments(idNum));
  };
  const comment = () => {
    router.push({ pathname: "/(App)/(Posts)/comment", params: { postId: id } });
  };
  const router = useRouter();
  useEffect(() => {
    void onRefresh();
  }, [postData.data, postData.isLoading, commentsData.data, commentsData.isLoading]);
  return (
    <AnimatedPageFrame baseColor={baseColor} headerTitle={undefined} enableReturnButton={true} returnButtonText="Posts">
      {/* <Pressable onPress={onRefresh}>
        <Text>refresh</Text>
      </Pressable> */}
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
