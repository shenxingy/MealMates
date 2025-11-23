import { Platform, Pressable, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "@tanstack/react-query"; 

import { trpcClient } from "~/utils/api";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../components/frame/EmptySpace";
import EventView from "../../../../components/homepage/EventView";

export default function HomePage() {
  const baseColor = "255,120,0";
  const header = "MealMate";
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["event", "all"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return (trpcClient as any).event.all.query();
    },
  });

  const handleEventPress = (eventId: number) => {
    console.log("Event", eventId, "Pressed!");
    router.push(`/event/${eventId}`);
  };

  const handleCreateEvent = () => {
    router.push("/event/create");
  };

  const CreateButton = (
    <Pressable onPress={handleCreateEvent}>
      {Platform.OS === "ios" ? (
        <SymbolView name="plus.circle.fill" size={32} tintColor="black" />
      ) : (
        <MaterialIcons name="add-circle" size={32} color="black" />
      )}
    </Pressable>
  );

  if (isLoading) {
    return (
      <AnimatedPageFrame
        baseColor={baseColor}
        headerTitle={header}
        headerRight={CreateButton}
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
        headerRight={CreateButton}
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
      headerRight={CreateButton}
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
              avatarUrl={event.avatarUrl}
              avatarColor={event.avatarColor}
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
