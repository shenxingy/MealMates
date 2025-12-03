import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

import type { SearchType } from "./SearchResultsList";
import useDebounce from "~/hooks/useDebounce";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import SearchResultsList from "./SearchResultsList";

export default function SearchPage() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const baseColor = isDark ? "70,70,70" : "255,120,0";
  const header = "Search";
  const router = useRouter();
  const { query } = useLocalSearchParams();
  const searchQuery =
    typeof query === "string"
      ? query
      : Array.isArray(query)
        ? (query[0] ?? "")
        : "";
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const resolvedQuery = Platform.OS === "android" ? localQuery : searchQuery;
  const debouncedQuery = useDebounce(resolvedQuery);
  const [selectedType, setSelectedType] = useState<SearchType>("all");

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const segments: { label: string; value: SearchType }[] = [
    { label: "All", value: "all" },
    { label: "Events", value: "events" },
    { label: "Posts", value: "posts" },
  ];

  const selectedIndex = Math.max(
    segments.findIndex((segment) => segment.value === selectedType),
    0,
  );

  return (
    <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
      <View style={styles.container}>
        {!isLiquidGlassAvailable() && (
          <View style={styles.searchInputContainer}>
            <TextInput
              value={localQuery}
              onChangeText={(text) => {
                setLocalQuery(text);
                router.setParams({ query: text });
              }}
              placeholder="Search"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={[styles.searchInput, isDark && styles.searchInputDark]}
            />
            {localQuery.length > 0 && (
              <Pressable
                hitSlop={8}
                onPress={() => {
                  setLocalQuery("");
                  router.setParams({ query: "" });
                }}
                style={styles.clearButton}
              >
                <MaterialIcons
                  name="close"
                  size={18}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
              </Pressable>
            )}
          </View>
        )}
        <SegmentedControl
          values={segments.map((segment) => segment.label)}
          selectedIndex={selectedIndex}
          onValueChange={(label) => {
            const segment = segments.find(
              (entry) => entry.label === label && entry.value !== selectedType,
            );
            if (segment) {
              setSelectedType(segment.value);
            }
          }}
          style={styles.segmentedControl}
        />
        <SearchResultsList
          query={resolvedQuery}
          debouncedQuery={debouncedQuery}
          type={selectedType}
        />
      </View>
    </AnimatedPageFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  searchInputContainer: {
    position: "relative",
  },
  searchInput: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  searchInputDark: {
    backgroundColor: "rgba(45, 45, 45, 0.9)",
    borderColor: "rgba(75, 75, 75, 0.8)",
    color: "rgba(255, 255, 255, 0.85)",
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  segmentedControl: {
    height: 36,
  },
});
