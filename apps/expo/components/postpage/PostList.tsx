import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

import type { Post } from "~/definition";
import PostItem from "./PostItem";

const getLists = async (data: Post[], numColumns: number) => {
  if (data.length === 0 || numColumns === 0) return [];
  const lists: Post[][] = [];
  const heights: number[] = [];
  for (let i = 0; i < numColumns; i++) {
    lists.push([]);
    heights.push(0);
  }
  let idx = 0;
  while (idx < data.length) {
    let listIdx = 0;
    for (let i = 1; i < numColumns; i++) {
      const minHeight = heights[listIdx];
      const height = heights[i];
      if (height === undefined || minHeight == undefined) break;
      if (height < minHeight) {
        listIdx = i;
      }
    }
    const post: Post | undefined = data[idx++];
    const list = lists[listIdx];
    if (!post || !list) break;
    list.push(post);
    const { width, height } = await Image.getSize(post.image);
    heights[listIdx] = (heights[listIdx] ?? 0) + height / width + 0.5;
  }
  return lists;
};

export default function PostList({
  data,
  numColumns,
  onRefresh,
}: {
  data: Post[];
  numColumns: number;
  onRefresh: () => Promise<void>;
}) {
  const [lists, setLists] = useState<Post[][]>([]);
  useEffect(() => {
    const func = async (data: Post[], numColumns: number) => {
      setLists(await getLists(data, numColumns));
    };
    func(data, numColumns);
  }, [data, numColumns]);
  const renderPost = (listItem: any) => {
    const post: Post = listItem.item;
    return <PostItem props={post} onRefresh={onRefresh} />;
  };
  return (
    <View style={[styles.container]}>
      {lists.length > 0 &&
        lists.map((list, idx) => (
          <FlatList
            key={idx}
            style={[styles.colume]}
            scrollEnabled={false}
            contentContainerStyle={[styles.columeContent]}
            data={list}
            renderItem={renderPost}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
  },
  columeContent: {
    alignItems: "center",
    width: "100%",
  },
  colume: {
    width: "100%",
  },
  bg: {
    backgroundColor: "#0f0",
  },
});
