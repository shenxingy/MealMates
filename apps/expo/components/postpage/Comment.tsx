import { Image, ImageSize, StyleSheet, Text, View } from "react-native";
import Like from "./Like";
import { useState } from "react";

export interface CommentProps {
  content: string;
  image: string | undefined;
  user: string;
  likes: number;
  liked: boolean;
}

export default function Comment(props: CommentProps) {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const getSize = async () => {
    if (!props.image) return;
    const size: ImageSize = await Image.getSize(props.image);
    setWidth(size.width);
    setHeight(size.height);
  }
  getSize();
  return (
    <View style={[ styles.container ]} >
      <View>
        <Text style={styles.username} >{ props.user }</Text>
        <Text style={styles.text15} >{ props.content }</Text>
        { props.image &&
          <Image
            style={[ styles.image, {aspectRatio: width / height} ]}
            source={{ uri: props.image }}
          />
        }
      </View>
      <Like likes={props.likes} liked={props.liked} border={false} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  username: {
    color: '#777',
    fontWeight: 'bold'
  },
  text15: {
    fontSize: 15
  },
    image: {
    width: '60%',
    margin: 15,
    borderRadius: 30
  },
  bg: {
    backgroundColor: '#0ff'
  }
})