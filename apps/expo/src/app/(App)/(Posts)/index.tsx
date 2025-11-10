import { StyleSheet } from "react-native";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import PostItem, { PostProps } from "../../../../components/postpage/PostItem";
import PostList from "../../../../components/postpage/PostList";

const DATA: PostProps[] = [
  {
    id: 0,
    title: 'Today\'s Skillet!',
    content: 'Today\'s food was fantastic',
    image: 'https://www.cookingclassy.com/wp-content/uploads/2022/07/grilled-steak-15.jpg',
    user: 'user1',
    time: new Date('2025-11-10T8:50:30'),
    likes: 10,
    liked: true
  },
  {
    id: 1,
    title: 'vege curry',
    content: 'Tandoor has vege curry today',
    image: 'https://currykits.com/wp-content/uploads/2017/08/Indian-vegetable-curry.jpg',
    user: 'user3',
    time: new Date('2025-11-09T18:50:30'),
    likes: 0,
    liked: false
  },
  {
    id: 2,
    title: 'Wonderful!',
    content: '',
    image: 'https://tse2.mm.bing.net/th/id/OIP.wdhC1w1RKrP1fcEJaUVcswHaLH?rs=1&pid=ImgDetMain&o=7&rm=3',
    user: 'user2',
    time: new Date('2025-11-09T12:10:30'),
    likes: 100,
    liked: false
  }
];

export default function PostPage() {
  const header = "Posts";
  const baseColor = "255,178,0";

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