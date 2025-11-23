import { useLocalSearchParams } from "expo-router";

import useDebounce from "~/hooks/useDebounce";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import SearchResultsList from "./SearchResultsList";

import useDebounce from "~/hooks/useDebounce";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import SearchResultsList from "./SearchResultsList";

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

  return (
    <AnimatedPageFrame
      baseColor={baseColor}
      headerTitle={header}
      scrollEnabled={false}
    >
      <SearchResultsList query={searchQuery} debouncedQuery={debouncedQuery} />
    </AnimatedPageFrame>
  );
}
