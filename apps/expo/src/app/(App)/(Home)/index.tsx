import { Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { fetchSimpleEventList } from "~/utils/api";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import EventView from "../../../../components/homepage/EventView";

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
      <AnimatedPageFrame
        baseColor={baseColor}
        headerTitle={header}
        scrollEnabled={false}
      >
        <View style={styles.emptySpace} />
        {Array.from({ length: 3 }).map((_, i) => (
          <View style={{ marginBottom: 20 }} key={i}>
            <EventView isLoading={true} />
          </View>
        ))}
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
      <View style={styles.emptySpace} />

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
              isLoading={isLoading}
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
