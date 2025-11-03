import { View, Image, Text, StyleSheet } from 'react-native'

interface postProps {
  title: string;
  image: string;
  user: string;
  likes: number;
  liked: boolean;
}

export default function PostItem(props: postProps) {
  const heart: string = props.liked ?
    "../../../assets/filled-heart.png" : "../../../assets/empty-heart.png";
  return (
    <View>
      <Image source={{ uri: props.image }} />
      <Text>{props.title}</Text>
      <View>
        <Text>{props.user}</Text>
        {/* <Image source={require("../../../assets/empty-heart.png")} /> */}
        <Text>{props.likes}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20
  },
})