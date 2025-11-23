import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import type { Post } from "~/definition";
import { fetchPostList } from "~/utils/api";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../components/frame/EmptySpace";
import SymbolButton from "../../../../components/frame/SymbolButton";
import PostList from "../../../../components/postpage/PostList";

export default function PostPage() {
  const header = "Posts";
  const baseColor = "255,178,0";
  const [posts, setPosts] = useState<Post[]>([]);
  const onRefresh = async () => {
    const data = await fetchPostList();
    setPosts(data);
  };
  const router = useRouter();
  const create = () => {
    router.push({ pathname: "/(App)/(Posts)/create" });
  };
  useEffect(() => {
    const func = async () => {
      await onRefresh();
    };
    void func();
  }, []);

  return (
    <>
      <AnimatedPageFrame
        baseColor={baseColor}
        headerTitle={header}
        onRefresh={onRefresh}
        paddingHorizontal={0}
      >
        <EmptySpace marginTop={30} />
        <PostList data={posts} numColumns={2} />
      </AnimatedPageFrame>
      <SymbolButton
        onPress={create}
        pressableStyle={styles.pressableStyle}
        glassViewStyle={styles.glassViewStyle}
        SFSymbolName="plus"
        androidStyle={styles.androidStyle}
        MaterialSymbolName="restaurant"
      />
    </>
  );
}

const styles = StyleSheet.create({
  pressableStyle: {
    position: "absolute",
    bottom: 120,
    right: 21,
  },
  glassViewStyle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  androidStyle: {
    position: "absolute",
    bottom: 140,
    right: 21,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    elevation: 5,
  },
});
