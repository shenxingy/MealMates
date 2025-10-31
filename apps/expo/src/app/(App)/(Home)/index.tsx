import { useQuery } from "@tanstack/react-query";
import { Pressable, StyleSheet, View, Text } from "react-native";

import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import EventView from "../../../../components/Homepage/EventView";
import { fetchSimpleEventList } from "~/utils/api";

export default function HomePage() {
  // Gradient color
  const baseColor = "255,120,0";
  const header = "MealMate";

  // useQuery to fetch simple event list
  const { data, isLoading, error } = useQuery({
    queryKey: ["simpleEventList"],
    queryFn: fetchSimpleEventList,
  });

  if (isLoading) {
    return (
      <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
        <Text>Loading...</Text>
      </AnimatedPageFrame>
    );
  }

  if (error) {
    return (
      <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
        <Text>Error loading data</Text>
      </AnimatedPageFrame>
    );
  }

  return (
    <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
      <View style={styles.emptySpace}></View>

      {data?.map((event, i) => (
        <View key={i} style={{ marginBottom: 20 }}>
          <Pressable
            onPress={() => {
              console.log(`Event ${i} Pressed!`);
            }}
          >
            <EventView
              scheduleTime={event.scheduleTime}
              username={event.username}
              avatarUrl={event.avatarUrl}
              mood={event.mood}
              meetPoint={event.meetPoint}
              restaurantName={event.restaurantName}
              message={event.message}
            />
          </Pressable>
        </View>
      ))}
    </AnimatedPageFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  emptySpace: {
    marginTop: 30,
  },
});
