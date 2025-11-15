import { Button, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import { PostProps } from "../../../../components/postpage/PostItem";
import Comment, { CommentProps } from "../../../../components/postpage/Comment";
import Post from "../../../../components/postpage/Post";
import { fetchPost, fetchPostComments } from "~/utils/api";

// const DATA: PostProps[] = [
//   {
//     id: 0,
//     title: 'Today\'s Skillet!',
//     content: 'Today\'s food was fantastic',
//     image: 'https://www.cookingclassy.com/wp-content/uploads/2022/07/grilled-steak-15.jpg',
//     user: 'user1',
//     time: new Date('2025-11-10T8:50:30'),
//     likes: 10,
//     liked: true
//   },
//   {
//     id: 1,
//     title: 'vege curry',
//     content: 'Tandoor has vege curry today',
//     image: 'https://currykits.com/wp-content/uploads/2017/08/Indian-vegetable-curry.jpg',
//     user: 'user3',
//     time: new Date('2025-11-09T18:50:30'),
//     likes: 0,
//     liked: false
//   },
//   {
//     id: 2,
//     title: 'Wonderful!',
//     content: '',
//     image: 'https://tse2.mm.bing.net/th/id/OIP.wdhC1w1RKrP1fcEJaUVcswHaLH?rs=1&pid=ImgDetMain&o=7&rm=3',
//     user: 'user2',
//     time: new Date('2025-11-09T12:10:30'),
//     likes: 100,
//     liked: false
//   }
// ];

// const COMMENTS: CommentProps[][] = [
//   [],
//   [
//     {
//       content: 'I ate well today too',
//       image: 'https://www.cookingclassy.com/wp-content/uploads/2022/07/grilled-steak-15.jpg',
//       user: 'user1',
//       likes: 6,
//       liked: true
//     },
//     {
//       content: 'looks great',
//       image: undefined,
//       user: 'user3',
//       likes: 8,
//       liked: false
//     }
//   ],
//   [
//     {
//       content: 'I\'ll try it',
//       image: undefined,
//       user: 'user3',
//       likes: 0,
//       liked: false
//     }
//   ]
// ]

export default function PostDetails() {
  // const searchParams = useSearchParams();
  const header = "Posts";
  const baseColor = "255,178,0";
  const { id } = useLocalSearchParams();
  const idNum: number = Number(id);
  const [post, setPost] = useState<PostProps | undefined>(undefined);
  const [comments, setComments] = useState<CommentProps[] | undefined>(undefined);
  const refresh = async () => {
    // const data = await fetchPost(idNum);
    // console.log(data);
    setPost(await fetchPost(idNum));
    setComments(await fetchPostComments(idNum));
  }
  const router = useRouter();
  useEffect(() => {
    refresh();
  }, []);
  return (
    <AnimatedPageFrame baseColor={baseColor} headerTitle={undefined}>
      <Pressable onPress={router.back} >
        <View >
        </View>
          <Text style={styles.back} >{'<'} Posts</Text>
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
      { comments && comments.map((comment, idx) => (
        <Comment
          key={idx}
          content={comment.content}
          image={comment.image}
          user={comment.user}
          likes={comment.likes}
          liked={comment.liked}
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
  back: {
    width: '30%',
    backgroundColor: '#ffa',
    borderRadius: 20,
    padding: 5,
    marginBottom: 10,
    fontSize: 25,
    textAlign: 'center'
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: '#bbb',
    marginVertical: 10
  },
  bg: {
    backgroundColor: '#00f'
  }
})