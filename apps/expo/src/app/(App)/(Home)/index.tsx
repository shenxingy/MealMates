import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { trpcClient } from "~/utils/api";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../components/frame/EmptySpace";
import EventView from "../../../../components/homepage/EventView";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";

type Event = {
  id: number;
  userId: string;
  restaurantName: string;
  scheduleTime: string;
  mood: string | null;
  message: string | null;
  username: string | null;
  avatarUrl: string | null;
  avatarColor: string | null;
  createdAt: Date;
  updatedAt: Date;
  restaurantCoordinates: { latitude: number; longitude: number };
  meetPointCoordinates: { latitude: number; longitude: number };
};

export default function HomePage() {
  const baseColor = "255,120,0";
  const header = "MealMate";
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initial load
  useEffect(() => {
    loadEvents(1);
  }, []);

  const loadEvents = async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const data = await (trpcClient.event as any).list.query({ page: pageNum });
      
      if (pageNum === 1) {
        setEvents(data);
      } else {
        setEvents(prev => [...prev, ...data]);
      }

      // If we got less than 20 items, there's no more data
      setHasMore(data.length === 20);
      setPage(pageNum);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadEvents(page + 1);
    }
  };

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
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
    >
      <EmptySpace marginTop={30} />

      {events.map((event) => (
        <View key={event.id} style={{ marginBottom: 20 }}>
          <Pressable
            onPress={() => {
              handleEventPress(event.id);
            }}
          >
            <EventView
              scheduleTime={event.scheduleTime}
              username={event.username ?? "Anonymous"}
              avatarUrl={event.avatarUrl ?? undefined}
              avatarColor={event.avatarColor ?? undefined}
              mood={event.mood ?? undefined}
              restaurantName={event.restaurantName}
              message={event.message ?? undefined}
              isLoading={false}
            />
          </Pressable>
        </View>
      ))}

      {/* Loading more indicator */}
      {isLoadingMore && (
        <View style={{ marginBottom: 20 }}>
          <EventView isLoading={true} />
        </View>
      )}

      {/* No more data indicator */}
      {!hasMore && events.length > 0 && (
        <View style={styles.endIndicator}>
          <View style={styles.dividerLine} />
          <Text style={styles.endText}>No More Events</Text>
          <View style={styles.dividerLine} />
        </View>
      )}
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
    },
    endIndicator: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 30,
      marginBottom: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: "rgba(0,0,0,0.1)",
    },
    endText: {
      marginHorizontal: 15,
      fontSize: 14,
      color: "rgba(0,0,0,0.4)",
    },
  }
)