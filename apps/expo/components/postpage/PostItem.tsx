import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Image, Text, StyleSheet, ImageSize, Pressable } from 'react-native'
import Like from './Like';

export interface PostProps {
  id: number;
  title: string;
  content: string;
  image: string;
  user: string;
  time: Date;
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
  const router = useRouter();
  const seeDetails = () => {
    router.push({ pathname: '/(App)/(Posts)/detail', params: {id: props.id} });
  }
  getSize();
  return (
    <Pressable
      style={[ styles.container]}
      onPress={seeDetails}
    >
      <Image
        style={ [styles.image, {aspectRatio: width / height}] }
        source={{ uri: props.image }}
      />
      <Text style={styles.title} >{props.title}</Text>
      <View style={[styles.bottom]} >
        <Text style={styles.grayText} >{props.user}</Text>
        {/* <View style={styles.like} >
          { props.liked?
            (<Image source={require('../../assets/filled-heart.png')} />) :
            (<Image source={require('../../assets/empty-heart.png')} />)
          }
          <Text> {props.likes}</Text>
        </View> */}
        <Like likes={props.likes} liked={props.liked} border={true} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '80%',
    borderRadius: 20
  },
  image: {
    width: '100%',
    margin: 10,
    borderRadius: 20
  },
  title: {
    marginLeft: 10,
    marginRight: 10,
    fontSize: 15,
    fontWeight: 'bold'
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