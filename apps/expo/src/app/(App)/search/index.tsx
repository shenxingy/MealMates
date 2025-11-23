import { useState } from "react";
import { StyleSheet, View } from "react-native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useLocalSearchParams } from "expo-router";

import useDebounce from "~/hooks/useDebounce";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import SearchResultsList, { SearchType } from "./SearchResultsList";

export default function SearchPage() {
  const baseColor = "255,120,0";
  const header = "Search";
  const { query } = useLocalSearchParams();
  const searchQuery =
    typeof query === "string"
      ? query
      : Array.isArray(query)
        ? (query[0] ?? "")
        : "";
  const debouncedQuery = useDebounce(searchQuery);
  const [selectedType, setSelectedType] = useState<SearchType>("all");

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
    <AnimatedPageFrame
      baseColor={baseColor}
      headerTitle={header}
      scrollEnabled={false}
    >
      <View style={styles.container}>
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
          query={searchQuery}
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
  segmentedControl: {
    height: 36,
  },
});
