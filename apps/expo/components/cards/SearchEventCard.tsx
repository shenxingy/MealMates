import type { FC } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { RouterOutputs } from "~/utils/api";

type SearchEventResult = Extract<
  RouterOutputs["search"]["globalSearch"][number],
  { type: "event" }
>;

interface SearchEventCardProps {
  event: SearchEventResult;
}

const SearchEventCard: FC<SearchEventCardProps> = ({ event }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={1}>
        🍽 {event.restaurantName}
      </Text>
      {event.message ? (
        <Text style={styles.subtitle} numberOfLines={2}>
          {event.message}
        </Text>
      ) : null}
      <View style={styles.metaRow}>
        <Text style={styles.meta} numberOfLines={1}>
          📍 {event.meetPoint}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          🕒 {event.scheduleTime}
        </Text>
      </View>
    </View>
  );
};

export default SearchEventCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
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
  subtitle: {
    fontSize: 14,
    color: "#1F2937",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  meta: {
    flex: 1,
    fontSize: 12,
    color: "#4B5563",
  },
});
