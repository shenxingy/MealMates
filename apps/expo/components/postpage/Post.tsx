import type { ImageSize } from "react-native";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { Post } from "~/definition";
import { likePost } from "~/utils/api";
import Like from "./Like";

export default function PostDetail({
  props,
  onRefresh,
}: {
  props: Post;
  onRefresh: () => Promise<void>;
}) {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const getSize = async (): Promise<void> => {
    const size: ImageSize = await Image.getSize(props.image);
    setWidth(size.width);
    setHeight(size.height);
  };
  const router = useRouter();
  const timePassed = () => {
    const date1: Date = new Date();
    const date2: Date = new Date(props.time);
    const year: number = date1.getFullYear() - date2.getFullYear();
    if (year > 0) return year > 1 ? year + " years ago" : "1 year ago";
    const month: number = date1.getMonth() - date2.getMonth();
    if (month > 0) return month > 1 ? month + " months ago" : "1 month ago";
    const day: number = date1.getDate() - date2.getDate();
    if (day > 0) return day > 1 ? day + " days ago" : "1 day ago";
    const hour: number = date1.getHours() - date2.getHours();
    if (hour > 0) return hour > 1 ? hour + " hours ago" : "1 hour ago";
    const min: number = date1.getMinutes() - date2.getMinutes();
    if (min > 0) return min > 1 ? min + " mins ago" : "1 min ago";
    return "just now";
  };
  const like = async () => {
    const res = await likePost(props.id, !props.liked);
    console.log(res);
    onRefresh();
  };
  getSize();
  return (
    <View style={[styles.container]}>
      <Image
        style={[styles.image, { aspectRatio: width / height }]}
        source={{ uri: props.image }}
      />
      <View style={[styles.content]}>
        <Text style={[styles.title, styles.bond]}>{props.title}</Text>
        <Text style={styles.contentText}>{props.content}</Text>
        <View style={[styles.bottom]}>
          <View>
            <Text style={[styles.grayText, styles.bond]}>{props.user}</Text>
            <Text style={styles.grayText}>{timePassed()}</Text>
          </View>
          <Pressable onPress={like}>
            <Like likes={props.likes} liked={props.liked} border={true} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 30,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: "90%",
    margin: 15,
    borderRadius: 30,
  },
  content: {
    width: "100%",
  },
  contentText: {
    marginLeft: 10,
    marginRight: 10,
    fontSize: 15,
  },
  title: {
    marginLeft: 10,
    marginRight: 10,
    fontSize: 20,
  },
  bond: {
    fontWeight: "bold",
  },
  bottom: {
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bg: {
    backgroundColor: "#f00",
  },
  grayText: {
    color: "#777",
  },
});
