import { StyleSheet } from "react-native";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import PostItem, { PostProps } from "../../../../components/postpage/PostItem";
import PostList from "../../../../components/postpage/PostList";

const DATA: PostProps[] = [
  {
    title: 'Today\'s Skillet!',
    image: 'https://www.cookingclassy.com/wp-content/uploads/2022/07/grilled-steak-15.jpg',
    user: 'user1',
    likes: 10,
    liked: true
  },
  {
    title: 'vege curry',
    image: 'https://currykits.com/wp-content/uploads/2017/08/Indian-vegetable-curry.jpg',
    user: 'user3',
    likes: 0,
    liked: false
  },
  {
    title: 'Wonderful!',
    image: 'https://tse2.mm.bing.net/th/id/OIP.wdhC1w1RKrP1fcEJaUVcswHaLH?rs=1&pid=ImgDetMain&o=7&rm=3',
    user: 'user2',
    likes: 100,
    liked: false
  }
];

export default function PostPage() {
  const header = "Posts";
  const baseColor = "255,178,0";

const renderPost = (post : any) => {
  return(
    <PostItem
      title={post.title}
      image={post.image}
      user={post.user}
      likes={post.likes}
      liked={post.liked}
    />
  );
}

  return (
    <>
      <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
        <PostList
          data={DATA}
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