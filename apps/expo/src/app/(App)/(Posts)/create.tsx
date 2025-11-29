import type { ImageSize } from "react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import { trpcClient } from "~/utils/api";
import { getBaseUrl } from "~/utils/base-url";
import { getStoredUserId } from "~/utils/user-storage";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";

export default function Create() {
  const header = "New Post";
  const baseColor = "255,178,0";
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [posting, setPosting] = useState<boolean>(false);
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
      Alert.alert("please login");
      return;
    }
    if (title.length === 0) {
      Alert.alert("Please enter a title");
      return;
    }
    if (image.length === 0) {
      Alert.alert("Please upload an image");
      return;
    }
    setPosting(true);
    console.log(storedUserId);
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
    const data = (await res.json()) as { data: string; message: string };
    if (data.message === "Success") {
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
        await trpcClient.post.create.mutate({
          title: title,
          content: content,
          image: data.data,
        });
        router.back();
      } catch (error: unknown) {
        console.error("[POST CREATE] Failed:", error);
        const message =
          error instanceof Error ? error.message : "Failed to create post";
        Alert.alert("Create failed", message);
      }
    } else {
      Alert.alert("post failed");
    }
    setPosting(false);
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
        {/* <Text>Post Title</Text> */}
        <TextInput
          style={[styles.title, styles.text20]}
          value={title}
          onChangeText={(title) => setTitle(title)}
          placeholder="Post Title"
        />
        {/* <Text>Post Content</Text> */}
        <TextInput
          style={[styles.content, styles.text20]}
          value={content}
          onChangeText={(content) => setContent(content)}
          placeholder="Content"
          multiline={true}
        />
        {image.length > 0 && (
          <Image
            source={{ uri: image }}
            style={[styles.image, { aspectRatio: width / height }]}
          />
        )}
        <Pressable
          onPress={pick}
          style={[
            styles.button,
            { backgroundColor: posting ? "#777" : "#ffb200" },
          ]}
          disabled={posting}
        >
          <Text style={[styles.text20, styles.textCenter]}>
            {image.length === 0 ? "Choose An Image" : "Choose Another Image"}
          </Text>
        </Pressable>
        <Pressable
          onPress={post}
          style={[
            styles.button,
            { backgroundColor: posting ? "#777" : "#ffb200" },
          ]}
          disabled={posting}
        >
          <Text style={[styles.text20, styles.textCenter]}>
            {posting ? "Posting" : "Post"}
          </Text>
        </Pressable>
      </AnimatedPageFrame>
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
  },
  title: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
  },
  content: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    height: 200,
    textAlignVertical: "top",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    margin: 10,
  },
  text20: {
    fontSize: 20,
  },
  textCenter: {
    textAlign: "center",
  },
});
