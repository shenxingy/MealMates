import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "@tanstack/react-query";

import { trpcClient } from "~/utils/api";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../components/frame/EmptySpace";
import EventView from "../../../../components/homepage/EventView";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";

export default function HomePage() {
  const baseColor = "255,120,0";
  const header = "MealMate";
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["event", "all"],
    queryFn: () => {
      return trpcClient.event.all.query();
    },
  });

  const handleEventPress = (eventId: number) => {
    console.log("Event", eventId, "Pressed!");
    router.push(`/event/${eventId}`);
  };

  const handleCreateEvent = () => {
    router.push("/event/create");
  };

  if (isLoading) {
    return (
      <AnimatedPageFrame
        baseColor={baseColor}
        headerTitle={header}
        headerRightSFSymbolName="plus"
        headerRightMaterialSymbolName="add"
        headerRightOnPress={handleCreateEvent}
        scrollEnabled={false}
      >
        <EmptySpace marginTop={30} />
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
      <AnimatedPageFrame
        baseColor={baseColor}
        headerTitle={header}
        headerRightSFSymbolName="plus"
        headerRightMaterialSymbolName="add"
        headerRightOnPress={handleCreateEvent}
        scrollEnabled={false}
      >
        <EmptySpace marginTop={30} />
        {Array.from({ length: 3 }).map((_, i) => (
          <View style={{ marginBottom: 20 }} key={i}>
            <EventView isLoading={true} />
          </View>
        ))}
      </AnimatedPageFrame>
    );
  }

  return (
    <AnimatedPageFrame
      baseColor={baseColor}
      headerTitle={header}
      headerRightSFSymbolName="plus"
      headerRightMaterialSymbolName="add"
      headerRightOnPress={handleCreateEvent}
    >
      <EmptySpace marginTop={30} />

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
              avatarUrl={event.avatarUrl ?? undefined}
              avatarColor={event.avatarColor}
              mood={event.mood ?? undefined}
              restaurantName={event.restaurantName}
              message={event.message ?? undefined}
              isLoading={isLoading}
            />
          </Pressable>
        </View>
      ))}
    </AnimatedPageFrame>
  );
}

const styles = StyleSheet.create(
  {
    createGlassButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    createButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "rgba(255,255,255,0.6)"
    },
    buttonContainer: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    }
  }
)