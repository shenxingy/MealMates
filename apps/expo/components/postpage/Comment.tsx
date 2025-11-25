import type { ImageSize } from "react-native";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { PostComment } from "~/definition";
import { likeComment, trpcClient } from "~/utils/api";
import Like from "./Like";
import { getStoredUserId } from "~/utils/user-storage";
import { useQuery } from "@tanstack/react-query";

export default function Comment({
  props,
}: {
  props: PostComment;
}) {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [liked, setLiked] = useState(false);
  const [thumbsup, setThumbsup] = useState(0);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  useEffect(() => {
    getStoredUserId().then(setStoredUserId).catch(console.error);
  }, []);
  const likesData = useQuery({
    queryKey: ["commentLike", "count"],
    queryFn: () => {
      return trpcClient.commentLike.count.query({ commentId: props.id });
    },
  });
  const likedData = useQuery({
    queryKey: ["commentLike", "liked"],
    queryFn: () => {
      return trpcClient.commentLike.liked.query({ commentId: props.id });
    },
  });
  const onRefresh = () => {
    if (likesData.refetch) likesData.refetch();
    if (likedData.refetch) likedData.refetch();
  }
  // useEffect(() => {
  //   const syncThumbsup = () => {
  //     setLiked(props.liked);
  //     setThumbsup(props.likes);
  //   }
  //   void syncThumbsup();
  // }, [props.liked, props.likes]);
  useEffect(() => {
    if (likedData.data !== undefined) setLiked(likedData.data);
    if (likesData.data !== undefined) setThumbsup(likesData.data);
  }, [likesData.data, likedData.data]);
  const getSize = async () => {
    if (!props.image) return;
    const size: ImageSize = await Image.getSize(props.image);
    setWidth(size.width);
    setHeight(size.height);
  };
  const like = async () => {
    if (!storedUserId) {
      Alert.alert("please login");
      return;
    }
    try {
      if (likedData.data === true) {
        const result = await trpcClient.commentLike.delete.mutate({
          commentId: props.id,
        });
        if (result.success) {
          setLiked(false);
          setThumbsup(thumbsup - 1);
        }
      }
      else if (likedData.data === false) {
        const result = await trpcClient.commentLike.create.mutate({
          commentId: props.id,
        });
        if (result) {
          setLiked(true);
          setThumbsup(thumbsup + 1);
        }
      }
      onRefresh();
    } catch (error: unknown) {
      console.error("[COMMENT LIKE] Failed:", error);
      const message = error instanceof Error ? error.message : "Failed to like";
      Alert.alert("Like failed", message);
    }
  };

  useEffect(() => {
    const func = async () => {
      await getSize();
    };
    void func();
  }, []);
  return (
    <View style={[styles.container]}>
      <View>
        <Text style={styles.username}>{props.user}</Text>
        <Text style={styles.text15}>{props.content}</Text>
        {props.image && (
          <Image
            style={[styles.image, { aspectRatio: width / height }]}
            source={{ uri: props.image }}
          />
        )}
      </View>
      <Pressable onPress={like}>
        <Like likes={thumbsup} liked={liked} border={false} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 10,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  username: {
    color: "#777",
    fontWeight: "bold",
  },
  text15: {
    fontSize: 15,
  },
  image: {
    width: "60%",
    margin: 15,
    borderRadius: 30,
  },
  bg: {
    backgroundColor: "#0ff",
  },
});
