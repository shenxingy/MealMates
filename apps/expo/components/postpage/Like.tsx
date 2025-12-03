import { Image, StyleSheet, Text, View } from "react-native";

import emptyHeart from "../../assets/empty-heart.png";
import filledHeart from "../../assets/filled-heart.png";

export default function Like({
  likes,
  liked,
  border,
}: {
  likes: number;
  liked: boolean;
  border: boolean;
}) {
  return (
    <View style={border ? [styles.like, styles.border] : styles.like}>
      {liked ? <Image source={filledHeart} /> : <Image source={emptyHeart} />}
      <Text> {likes}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  like: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  border: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#ddd",
  },
});
