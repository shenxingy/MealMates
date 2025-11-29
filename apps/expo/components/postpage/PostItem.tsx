import type { ImageSize } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import type { Post } from "~/definition";
import { trpcClient } from "~/utils/api";
import { getStoredUserId } from "~/utils/user-storage";
import Avatar from "./Avatar";
import Like from "./Like";

export default function PostItem({ props }: { props: Post }) {
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
  const onRefresh = () => {
    void likedRefetch();
    void likesRefetch();
  };
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [likesRefetch, likesRefetch]),
  );
  useEffect(() => {
    if (likedData !== undefined) {
      setLiked(likedData);
    }
    if (likesData !== undefined) {
      setThumbsup(likesData);
    }
  }, [likesData, likedData]);
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
    if (!storedUserId) {
      Alert.alert("please login");
      return;
    }
    try {
      if (likedData === true && liked === true) {
        const result = await trpcClient.postLike.delete.mutate({
          postId: props.id,
        });
        if (result.success) {
          setLiked(false);
          setThumbsup(thumbsup - 1);
        }
      } else if (likedData === false && liked === false) {
        const result = await trpcClient.postLike.create.mutate({
          postId: props.id,
        });
        if (result) {
          setLiked(true);
          setThumbsup(thumbsup + 1);
        }
      } else {
        console.log("inconsistent state");
      }
      onRefresh();
    } catch (error: unknown) {
      console.error("[POST LIKE] Failed:", error);
      const message = error instanceof Error ? error.message : "Failed to like";
      Alert.alert("Like failed", message);
    }
  };
  useEffect(() => {
    void getSize();
  }, []);
  return (
    <Pressable style={[styles.container]} onPress={seeDetails}>
      <Image
        style={[styles.image, { aspectRatio: width / height }]}
        source={{ uri: props.image }}
      />
      <Text style={styles.title}>{props.title}</Text>
      <View style={[styles.bottom, styles.margin10]}>
        <View style={[styles.bottom]}>
          <Avatar
            name={props.user}
            image={props.userAvatar}
            color={props.userColor}
          />
          <Text style={styles.grayText}>{props.user}</Text>
        </View>
        <Pressable onPress={like}>
          <Like likes={thumbsup} liked={liked} border={true} />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  margin10: {
    margin: 10,
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
