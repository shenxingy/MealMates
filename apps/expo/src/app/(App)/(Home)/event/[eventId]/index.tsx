import type { Coordinates } from "expo-maps/src/shared.types";
import { useEffect, useMemo, useState } from "react";
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

import type { EventParticipantDTO } from "~/definition";
import type { RouterOutputs } from "~/utils/api";
import { useApiSocket } from "~/hooks/useApiSocket";
import {
  DEFAULT_USER_AVATAR,
  fetchDetailedEvent,
  trpcClient,
} from "~/utils/api";
import { getStoredUserId } from "~/utils/user-storage";
import MiniMap from "../../../../../../components/eventpage/MiniMap";
import AnimatedPageFrame from "../../../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../../../components/frame/EmptySpace";

const EMOJI_REGEX = /\p{Extended_Pictographic}/u;
const DEFAULT_AVATAR_COLOR = "#F5F7FB";

const EventDetailsPage = () => {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const baseColor = isDark ? "70,70,70" : "255,140,0";
  const numericEventId = eventId ? Number(eventId) : null;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    void getStoredUserId().then(setCurrentUserId);
  }, []);

  const {
    data,
    isLoading,
    refetch: refetchDetails,
  } = useQuery({
    queryKey: ["eventDetails", eventId],
    queryFn: () => fetchDetailedEvent(eventId),
    enabled: Boolean(eventId),
  });

  const { data: joinStatus, refetch: refetchJoinStatus } = useQuery({
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

  const {
    data: participantList,
    isLoading: participantsLoading,
    refetch: refetchParticipants,
  } = useQuery<EventParticipantDTO[]>({
    queryKey: ["eventParticipants", eventId],
    queryFn: async () => {
      if (!numericEventId) return [];
      return await trpcClient.event.participants.query({
        eventId: numericEventId,
      });
    },
    enabled: !!numericEventId,
  });

  const participants = useMemo(() => participantList ?? [], [participantList]);

  const hasJoined = Boolean(joinStatus?.joined);

  const creatorId = data?.userId;

  const socketEnabled =
    !!numericEventId && !!currentUserId && currentUserId === creatorId;

  useApiSocket({
    userId: currentUserId ?? "",
    eventId,
    enabled: socketEnabled,
    handlers: {
      onParticipantJoined: (payload) => {
        if (numericEventId && payload.eventId === numericEventId) {
          void queryClient.invalidateQueries({
            queryKey: ["eventParticipants", eventId],
          });
        }
      },
    },
  });

  const getInitials = (name: string) => {
    return name.trim().charAt(0).toUpperCase();
  };

  const resolveAvatarDisplay = (
    avatarValue: string | null | undefined,
    fallbackName: string,
  ) => {
    const trimmed = avatarValue?.trim();
    if (trimmed?.startsWith("http")) {
      return { type: "image" as const, value: trimmed, isLetter: false };
    }

    const fallbackInitial = getInitials(fallbackName);
    if (!trimmed) {
      return { type: "text" as const, value: fallbackInitial, isLetter: true };
    }

    const isEmoji = EMOJI_REGEX.test(trimmed);
    const displayText = isEmoji
      ? trimmed
      : (trimmed.at(0)?.toUpperCase() ?? fallbackInitial);

    return {
      type: "text" as const,
      value: displayText,
      isLetter: !isEmoji,
    };
  };

  const restaurantCoord: Coordinates | undefined = data?.restaurantCoordinates;
  const restaurantLatitude = restaurantCoord?.latitude ?? 0;
  const restaurantLongitude = restaurantCoord?.longitude ?? 0;
  const restaurantName = data?.restaurantName ?? "Restaurant";
  const username = data?.username ?? "Unknown";
  const avatarUrl = data?.avatarUrl;
  const avatarColor = data?.avatarColor ?? DEFAULT_AVATAR_COLOR;
  const scheduleTime = data?.scheduleTime ?? "TBD";
  const message = data?.message ?? "No message provided.";
  const hostAvatar = resolveAvatarDisplay(avatarUrl, username);
  const hostAvatarBg =
    avatarColor && avatarColor.trim().length > 0
      ? avatarColor
      : DEFAULT_AVATAR_COLOR;

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
      void queryClient.invalidateQueries({
        queryKey: ["eventParticipants", eventId],
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
      void queryClient.invalidateQueries({
        queryKey: ["eventParticipants", eventId],
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

  const handleRefreshPage = async () => {
    const tasks: Promise<unknown>[] = [];
    if (eventId) {
      tasks.push(refetchDetails());
      tasks.push(refetchParticipants());
    }
    if (currentUserId && eventId) {
      tasks.push(refetchJoinStatus());
    }
    await Promise.all(tasks);
  };

  const handleOpenEmoji = () => {
    if (!eventId) return;
    router.push(`/(App)/(Home)/event/${eventId}/emoji`);
  };

  const renderActionButtons = () => {
    if (!currentUserId || !creatorId) {
      return null;
    }

    // Host
    if (currentUserId === creatorId) {
      const hasParticipants = participants.length > 0;

      if (hasParticipants) {
        return (
          <View style={styles.actionContainer}>
            <View style={styles.dualButtonRow}>
              <Pressable
                style={[
                  styles.actionButton,
                  styles.emojiButton,
                  isDark && styles.emojiButtonDark,
                ]}
                onPress={handleOpenEmoji}
              >
                <Ionicons
                  name="happy-outline"
                  size={24}
                  color={isDark ? "#FBBF24" : "#D97706"}
                />
                <Text
                  style={[
                    styles.emojiButtonText,
                    isDark && styles.emojiButtonTextDark,
                  ]}
                >
                  Emoji
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.actionButton,
                  styles.cancelButton,
                  isDark && styles.cancelButtonDark,
                ]}
                onPress={handleCancel}
                disabled={cancelMutation.isPending}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={24}
                  color="#FECACA"
                />
                <Text style={styles.cancelButtonText}>
                  {cancelMutation.isPending ? "..." : "Cancel"}
                </Text>
              </Pressable>
            </View>
          </View>
        );
      }

      return (
        <View style={styles.actionContainer}>
          <Pressable
            style={[
              styles.actionButton,
              styles.singleCancelButton,
              isDark && styles.cancelButtonDark,
            ]}
            onPress={handleCancel}
            disabled={cancelMutation.isPending}
          >
            <Text style={styles.cancelButtonText}>
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Event"}
            </Text>
          </Pressable>
        </View>
      );
    }

    // Guest
    if (!hasJoined) {
      return (
        <View style={styles.actionContainer}>
          <Pressable
            style={[
              styles.actionButton,
              styles.joinButton,
              isDark && styles.joinButtonDark,
            ]}
            onPress={handleJoin}
            disabled={joinMutation.isPending}
          >
            <Text
              style={[
                styles.joinButtonText,
                isDark && styles.joinButtonTextDark,
              ]}
            >
              {joinMutation.isPending ? "Joining..." : "Join Event"}
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.actionContainer}>
        <View style={styles.dualButtonRow}>
          <Pressable
            style={[
              styles.actionButton,
              styles.emojiButton,
              isDark && styles.emojiButtonDark,
            ]}
            onPress={handleOpenEmoji}
          >
            <Ionicons
              name="happy-outline"
              size={24}
              color={isDark ? "#FBBF24" : "#D97706"}
            />
            <Text
              style={[
                styles.emojiButtonText,
                isDark && styles.emojiButtonTextDark,
              ]}
            >
              Emoji
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              styles.leaveButton,
              isDark && styles.leaveButtonDark,
            ]}
            onPress={handleLeave}
            disabled={leaveMutation.isPending}
          >
            <Text
              style={[
                styles.leaveButtonText,
                isDark && styles.leaveButtonTextDark,
              ]}
            >
              {leaveMutation.isPending ? "Leaving..." : "Leave Event"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <>
        <AnimatedPageFrame
          baseColor={baseColor}
          headerTitle="Meet with"
          scrollEnabled={false}
          enableReturnButton={true}
        >
          <EmptySpace marginTop={30} />
          <Text
            style={{
              fontSize: 18,
              textAlign: "center",
              color: isDark ? "rgba(255, 255, 255, 0.85)" : "#000",
            }}
          >
            Loading...
          </Text>
        </AnimatedPageFrame>
      </>
    );
  }

  return (
    <AnimatedPageFrame
      baseColor={baseColor}
      headerTitle="Meet with"
      scrollEnabled={true}
      onRefresh={handleRefreshPage}
      enableReturnButton={true}
    >
      <EmptySpace marginTop={20} />

      {/* User Card */}
      <GlassView style={cardStyle} glassEffectStyle="regular">
        <View style={styles.userCardContent}>
          <View style={styles.avatarContainer}>
            {hostAvatar.type === "image" ? (
              <Image source={{ uri: hostAvatar.value }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: hostAvatarBg,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    hostAvatar.isLetter && styles.avatarLetter,
                  ]}
                >
                  {hostAvatar.value}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.userName, isDark && styles.userNameDark]}>
            {username}
          </Text>
          <View
            style={[styles.timeContainer, isDark && styles.timeContainerDark]}
          >
            {Platform.OS === "ios" ? (
              <SymbolView
                name="clock.fill"
                size={16}
                tintColor={isDark ? "#60A5FA" : "#3B82F6"}
              />
            ) : (
              <Ionicons
                name="time"
                size={16}
                color={isDark ? "#60A5FA" : "#3B82F6"}
              />
            )}
            <Text style={[styles.timeText, isDark && styles.timeTextDark]}>
              {scheduleTime}
            </Text>
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
              <SymbolView
                name="location.fill"
                size={18}
                tintColor={isDark ? "#60A5FA" : "#3B82F6"}
              />
            ) : (
              <Ionicons
                name="navigate"
                size={18}
                color={isDark ? "#60A5FA" : "#3B82F6"}
              />
            )}
            <Text
              style={[styles.locationLabel, isDark && styles.locationLabelDark]}
            >
              Meet At
            </Text>
          </View>
          <Text
            style={[styles.locationValue, isDark && styles.locationValueDark]}
          >
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
              <Ionicons
                name="restaurant"
                size={18}
                color={isDark ? "#FB923C" : "#F97316"}
              />
            )}
            <Text
              style={[
                styles.locationLabel,
                { color: isDark ? "#FB923C" : "#F97316" },
              ]}
            >
              Restaurant
            </Text>
          </View>
          <Text
            style={[styles.locationValue, isDark && styles.locationValueDark]}
          >
            {restaurantName}
          </Text>
        </GlassView>
      </View>

      {/* Message Card */}
      <GlassView style={cardStyle} glassEffectStyle="regular">
        <View style={styles.messageHeader}>
          {Platform.OS === "ios" ? (
            <SymbolView
              name="message.fill"
              size={18}
              tintColor={isDark ? "#60A5FA" : "#3B82F6"}
            />
          ) : (
            <Ionicons
              name="chatbubble"
              size={18}
              color={isDark ? "#60A5FA" : "#3B82F6"}
            />
          )}
          <Text
            style={[styles.locationLabel, isDark && styles.locationLabelDark]}
          >
            Message
          </Text>
        </View>
        <Text style={[styles.messageText, isDark && styles.messageTextDark]}>
          {message}
        </Text>
      </GlassView>

      {/* Participants */}
      <GlassView style={cardStyle} glassEffectStyle="regular">
        <View style={styles.participantsHeader}>
          {Platform.OS === "ios" ? (
            <SymbolView
              name="person.2.fill"
              size={18}
              tintColor={isDark ? "#60A5FA" : "#3B82F6"}
            />
          ) : (
            <Ionicons
              name="people"
              size={18}
              color={isDark ? "#60A5FA" : "#3B82F6"}
            />
          )}
          <Text
            style={[styles.locationLabel, isDark && styles.locationLabelDark]}
          >
            Participants
          </Text>
          <Text
            style={[
              styles.participantCount,
              isDark && styles.participantCountDark,
            ]}
          >
            {participants.length}
          </Text>
        </View>
        {participantsLoading ? (
          <Text
            style={[
              styles.participantStatusText,
              isDark && styles.participantStatusTextDark,
            ]}
          >
            Loading participants...
          </Text>
        ) : participants.length === 0 ? (
          <Text
            style={[
              styles.participantStatusText,
              isDark && styles.participantStatusTextDark,
            ]}
          >
            No participants yet.
          </Text>
        ) : (
          participants.map((participant) => {
            const participantAvatar = resolveAvatarDisplay(
              participant.avatarUrl,
              participant.name,
            );
            const participantAvatarBg =
              participant.avatarColor &&
              participant.avatarColor.trim().length > 0
                ? participant.avatarColor
                : DEFAULT_AVATAR_COLOR;

            return (
              <View key={participant.id} style={styles.participantRow}>
                {participantAvatar.type === "image" ? (
                  <Image
                    source={{
                      uri: participantAvatar.value || DEFAULT_USER_AVATAR,
                    }}
                    style={styles.participantAvatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.participantAvatar,
                      {
                        backgroundColor: participantAvatarBg,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.participantAvatarText,
                        participantAvatar.isLetter &&
                          styles.participantAvatarLetter,
                      ]}
                    >
                      {participantAvatar.value}
                    </Text>
                  </View>
                )}
                <View style={styles.participantTextBlock}>
                  <Text
                    style={[
                      styles.participantName,
                      isDark && styles.participantNameDark,
                    ]}
                  >
                    {participant.name}
                  </Text>
                  <Text
                    style={[
                      styles.participantJoinedText,
                      isDark && styles.participantJoinedTextDark,
                    ]}
                  >
                    joined!
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </GlassView>

      <EmptySpace marginTop={15} />

      {/* Map */}
      {restaurantCoord && (
        <MiniMap
          restaurantCoord={restaurantCoord}
          restaurant={restaurantName}
          joined={true}
          shareLocationCallback={shareLocationCallback}
          onMapPressedCallback={handleOpenMapModal}
        />
      )}

      <EmptySpace marginTop={100} />

      {/* Buttons */}
      {renderActionButtons()}
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
  avatarText: {
    fontSize: 24,
    color: "#202020",
  },
  avatarLetter: {
    fontWeight: "700",
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
  participantsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  participantCount: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  participantCountDark: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  participantStatusText: {
    fontSize: 14,
    color: "#6B7280",
  },
  participantStatusTextDark: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F7FB",
  },
  participantAvatarText: {
    color: "#202020",
    fontSize: 18,
  },
  participantAvatarLetter: {
    fontWeight: "700",
  },
  participantTextBlock: {
    flex: 1,
    flexDirection: "column",
    gap: 2,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  participantNameDark: {
    color: "rgba(255, 255, 255, 0.85)",
  },
  participantJoinedText: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "600",
  },
  participantJoinedTextDark: {
    color: "#34D399",
  },
  actionContainer: {
    position: "absolute",
    bottom: 34,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 100,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  singleCancelButton: {
    width: "100%",
    backgroundColor: "#EF4444",
  },
  dualButtonRow: {
    flexDirection: "row",
    width: "100%",
    gap: 15,
  },
  emojiButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  emojiButtonDark: {
    backgroundColor: "rgba(60, 60, 60, 0.9)",
  },
  emojiButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
  },
  emojiButtonTextDark: {
    color: "#E5E7EB",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#EF4444",
  },
  cancelButtonDark: {
    backgroundColor: "#DC2626",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  joinButton: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  joinButtonDark: {
    backgroundColor: "rgba(45, 45, 45, 0.95)",
  },
  joinButtonText: {
    color: "#3B82F6",
    fontSize: 18,
    fontWeight: "bold",
  },
  joinButtonTextDark: {
    color: "#60A5FA",
  },
  leaveButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 2,
    borderColor: "#F87171",
  },
  leaveButtonDark: {
    backgroundColor: "rgba(45, 45, 45, 0.9)",
    borderColor: "#F87171",
  },
  leaveButtonText: {
    color: "#EF4444",
    fontSize: 18,
    fontWeight: "bold",
  },
  leaveButtonTextDark: {
    color: "#F87171",
  },
});
