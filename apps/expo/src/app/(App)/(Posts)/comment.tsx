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
import { useLocalSearchParams, useRouter } from "expo-router";

import { trpcClient } from "~/utils/api";
import { getBaseUrl } from "~/utils/base-url";
import { getStoredUserId } from "~/utils/user-storage";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";

export default function Comment() {
  const header = "Comment";
  const baseColor = "255,178,0";
  const { postId }: { postId: string } = useLocalSearchParams();
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [sending, setSending] = useState<boolean>(false);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  useEffect(() => {
    getStoredUserId().then(setStoredUserId).catch(console.error);
  }, []);
  const router = useRouter();
  const getSize = async (image: string) => {
    const size: ImageSize = await Image.getSize(image);
    setWidth(size.width);
    setHeight(size.height);
  };
  const changeText = (content: string) => {
    setContent(content);
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
  const comment = async () => {
    if (!storedUserId) {
      Alert.alert("please login");
      return;
    }
    if (image.length === 0 && content.length === 0) {
      Alert.alert("Please add comment content or upload an image");
      return;
    }
    setSending(true);
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
      });
    }
    const host: string = getBaseUrl();
    const res = await fetch(`${host}/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data" },
      body: formData,
    });
    const data = (await res.json()) as { data: string; message: string };
    if (data.message === "Success") {
      try {
        await trpcClient.comment.create.mutate({
          postId: postId,
          content: content,
          image: data.data.length > 0 ? data.data : undefined,
        });
        router.back();
      } catch (error: unknown) {
        console.error("[COMMENT CREATE] Failed:", error);
        const message =
          error instanceof Error ? error.message : "Failed to create post";
        Alert.alert("Create failed", message);
      }
    } else {
      Alert.alert("comment failed");
    }
    setSending(false);
  };

  return (
    <>
      <AnimatedPageFrame
        baseColor={baseColor}
        headerTitle={header}
        enableReturnButton={true}
        returnButtonText="Detail"
      >
        <TextInput
          style={[styles.content, styles.text20]}
          value={content}
          onChangeText={changeText}
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
            { backgroundColor: sending ? "#777" : "#ffb200" },
          ]}
          disabled={sending}
        >
          <Text style={[styles.text20, styles.textCenter]}>
            {image.length === 0 ? "Choose An Image" : "Choose Another Image"}
          </Text>
        </Pressable>
        <Pressable
          onPress={comment}
          style={[
            styles.button,
            { backgroundColor: sending ? "#777" : "#ffb200" },
          ]}
          disabled={sending}
        >
          <Text style={[styles.text20, styles.textCenter]}>
            {sending ? "Sending" : "Send"}
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
  content: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    height: 200,
    textAlignVertical: "top",
  },
  text20: {
    fontSize: 20,
  },
  textCenter: {
    textAlign: "center",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    margin: 10,
  },
});
