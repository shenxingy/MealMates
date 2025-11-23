import type { ImageSize } from "react-native";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { PostComment } from "~/definition";
import { likeComment } from "~/utils/api";
import Like from "./Like";

export default function Comment({
  postId,
  props,
}: {
  postId: number;
  props: PostComment;
  onRefresh: () => void;
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
    if (!props.image) return;
    const size: ImageSize = await Image.getSize(props.image);
    setWidth(size.width);
    setHeight(size.height);
  };
  const like = async () => {
    try {
      const res = await likeComment(postId, props.id, !props.liked);
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
        <Like likes={thunbsup} liked={liked} border={false} />
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
