import type { FC } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { RouterOutputs } from "~/utils/api";

type SearchPostResult = Extract<
  RouterOutputs["search"]["globalSearch"][number],
  { type: "post" }
>;

interface SearchPostCardProps {
  post: SearchPostResult;
}

const SearchPostCard: FC<SearchPostCardProps> = ({ post }) => {
  const createdAtLabel =
    post.createdAt instanceof Date
      ? post.createdAt.toLocaleString()
      : new Date(post.createdAt).toLocaleString();

  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={1}>
        📝 Post
      </Text>
      <Text style={styles.content} numberOfLines={3}>
        {post.content}
      </Text>
      <Text style={styles.meta}>{createdAtLabel}</Text>
    </View>
  );
};

export default SearchPostCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    shadowColor: "#102A54",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  content: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    color: "#4B5563",
  },
});
