import type { ImageSize } from "react-native";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import type { Post } from "~/definition";
import { trpcClient } from "~/utils/api";
import { getStoredUserId } from "~/utils/user-storage";
import Avatar from "./Avatar";
import Like from "./Like";

export default function PostDetail({ props }: { props: Post }) {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [liked, setLiked] = useState(false);
  const [thumbsup, setThumbsup] = useState(0);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);

  useEffect(() => {
    getStoredUserId().then(setStoredUserId).catch(console.error);
  }, []);

  const { data: likesData, refetch: likesRefetch } = useQuery({
    queryKey: ["postLike", "count", props.id],
    queryFn: () => {
      return trpcClient.postLike.count.query({ postId: props.id });
    },
  });

  const { data: likedData, refetch: likedRefetch } = useQuery({
    queryKey: ["postLike", "liked", props.id],
    queryFn: () => {
      return trpcClient.postLike.liked.query({ postId: props.id });
    },
  });

  useEffect(() => {
    if (likedData !== undefined) setLiked(likedData);
    if (likesData !== undefined) setThumbsup(likesData);
  }, [likesData, likedData]);

  const getSize = async (): Promise<void> => {
    const size: ImageSize = await Image.getSize(props.image);
    setWidth(size.width);
    setHeight(size.height);
  };

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
    if (!storedUserId) {
      Alert.alert("please login");
      return;
    }
    try {
      console.log("likedData: " + likedData);
      console.log("liked: " + liked);
      if (likedData === true && liked === true) {
        console.log("unliking");
        const result = await trpcClient.postLike.delete.mutate({
          postId: props.id,
        });
        if (result.success) {
          setLiked(false);
          setThumbsup(thumbsup - 1);
        }
      } else if (likedData === false && liked === false) {
        console.log("liking");
        const result = await trpcClient.postLike.create.mutate({
          postId: props.id,
        });
        if (result) {
          setLiked(false);
          setThumbsup(thumbsup + 1);
        }
      } else {
        console.log("inconsistent state");
      }
      void likedRefetch();
      void likesRefetch();
    } catch (error: unknown) {
      console.error("[POST LIKE] Failed:", error);
      const message = error instanceof Error ? error.message : "Failed to like";
      Alert.alert("Like failed", message);
    }
  };
  useEffect(() => {
    const func = async () => {
      await getSize();
    };
    void func();
  }, [getSize]);
  return (
    <View style={[styles.container]}>
      <Image
        style={[styles.image, { aspectRatio: width / height }]}
        source={{ uri: props.image }}
      />
      <View style={[styles.content]}>
        <Text style={[styles.title, styles.bond]}>{props.title}</Text>
        <Text style={styles.contentText}>{props.content}</Text>
        <View style={[styles.bottom, styles.margin10]}>
          <View style={[styles.bottom]}>
            <Avatar
              name={props.user}
              image={props.userAvatar}
              color={props.userColor}
            />
            <View>
              <Text style={[styles.grayText, styles.bond]}>{props.user}</Text>
              <Text style={styles.grayText}>{timePassed()}</Text>
            </View>
          </View>
          <Pressable onPress={like}>
            <Like likes={thumbsup} liked={liked} border={true} />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  margin10: {
    margin: 10,
  },
  bg: {
    backgroundColor: "#f00",
  },
  grayText: {
    color: "#777",
  },
});
