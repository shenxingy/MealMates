import type { Coordinates } from "expo-maps/src/shared.types";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";

import { fetchDetailedEvent } from "~/utils/api";
import MiniMap from "../../../../../../components/eventpage/MiniMap";
import AnimatedPageFrame from "../../../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../../../components/frame/EmptySpace";

const EventDetailsPage = () => {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const baseColor = "255,140,0";
  const router = useRouter();

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ["eventDetails", eventId],
    queryFn: () => fetchDetailedEvent(eventId),
    enabled: !!eventId,
  });

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

  const cardStyle = isLiquidGlassAvailable() ? styles.glassCard : styles.nonGlassCard;

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
          <Text style={{ fontSize: 18, textAlign: "center" }}>Loading...</Text>
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
      <GlassView
        style={cardStyle}
        glassEffectStyle="regular"
      >
        <View style={styles.userCardContent}>
          <View style={styles.avatarContainer}>
            {avatarUrl?.startsWith("http") ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
              />
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
                <Text style={{ fontSize: 20 }}>
                  {getInitials(username)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{username}</Text>
          <View style={styles.timeContainer}>
            {Platform.OS === "ios" ? (
                <SymbolView name="clock.fill" size={16} tintColor="#3B82F6" />
            ) : (
                <Ionicons name="time" size={16} color="#3B82F6" />
            )}
            <Text style={styles.timeText}>{scheduleTime}</Text>
          </View>
        </View>
      </GlassView>

      {/* Location Info Row */}
      <View style={styles.locationRow}>
        {/* Meet At Card */}
        <GlassView style={[cardStyle, styles.locationCard]} glassEffectStyle="regular">
            <View style={styles.locationHeader}>
                {Platform.OS === "ios" ? (
                    <SymbolView name="location.fill" size={18} tintColor="#3B82F6" />
                ) : (
                    <Ionicons name="navigate" size={18} color="#3B82F6" />
                )}
                <Text style={styles.locationLabel}>Meet At</Text>
            </View>
            <Text style={styles.locationValue}>
              {restaurantLatitude.toFixed(4)}, {restaurantLongitude.toFixed(4)}
            </Text>
        </GlassView>

        {/* Restaurant Card */}
        <GlassView style={[cardStyle, styles.locationCard]} glassEffectStyle="regular">
            <View style={styles.locationHeader}>
                {Platform.OS === "ios" ? (
                    <SymbolView name="cup.and.saucer.fill" size={18} tintColor="#F97316" />
                ) : (
                    <Ionicons name="restaurant" size={18} color="#F97316" />
                )}
                <Text style={[styles.locationLabel, { color: "#F97316" }]}>Restaurant</Text>
            </View>
            <Text style={styles.locationValue}>{restaurantName}</Text>
        </GlassView>
      </View>

      {/* Message Card */}
      <GlassView style={cardStyle} glassEffectStyle="regular">
        <View style={styles.messageHeader}>
            {Platform.OS === "ios" ? (
                <SymbolView name="message.fill" size={18} tintColor="#3B82F6" />
            ) : (
                <Ionicons name="chatbubble" size={18} color="#3B82F6" />
            )}
            <Text style={styles.locationLabel}>Message</Text>
        </View>
        <Text style={styles.messageText}>{message}</Text>
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

      {/* Join Button - Floating */}
      <View style={styles.joinButtonContainer}>
        <Pressable style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join</Text>
        </Pressable>
      </View>

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
  // Deprecated but keeping for safety if referenced elsewhere in file (though I replaced usages)
  cardContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
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
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  timeText: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 14,
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
  locationValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
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
  joinButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
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
});
