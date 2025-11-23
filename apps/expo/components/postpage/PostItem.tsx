import type { ImageSize } from "react-native";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { Post } from "~/definition";
import { likePost } from "~/utils/api";
import Like from "./Like";

export default function PostItem({
  props,
}: {
  props: Post;
}) {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [liked, setLiked] = useState(false);
  const [thunbsup, setThunbsup] = useState(0);

  useEffect(() => {
    const syncThumbsup = () => {
      setLiked(props.liked);
      setThunbsup(props.likes);
    }
    void syncThumbsup();
  }, [props.liked, props.likes]);

  const getSize = async () => {
    const size: ImageSize = await Image.getSize(props.image);
    setWidth(size.width);
    setHeight(size.height);
  };
  const router = useRouter();
  const seeDetails = () => {
    router.push({
      pathname: "/(App)/(Posts)/detail",
      params: { id: props.id },
    });
  };
  const like = async () => {
    try {
      const res = await likePost(props.id, !liked);
      console.log(res);
      setLiked(!liked);
      if (liked) {
        setThunbsup(thunbsup - 1);
      } else {
        setThunbsup(thunbsup + 1);
      }
    } catch (error) {
      console.error("Error liking the post:", error);
    }
  };
  useEffect(() => {
    const func = async () => {
      await getSize();
    };
    void func();
  }, []);
  return (
    <Pressable style={[styles.container]} onPress={seeDetails}>
      <Image
        style={[styles.image, { aspectRatio: width / height }]}
        source={{ uri: props.image }}
      />
      <Text style={styles.title}>{props.title}</Text>
      <View style={[styles.bottom]}>
        <Text style={styles.grayText}>{props.user}</Text>
        <Pressable onPress={like}>
          <Like likes={thunbsup} liked={liked} border={true} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  image: {
    width: "95%",
    margin: 5,
    borderRadius: 15,
  },
  title: {
    marginHorizontal: 10,
    marginTop: 5,
    fontSize: 15,
    fontWeight: "bold",
  },
  bottom: {
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  like: {
    flexDirection: "row",
  },
  bg: {
    backgroundColor: "#f00",
  },
  bg2: {
    backgroundColor: "#00f",
  },
  grayText: {
    color: "#777",
  },
});
