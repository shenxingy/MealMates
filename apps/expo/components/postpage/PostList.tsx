import { Fragment, useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";



import type { Post } from "~/definition";
import EmptySpace from "../frame/EmptySpace";
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
}: {
  data: Post[];
  numColumns: number;
}) {
  const [lists, setLists] = useState<Post[][]>([]);
  useEffect(() => {
    const func = async (data: Post[], numColumns: number) => {
      setLists(await getLists(data, numColumns));
    };
    void func(data, numColumns);
  }, [data, numColumns]);
  const renderPost = (listItem: { item: Post }) => {
    const post: Post = listItem.item;
    return <PostItem props={post}/>;
  };
  return (
    <View style={[styles.container]}>
      {lists.length > 0 &&
        lists.map((list, idx) => (
          <Fragment key={idx}>
            <EmptySpace  marginLeft={5}/>
            <FlatList
              style={[styles.column]}
              scrollEnabled={false}
              contentContainerStyle={[styles.columnContent]}
              data={list}
              renderItem={renderPost}
            />
          </Fragment>
        ))}
      <EmptySpace marginLeft={5}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  columnContent: {
    alignItems: "center",
    width: "100%",
  },
  column: {
    width: "100%",
  },
  bg: {
    backgroundColor: "#0f0",
  },
});
