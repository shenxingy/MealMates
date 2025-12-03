import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, Text, View } from "react-native";

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
      {liked ? (
        <Image
          source={
            require("../../assets/filled-heart.png") as ImageSourcePropType
          }
        />
      ) : (
        <Image
          source={
            require("../../assets/empty-heart.png") as ImageSourcePropType
          }
        />
      )}
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
