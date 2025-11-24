import type { ImageSize } from "react-native";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getStoredUserId } from "~/utils/user-storage";
import { getBaseUrl } from "~/utils/base-url";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import Back from "../../../../components/postpage/Back";
import { trpcClient } from "~/utils/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function Create() {
  const header = "New Post";
  const baseColor = "255,178,0";
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [alert, setAlert] = useState<string | undefined>(undefined);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    getStoredUserId().then(setStoredUserId).catch(console.error);
  }, []);
  const getSize = async (image: string) => {
    const size: ImageSize = await Image.getSize(image);
    setWidth(size.width);
    setHeight(size.height);
  };
  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      void getSize(result.assets[0].uri);
      setAlert(undefined);
    }
  };
  // const createPost = useMutation({
  //   mutationFn: (input: {
  //     title: string;
  //     content: string;
  //     image: string;
  //     userId: string;
  //   }) => {
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  //     return trpcClient.post.create.mutate(input);
  //   },
  //   onError: (error) => {
  //     console.error("Failed to create post:", error);
  //   },
  // });

  const post = async () => {
    if (!storedUserId) {
      setAlert("please login");
      return;
    }
    if (title.length === 0) {
      setAlert("Please enter a title");
      return;
    }
    if (image.length === 0) {
      setAlert("Please upload an image");
      return;
    }
    const formData = new FormData();
    const uriParts = image.split(".");
    const fileType = uriParts[uriParts.length - 1];
    const imageType = "image/" + fileType;
    formData.append("title", title);
    formData.append("content", content);
    formData.append("image", {
      uri: image,
      name: "img", // any name is fine
      type: imageType,
    });
    formData.append("user", "current user");
    formData.append("time", new Date().toString());
    formData.append("likes", 0);
    formData.append("liked", false);
    const host: string = getBaseUrl();
    const res = await fetch(host + "/api/posts", {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data" },
      body: formData,
    });
    const data = (await res.json()) as { data: string, message: string };
    if (data.message === "Success") {
      // console.log("got data: " + data.data + "!!!!!!!!!!!!!!!!!!!!!!!!");
      // const url: string = data.data;
      // const input = {
      //   title: title,
      //   content: content,
      //   image: data.data,
      //   createAt: new Date(),
      //   userId: "mock_user_id"
      // }
      // createPost.mutate({
      //   title: title,
      //   content: content,
      //   image: url,
      //   userId: storedUserId,
      // });
      try {
        const res = await trpcClient.post.create.mutate({
          userId: "1fbdd0dd-90d7-4bfc-8c85-1d79d1fbbb37",
          title: title,
          content: content,
          image: image
        });
        console.log("post created!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        router.back();
      } catch (error: unknown) {
        console.error("[POST CREATE] Failed:", error);
        const message =
          error instanceof Error ? error.message : "Failed to create post";
        // setLastResult(message);
        Alert.alert("Create failed", message);
      }
    } else {
      setAlert("post failed");
    }
  };

  return (
    <>
      <AnimatedPageFrame
        baseColor={baseColor}
        headerTitle={undefined}
        enableReturnButton={true}
        returnButtonText="Posts"
      >
        {/* <Pressable onPress={router.back}>
          <Back text="< Posts" />
        </Pressable> */}
        <Text>Post Title</Text>
        <TextInput value={title} onChangeText={(title) => setTitle(title)} />
        <Text>Post Content</Text>
        <TextInput
          value={content}
          onChangeText={(content) => setContent(content)}
        />
        <Pressable onPress={pick}>
          <Text>Choose An Image</Text>
        </Pressable>
        {image.length > 0 && (
          <Image
            source={{ uri: image }}
            style={[styles.image, { aspectRatio: width / height }]}
          />
        )}
        {alert && <Text>{alert}</Text>}
        <Pressable onPress={post}>
          <Text>Post</Text>
        </Pressable>
      </AnimatedPageFrame>
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
  },
});
