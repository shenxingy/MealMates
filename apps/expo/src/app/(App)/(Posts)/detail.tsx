import { Button, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import { PostProps } from "../../../../components/postpage/PostItem";
import Comment, { CommentProps } from "../../../../components/postpage/Comment";
import Post from "../../../../components/postpage/Post";
import Back from "../../../../components/postpage/Back";
import { fetchPost, fetchPostComments } from "~/utils/api";

export default function PostDetails() {
  // const searchParams = useSearchParams();
  const header = "Post Details";
  const baseColor = "255,178,0";
  const { id } = useLocalSearchParams();
  const idNum: number = Number(id);
  const [post, setPost] = useState<PostProps | undefined>(undefined);
  const [comments, setComments] = useState<CommentProps[] | undefined>(undefined);
  const refresh = async () => {
    setPost(await fetchPost(idNum));
    setComments(await fetchPostComments(idNum));
  }
  const comment = () => {
    router.push({ pathname: '/(App)/(Posts)/comment', params: {postId: id}});
  }
  const router = useRouter();
  useEffect(() => {
    refresh();
  }, []);
  return (
    <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
      <Pressable onPress={router.back} >
        <Back text="< Posts" />
      </Pressable>
      <Pressable onPress={refresh} >
        <Text>refresh</Text>
      </Pressable>
      <Pressable onPress={comment} >
        <Text>comment</Text>
      </Pressable>
      { post?
        (<Post
            id={post.id}
            title={post.title}
            content={post.content}
            image={post.image}
            user={post.user}
            time={post.time}
            likes={post.likes}
            liked={post.liked}
        />):
        (
          <Text>post not found</Text>
        )
      }
      <View style={ styles.line }></View>
      { post && comments && comments.map((comment, idx) => (
        <Comment
          key={idx}
          postId={post.id}
          props={comment}
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
    borderBottomColor: '#bbb',
    marginVertical: 10
  },
  bg: {
    backgroundColor: '#00f'
  }
})