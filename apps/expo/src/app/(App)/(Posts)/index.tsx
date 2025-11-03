import { FlatList } from "react-native";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import PostItem from "../../../../components/postpage/PostItem";

const DATA: PostProps[] = [
  {
    title: 'Today\'s Skillet!',
    image: 'https://www.cookingclassy.com/wp-content/uploads/2022/07/grilled-steak-15.jpg',
    user: '',
    likes: 10,
    liked: true
  },
  {
    title: 'Wonderful!',
    image: 'https://tse2.mm.bing.net/th/id/OIP.wdhC1w1RKrP1fcEJaUVcswHaLH?rs=1&pid=ImgDetMain&o=7&rm=3',
    user: '',
    likes: 100,
    liked: false
  },
];

type PostProps = {
  title: string;
  image: string;
  user: string;
  likes: number;
  liked: boolean;
}


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
        <FlatList
          data={DATA}
          renderItem={renderPost}
          numColumns={2}
          horizontal={false}
        />
      </AnimatedPageFrame>
    </>
  );
}
