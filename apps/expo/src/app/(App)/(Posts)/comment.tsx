import { View, Text, TextInput, Image, Pressable, StyleSheet, ImageSize, Alert, Platform } from "react-native";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
// import { createPost } from "~/utils/api";
import Back from "../../../../components/postpage/Back";
import { getBaseUrl } from "~/utils/base-url";

export default function Comment() {
  const header = "Comment";
  const baseColor = "255,178,0";
  const { postId } = useLocalSearchParams();
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [alert, setAlert] = useState<string | undefined>(undefined);
  const router = useRouter();
  const getSize = async (image: string) => {
    const size: ImageSize = await Image.getSize(image);
    setWidth(size.width);
    setHeight(size.height);
  }
  const changeText = (content: string) => {
    setContent(content);
    setAlert(undefined);
  }
  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      getSize(result.assets[0].uri);
      setAlert(undefined);
    }
  }
  const comment = async () => {
    if (image.length === 0 && content.length === 0) {
      setAlert("Please add comment content or upload an image");
      return;
    }
    const formData = new FormData();
    formData.append("post", postId);
    formData.append("content", content);
    formData.append("user", "current user");
    formData.append("likes", 0);
    formData.append("liked", false);
    if (image.length !== 0) {
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = "image/" + fileType;
      formData.append("image", {
        uri: image,
        name: "img", // any name is fine
        type: imageType,
      } as any);
    }
    const host: string = getBaseUrl();
    const res = await fetch(host + "/posts/" + postId + "/comments", {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data", },
      body: formData,
    });
    const data = await res.json();
    console.log(data);
    if (data.message === "Success") {
      router.back();
    }
    else {
      setAlert("comment failed");
    }
  }

  return (
    <>
      <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
        <Pressable onPress={router.back} >
          <Back text="< Detail" />
        </Pressable>
        <Text>Comment</Text>
        <TextInput value={content} onChangeText={changeText} />
        <Pressable onPress={pick}>
          <Text>Choose An Image</Text>
        </Pressable>
        { image.length > 0 && <Image
          source={{ uri: image }}
          style={[ styles.image, {aspectRatio: width / height} ]}
        />}
        { alert && <Text>{alert}</Text> }
        <Pressable onPress={comment}>
          <Text>Send</Text>
        </Pressable>
      </AnimatedPageFrame>
    </>
  )
}

const styles = StyleSheet.create({
  image: {
    width: '100%'
  }
})