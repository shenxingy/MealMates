import type { Coordinates } from "expo-maps/src/shared.types";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { RouterOutputs } from "~/utils/api";
import { fetchDetailedEvent, trpcClient } from "~/utils/api";
import { getStoredUserId } from "~/utils/user-storage";
import MiniMap from "../../../../../../components/eventpage/MiniMap";
import AnimatedPageFrame from "../../../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../../../components/frame/EmptySpace";

const EventDetailsPage = () => {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const baseColor = isDark ? "70,70,70" : "255,140,0";
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    void getStoredUserId().then(setCurrentUserId);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["eventDetails", eventId],
    queryFn: () => fetchDetailedEvent(eventId),
    enabled: !!eventId,
  });

  const { data: joinStatus } = useQuery({
    queryKey: ["eventJoinStatus", eventId, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { joined: false };
      return await trpcClient.event.checkJoined.query({
        eventId: Number(eventId),
        userId: currentUserId,
      });
    },
    enabled: !!eventId && !!currentUserId,
  });

  const hasJoined = Boolean(joinStatus?.joined);

  const creatorId = data?.userId;

  const restaurantCoord: Coordinates | undefined =
    data?.restaurantCoordinates ?? undefined;
  const restaurantLatitude = restaurantCoord?.latitude ?? 0;
  const restaurantLongitude = restaurantCoord?.longitude ?? 0;
  const restaurantName = data?.restaurantName ?? "Restaurant";
  const username = data?.username ?? "Unknown";
  const avatarUrl = data?.avatarUrl;
  const avatarColor = data?.avatarColor ?? "#F5F7FB";
  const scheduleTime = data?.scheduleTime ?? "TBD";
  const message = data?.message ?? "No message provided.";

  const cardStyle = isLiquidGlassAvailable()
    ? [styles.glassCard, isDark && styles.glassCardDark]
    : [styles.nonGlassCard, isDark && styles.nonGlassCardDark];

  const shareLocationCallback = () => {
    console.log("Share location button pressed");
    if (!eventId) {
      console.error("No event ID found in search params");
      return;
    }
    router.push(
      `/(App)/(Home)/event/${eventId}/map-modal?shared=true&restaurantName=${restaurantName}&restaurantLatitude=${restaurantLatitude}&restaurantLongitude=${restaurantLongitude}`,
    );
  };

  const handleOpenMapModal = () => {
    console.log("Map pressed, opening modal");
    if (!eventId) {
      console.error("No event ID found in search params");
      return;
    }
    router.push(
      `/(App)/(Home)/event/${eventId}/map-modal?shared=false&restaurantName=${restaurantName}&restaurantLatitude=${restaurantLatitude}&restaurantLongitude=${restaurantLongitude}`,
    );
  };

  const getInitials = (name: string) => {
    return name.trim().charAt(0).toUpperCase();
  };

  const joinMutation = useMutation<
    RouterOutputs["event"]["join"],
    Error,
    { eventId: number; userId: string }
  >({
    mutationFn: async ({ eventId: id, userId }) => {
      return await trpcClient.event.join.mutate({ eventId: id, userId });
    },
    onSuccess: () => {
      Alert.alert("Success", "You have joined the event!");
      void queryClient.invalidateQueries({
        queryKey: ["eventJoinStatus", eventId, currentUserId],
      });
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to join event: " + error.message);
    },
  });

  const leaveMutation = useMutation<
    RouterOutputs["event"]["leave"],
    Error,
    { eventId: number; userId: string }
  >({
    mutationFn: async ({ eventId: id, userId }) => {
      return await trpcClient.event.leave.mutate({ eventId: id, userId });
    },
    onSuccess: () => {
      Alert.alert("Left", "You have left the event.");
      void queryClient.invalidateQueries({
        queryKey: ["eventJoinStatus", eventId, currentUserId],
      });
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to leave event: " + error.message);
    },
  });

  const cancelMutation = useMutation<
    RouterOutputs["event"]["cancel"],
    Error,
    { eventId: number; userId: string }
  >({
    mutationFn: async ({ eventId: id, userId }) => {
      return await trpcClient.event.cancel.mutate({ eventId: id, userId });
    },
    onSuccess: () => {
      Alert.alert("Cancelled", "Event has been cancelled.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      void queryClient.invalidateQueries({ queryKey: ["event", "all"] });
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to cancel event: " + error.message);
    },
  });

  const handleJoin = () => {
    if (!eventId || !currentUserId) return;
    joinMutation.mutate({ eventId: Number(eventId), userId: currentUserId });
  };

  const handleLeave = () => {
    if (!eventId || !currentUserId) return;
    Alert.alert("Leave Event", "Are you sure you want to leave this event?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () =>
          leaveMutation.mutate({
            eventId: Number(eventId),
            userId: currentUserId,
          }),
      },
    ]);
  };

  const handleCancel = () => {
    if (!eventId || !currentUserId) return;
    Alert.alert("Cancel Event", "Are you sure you want to cancel this event?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () =>
          cancelMutation.mutate({
            eventId: Number(eventId),
            userId: currentUserId,
          }),
      },
    ]);
  };

  if (isLoading) {
    return (
      <>
        <AnimatedPageFrame
          baseColor={baseColor}
          headerTitle="Meet with"
          scrollEnabled={false}
          enableReturnButton={true}
          returnButtonText="Home"
        >
          <EmptySpace marginTop={30} />
          <Text style={{ fontSize: 18, textAlign: "center", color: isDark ? 'rgba(255, 255, 255, 0.85)' : '#000' }}>Loading...</Text>
        </AnimatedPageFrame>
      </>
    );
  }

  return (
    <AnimatedPageFrame
      baseColor={baseColor}
      headerTitle="Meet with"
      scrollEnabled={true}
      enableReturnButton={true}
      returnButtonText="Home"
    >
      <EmptySpace marginTop={20} />

      {/* User Card */}
      <GlassView style={cardStyle} glassEffectStyle="regular">
        <View style={styles.userCardContent}>
          <View style={styles.avatarContainer}>
            {avatarUrl?.startsWith("http") ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: avatarColor,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text style={{ fontSize: 20, color: isDark ? '#ffffff' : '#000000' }}>{getInitials(username)}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.userName, isDark && styles.userNameDark]}>{username}</Text>
          <View style={[styles.timeContainer, isDark && styles.timeContainerDark]}>
            {Platform.OS === "ios" ? (
              <SymbolView name="clock.fill" size={16} tintColor={isDark ? "#60A5FA" : "#3B82F6"} />
            ) : (
              <Ionicons name="time" size={16} color={isDark ? "#60A5FA" : "#3B82F6"} />
            )}
            <Text style={[styles.timeText, isDark && styles.timeTextDark]}>{scheduleTime}</Text>
          </View>
        </View>
      </GlassView>

      {/* Location Info Row */}
      <View style={styles.locationRow}>
        {/* Meet At Card */}
        <GlassView
          style={[cardStyle, styles.locationCard]}
          glassEffectStyle="regular"
        >
          <View style={styles.locationHeader}>
            {Platform.OS === "ios" ? (
              <SymbolView name="location.fill" size={18} tintColor={isDark ? "#60A5FA" : "#3B82F6"} />
            ) : (
              <Ionicons name="navigate" size={18} color={isDark ? "#60A5FA" : "#3B82F6"} />
            )}
            <Text style={[styles.locationLabel, isDark && styles.locationLabelDark]}>Meet At</Text>
          </View>
          <Text style={[styles.locationValue, isDark && styles.locationValueDark]}>
            {restaurantLatitude.toFixed(4)}, {restaurantLongitude.toFixed(4)}
          </Text>
        </GlassView>

        {/* Restaurant Card */}
        <GlassView
          style={[cardStyle, styles.locationCard]}
          glassEffectStyle="regular"
        >
          <View style={styles.locationHeader}>
            {Platform.OS === "ios" ? (
              <SymbolView
                name="cup.and.saucer.fill"
                size={18}
                tintColor={isDark ? "#FB923C" : "#F97316"}
              />
            ) : (
              <Ionicons name="restaurant" size={18} color={isDark ? "#FB923C" : "#F97316"} />
            )}
            <Text style={[styles.locationLabel, { color: isDark ? "#FB923C" : "#F97316" }]}>
              Restaurant
            </Text>
          </View>
          <Text style={[styles.locationValue, isDark && styles.locationValueDark]}>{restaurantName}</Text>
        </GlassView>
      </View>

      {/* Message Card */}
      <GlassView style={cardStyle} glassEffectStyle="regular">
        <View style={styles.messageHeader}>
          {Platform.OS === "ios" ? (
            <SymbolView name="message.fill" size={18} tintColor={isDark ? "#60A5FA" : "#3B82F6"} />
          ) : (
            <Ionicons name="chatbubble" size={18} color={isDark ? "#60A5FA" : "#3B82F6"} />
          )}
          <Text style={[styles.locationLabel, isDark && styles.locationLabelDark]}>Message</Text>
        </View>
        <Text style={[styles.messageText, isDark && styles.messageTextDark]}>{message}</Text>
      </GlassView>

      <EmptySpace marginTop={15} />

      {/* Map */}
      {restaurantCoord && (
        <MiniMap
          restaurantCoord={restaurantCoord}
          restaurant={restaurantName}
          joined={hasJoined}
          shareLocationCallback={shareLocationCallback}
          onMapPressedCallback={handleOpenMapModal}
        />
      )}

      <EmptySpace marginTop={100} />

      {/* Buttons */}
      {currentUserId && creatorId && (
        <View style={styles.joinButtonContainer}>
          {/* Show Join button if not creator and not joined */}
          {currentUserId !== creatorId && !hasJoined && (
            <Pressable
              style={[styles.joinButton, isDark && styles.joinButtonDark]}
              onPress={handleJoin}
              disabled={joinMutation.isPending}
            >
              <Text style={[styles.joinButtonText, isDark && styles.joinButtonTextDark]}>
                {joinMutation.isPending ? "Joining..." : "Join"}
              </Text>
            </Pressable>
          )}

          {/* Show Leave button if already joined */}
          {currentUserId !== creatorId && hasJoined && (
            <Pressable
              style={[styles.leaveButton, isDark && styles.leaveButtonDark]}
              onPress={handleLeave}
              disabled={leaveMutation.isPending}
            >
              <Text style={[styles.leaveButtonText, isDark && styles.leaveButtonTextDark]}>
                {leaveMutation.isPending ? "Leaving..." : "Leave Event"}
              </Text>
            </Pressable>
          )}

          {/* Show Cancel button for event creator */}
          {currentUserId === creatorId && (
            <Pressable
              style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
              onPress={handleCancel}
              disabled={cancelMutation.isPending}
            >
              <Text style={styles.cancelButtonText}>
                {cancelMutation.isPending ? "Cancelling..." : "Cancel Event"}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </AnimatedPageFrame>
  );
};

export default EventDetailsPage;

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  glassCardDark: {
    backgroundColor: "rgba(45, 45, 45, 0.8)",
  },
  nonGlassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nonGlassCardDark: {
    backgroundColor: "rgba(45, 45, 45, 0.95)",
  },
  userCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    marginRight: 12,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
  },
  userNameDark: {
    color: "rgba(255, 255, 255, 0.85)",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  timeContainerDark: {
    backgroundColor: "rgba(96, 165, 250, 0.2)",
  },
  timeText: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 14,
  },
  timeTextDark: {
    color: "#60A5FA",
  },
  locationRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  locationCard: {
    flex: 1,
    marginBottom: 0, // Override default
    padding: 16,
    justifyContent: "center",
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  locationLabelDark: {
    color: "#60A5FA",
  },
  locationValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  locationValueDark: {
    color: "rgba(255, 255, 255, 0.85)",
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  messageText: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
  messageTextDark: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  joinButtonContainer: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
    gap: 10,
  },
  joinButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  joinButtonText: {
    color: "#3B82F6",
    fontSize: 18,
    fontWeight: "bold",
  },
  joinButtonDark: {
    backgroundColor: "rgba(45, 45, 45, 0.9)",
  },
  joinButtonTextDark: {
    color: "#60A5FA",
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButtonDark: {
    backgroundColor: "#DC2626",
  },
  leaveButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#F87171",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  leaveButtonText: {
    color: "#EF4444",
    fontSize: 18,
    fontWeight: "bold",
  },
  leaveButtonDark: {
    backgroundColor: "rgba(45, 45, 45, 0.9)",
    borderColor: "#F87171",
  },
  leaveButtonTextDark: {
    color: "#F87171",
  },
});
