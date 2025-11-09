import PostItem, { PostProps } from "./PostItem";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, Image } from "react-native";

const renderPost = (listItem : any) => {
  const post: PostProps = listItem.item;
  return(
    <PostItem
      title={post.title}
      image={post.image}
      user={post.user}
      likes={post.likes}
      liked={post.liked}
    />
  );
}

const getLists = async (data: PostProps[], numColumns: number) => {
  if (data.length === 0 || numColumns === 0) return [];
  let lists: PostProps[][] = []
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
    const post: PostProps | undefined = data[idx++];
    const list = lists[listIdx];
    if (!post || !list) break;
    list.push(post);
    const { width, height } = await Image.getSize(post.image);
    // console.log('h: ' + height + ', w: ' + width);
    heights[listIdx] = (heights[listIdx] ?? 0) + height / width + 0.5;
  }
  return lists;
}

export default function PostList({data, numColumns} : { data: PostProps[], numColumns: number }) {
  const [lists, setLists] = useState<PostProps[][]>([]);
  useEffect(() => {
    const func = async (data: PostProps[], numColumns: number) => {
      setLists(await getLists(data, numColumns))
    }
    func(data, numColumns);
  }, [data, numColumns]);
  return (
    <View style={ [styles.container] } >
      { lists.length > 0 && lists.map((list, idx) => (
        <FlatList
          key={idx}
          style={ [styles.colume] }
          contentContainerStyle={[styles.columeContent]}
          data={list}
          renderItem={renderPost}
        />))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
  },
  columeContent: {
    alignItems: 'center',
    width: '100%'
  },
  colume: {
    // width: '90%'
  },
  bg: {
    backgroundColor: '#0f0'
  }
})