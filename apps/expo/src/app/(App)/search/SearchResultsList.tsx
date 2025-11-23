import type { FC } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import type { RouterOutputs } from "~/utils/api";
import { trpcClient } from "~/utils/api";
import SearchEventCard from "../../../../components/cards/SearchEventCard";
import SearchPostCard from "../../../../components/cards/SearchPostCard";

type SearchResult = RouterOutputs["search"]["globalSearch"][number];
export type SearchType = "all" | "events" | "posts";

interface SearchResultsListProps {
  query: string;
  debouncedQuery: string;
  type: SearchType;
}

const SearchResultsList: FC<SearchResultsListProps> = ({
  query,
  debouncedQuery,
  type,
}) => {
  const router = useRouter();
  const trimmedQuery = query.trim();
  const trimmedDebounced = debouncedQuery.trim();

  const { data, isFetching, isError } = useQuery({
    queryKey: ["search", trimmedDebounced, type],
    enabled: trimmedDebounced.length > 0,
    queryFn: () =>
      trpcClient.search.globalSearch.query({
        query: debouncedQuery,
        type,
      }),
  });

  if (trimmedQuery.length === 0) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.placeholderText}>Type to search...</Text>
      </View>
    );
  }

  if (isFetching) {
    return (
      <View style={styles.messageContainer}>
        <ActivityIndicator size="small" color="#0F172A" />
        <Text style={styles.messageText}>Searching "{trimmedQuery}"...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          Something went wrong. Please try again.
        </Text>
      </View>
    );
  }

  const results = data ?? [];

  if (results.length === 0) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>No results for "{trimmedQuery}"</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: SearchResult }) => {
    if (item.type === "event") {
      return (
        <Pressable
          onPress={() =>
            router.push(`/(App)/(Home)/event/${item.id.toString()}`)
          }
          style={({ pressed }) => [
            styles.pressableCard,
            pressed && styles.cardPressed,
          ]}
        >
          <SearchEventCard event={item} />
        </Pressable>
      );
    }

    return <SearchPostCard post={item} />;
  };

  const keyExtractor = (item: SearchResult) =>
    item.type === "event" ? `event-${item.id}` : `post-${item.id}`;

  return (
    <FlatList
      data={results}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
};

export default SearchResultsList;

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 120,
    gap: 0,
  },
  pressableCard: {
    borderRadius: 16,
  },
  cardPressed: {
    opacity: 0.9,
  },
  messageContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  messageText: {
    fontSize: 15,
    color: "#1F2937",
  },
});
