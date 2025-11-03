import { Pressable, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { fetchSimpleEventList } from "~/utils/api";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import EventView from "../../../../components/homepage/EventView";
import { useRouter } from "expo-router";

export default function HomePage() {
  // Gradient color
  const baseColor = "255,120,0";
  const header = "MealMate";
  const router = useRouter();

  // useQuery to fetch simple event list
  const { data, isLoading, error } = useQuery({
    queryKey: ["simpleEventList"],
    queryFn: fetchSimpleEventList,
  });

  const handleEventPress = (eventId: number) => {
    console.log("Event", eventId, "Pressed!");
    // Navigate to event details page
    router.push(`/event/${eventId}`);
  }

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
      <AnimatedPageFrame baseColor={baseColor} headerTitle={header} scrollEnabled={false}>
        <View style={styles.emptySpace} />
        {Array.from({ length: 3 }).map((_, i) => (
          <View style={{ marginBottom: 20 }} key={i}>
            <EventView isLoading={true} />
          </View>
        ))}
      </AnimatedPageFrame>
    );
  }

  return (
    <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
      <View style={styles.emptySpace} />

      {data?.map((event, _) => (
        <View key={event.id} style={{ marginBottom: 20 }}>
          <Pressable
            onPress={() => {
              handleEventPress(event.id);
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
