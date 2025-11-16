import { View, Text, TextInput, Image, Pressable, StyleSheet, ImageSize, Alert, Platform } from "react-native";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
// import { createPost } from "~/utils/api";
import Back from "../../../../components/postpage/Back";

export default function Create() {
  const header = "New Post";
  const baseColor = "255,178,0";
  const [title, setTitle] = useState<string>("");
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
  const post = async () => {
    if (image.length === 0) {
      setAlert("Please upload an image");
      return;
    }
    const formData = new FormData();
    const uriParts = image.split(".");
    const fileType = uriParts[uriParts.length - 1];
    const imageType = "image/" + fileType;
    console.log("adding image");
    formData.append("image", {
        uri: image,
        name: "image name", // any name is fine
        type: imageType,
    } as any);

    // Add other text fields
    formData.append("title", title);
    formData.append("content", content);
    formData.append("user", "current user");
    // const msg: string = await createPost(formData);
    const host: string = Platform.OS === "android"? "10.0.2.2" : "localhost"
    const res = await fetch("http://" + host + ":3000/api/posts", {
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
      setAlert("post failed");
    }
  }

  return (
    <>
      <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
        <Pressable onPress={router.back} >
          <Back />
        </Pressable>
        <Text>Post Title</Text>
        <TextInput value={title} onChangeText={title => setTitle(title)} />
        <Text>Post Content</Text>
        <TextInput value={content} onChangeText={content => setContent(content)} />
        <Pressable onPress={pick}>
          <Text>Choose An Image</Text>
        </Pressable>
        { image.length > 0 && <Image
          source={{ uri: image }}
          style={[ styles.image, {aspectRatio: width / height} ]}
        />}
        { alert && <Text>{alert}</Text> }
        <Pressable onPress={post}>
          <Text>Post</Text>
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