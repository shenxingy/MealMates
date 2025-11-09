import { useState } from 'react';
import { View, Image, Text, StyleSheet, ImageSize } from 'react-native'

export interface PostProps {
  title: string;
  image: string;
  user: string;
  likes: number;
  liked: boolean;
}

export default function PostItem(props: PostProps) {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const getSize = async () => {
    const size: ImageSize = await Image.getSize(props.image);
    setWidth(size.width);
    setHeight(size.height);
  }
  getSize();
  return (
    <View style={[ styles.container]} >
      <Image
        style={ [styles.image, {aspectRatio: width / height}] }
        source={{ uri: props.image }}
      />
      <Text style={styles.title} >{props.title}</Text>
      <View style={[styles.bottom]} >
        <Text style={styles.grayText} >{props.user}</Text>
        <View style={styles.like} >
          { props.liked?
            (<Image source={require('../../assets/filled-heart.png')} />) :
            (<Image source={require('../../assets/empty-heart.png')} />)
          }
          <Text> {props.likes}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '80%',
    borderRadius: 20
  },
  content: {
    width: '90%'
  },
  image: {
    width: '100%',
    margin: 10,
    borderRadius: 20
  },
  title: {
    marginLeft: 10,
    marginRight: 10,
    fontSize: 15
  },
  bottom: {
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  like: {
    flexDirection: 'row',
  },
  bg: {
    backgroundColor: '#f00'
  },
  bg2: {
    backgroundColor: '#00f'
  },
  grayText: {
    color: '#777'
  }
})