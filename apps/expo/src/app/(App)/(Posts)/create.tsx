import { View, Text, TextInput } from "react-native";
import { useState } from "react";
// import * as ImagePicker from 'expo-image-picker';
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import PostItem, { PostProps } from "../../../../components/postpage/PostItem";

export default function Create() {
  const header = "Posts";
  const baseColor = "255,178,0";
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<string>("");
  return (
    <>
      <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
        <Text>Post Title</Text>
        <TextInput value={title} onChangeText={title => setTitle(title)} />
        <Text>Post Content</Text>
        <TextInput value={content} onChangeText={content => setContent(content)} />
        
      </AnimatedPageFrame>
    </>
  )
}