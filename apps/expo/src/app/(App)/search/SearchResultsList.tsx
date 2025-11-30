import type { ElementType } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

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

const SearchResultsList: ElementType<SearchResultsListProps> = ({
  query,
  debouncedQuery,
  type,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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
        <Text style={[styles.placeholderText, isDark && styles.placeholderTextDark]}>Type to search...</Text>
      </View>
    );
  }

  if (isFetching) {
    return (
      <View style={styles.messageContainer}>
        <ActivityIndicator size="small" color={isDark ? "rgba(255, 255, 255, 0.85)" : "#0F172A"} />
        <Text style={[styles.messageText, isDark && styles.messageTextDark]}>Searching "{trimmedQuery}"...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.messageContainer}>
        <Text style={[styles.messageText, isDark && styles.messageTextDark]}>
          Something went wrong. Please try again.
        </Text>
      </View>
    );
  }

  const results = data ?? [];

  if (results.length === 0) {
    return (
      <View style={styles.messageContainer}>
        <Text style={[styles.messageText, isDark && styles.messageTextDark]}>No results for "{trimmedQuery}"</Text>
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
    <View style={styles.listContent}>
      {results.map((item) => (
        <View key={keyExtractor(item)} style={styles.cardWrapper}>
          {renderItem({ item })}
        </View>
      ))}
    </View>
  );
};

export default SearchResultsList;

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 120,
    gap: 12,
  },
  cardWrapper: {
    width: "100%",
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
  placeholderTextDark: {
    color: "#9CA3AF",
  },
  messageText: {
    fontSize: 15,
    color: "#1F2937",
  },
  messageTextDark: {
    color: "rgba(255, 255, 255, 0.85)",
  },
});
