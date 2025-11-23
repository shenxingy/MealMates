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
    const res = await likePost(props.id, !props.liked);
    console.log(res);
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
          <Like likes={props.likes} liked={props.liked} border={true} />
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
    width: "90%",
    margin: 10,
    borderRadius: 20,
  },
  title: {
    marginLeft: 10,
    marginRight: 10,
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
