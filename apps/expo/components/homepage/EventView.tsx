import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";

import { DEFAULT_USER_AVATAR } from "~/utils/api";
import Skeleton from "../frame/Skeleton";

interface LoadingProps {
  isLoading: true;
  scheduleTime?: string;
  avatarUrl?: string;
  username?: string;
  mood?: string;
  meetPoint?: string;
  restaurantName?: string;
  message?: string;
}

interface LoadedProps {
  isLoading?: false; // 关键：设为可选的 false
  scheduleTime: string;
  avatarUrl?: string;
  username: string;
  mood?: string;
  meetPoint: string;
  restaurantName: string;
  message?: string;
}

type EventViewProps = LoadingProps | LoadedProps;

const EventView = (props: EventViewProps) => {
  const {
    scheduleTime,
    username,
    avatarUrl,
    mood,
    meetPoint,
    restaurantName,
    message,
    isLoading = false,
  } = props;

  return (
    <GlassView
      style={
        isLiquidGlassAvailable()
          ? styles.glassContainer
          : styles.nonGlassContainer
      }
      isInteractive
    >
      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <View style={styles.profileGroup}>
            <GlassView style={styles.avatarContainer}>
              {isLoading ? (
                <Skeleton isLoading={isLoading} start={-96} end={48} />
              ) : (
                <>
                  <Image
                    src={avatarUrl ?? DEFAULT_USER_AVATAR}
                    alt="Avatar"
                    style={styles.avatar}
                  />
                  {mood && (
                    <GlassView
                      style={
                        isLiquidGlassAvailable()
                          ? styles.moodBadgeGlassContainer
                          : styles.moodBadgeNonGlassContainer
                      }
                    >
                      <Text style={{ fontSize: 20 }}>{mood}</Text>
                    </GlassView>
                  )}
                </>
              )}
            </GlassView>
            {isLoading ? (
              <View style={{ width: 150, height: 30 }}>
                <Skeleton
                  isLoading={isLoading}
                  start={-400}
                  end={200}
                  duration={1000}
                />
              </View>
            ) : (
              <Text style={styles.userNameText}>{username}</Text>
            )}
          </View>
          <View style={styles.scheduleTimeContainer}>
            {Platform.OS === "ios" ? (
              <SymbolView name="clock" style={{ width: 24, height: 24 }} />
            ) : (
              <Ionicons name="time" size={24} color="#ff7800" />
            )}
            {isLoading ? (
              <View style={{ width: 50, height: 24 }}>
                <Skeleton isLoading={isLoading} start={-100} end={50} />
              </View>
            ) : (
              <Text style={styles.normalText}>{scheduleTime}</Text>
            )}
          </View>
        </View>
        <View style={[styles.detailedInfoContainer, { marginTop: 5 }]}>
          <View style={styles.detailedInfo}>
            {Platform.OS === "ios" ? (
              <SymbolView name="mappin" style={{ width: 24, height: 24 }} />
            ) : (
              <Ionicons name="location" size={24} color="#ff7800" />
            )}
            {isLoading ? (
              <View style={{ width: 200, height: 30 }}>
                <Skeleton isLoading={isLoading} start={-400} end={200} />
              </View>
            ) : (
              <Text style={styles.normalText}>{meetPoint}</Text>
            )}
          </View>
        </View>
        <View style={styles.detailedInfoContainer}>
          <View style={styles.detailedInfo}>
            {Platform.OS === "ios" ? (
              <SymbolView name="storefront" style={{ width: 24, height: 24 }} />
            ) : (
              <Ionicons name="restaurant" size={24} color="#ff7800" />
            )}
            {isLoading ? (
              <View style={{ width: 180, height: 30 }}>
                <Skeleton isLoading={isLoading} start={-360} end={180} />
              </View>
            ) : (
              <Text style={styles.normalText}>{restaurantName}</Text>
            )}
          </View>
        </View>
        {isLoading ? (
          <View style={{ width: "100%", height: 80 }}>
            <Skeleton isLoading={isLoading} start={-600} end={300} />
          </View>
        ) : (
          <>
            {message && (
              <GlassView
                style={
                  isLiquidGlassAvailable()
                    ? styles.glassMessageContainer
                    : styles.nonGlassMessageContainer
                }
              >
                {Platform.OS === "ios" ? (
                  <SymbolView
                    name="message.badge"
                    style={{ width: 24, height: 24 }}
                  />
                ) : (
                  <Ionicons name="chatbubbles" size={24} color="#ff7800" />
                )}
                <Text style={{ flex: 1, fontSize: 16, fontWeight: "normal" }}>
                  {message}
                </Text>
              </GlassView>
            )}
          </>
        )}
      </View>
    </GlassView>
  );
};

export default EventView;

const styles = StyleSheet.create({
  normalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c2c2c",
    textAlign: "center",
  },
  glassContainer: {
    borderRadius: 30,
  },
  nonGlassContainer: {
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  contentContainer: {
    overflow: "hidden",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 10,
    margin: 15,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileGroup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    position: "relative",
  },
  moodBadgeGlassContainer: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  moodBadgeNonGlassContainer: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  shimmerContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  shimmerBase: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E6E6E6",
    borderRadius: 24,
  },
  shimmerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  shimmerOverlay: {
    width: "200%",
    height: "100%",
  },
  userNameText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#424242",
  },
  scheduleTimeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  detailedInfoContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 15,
  },
  detailedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  glassMessageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 20,
    gap: 5,
    padding: 15,
  },
  nonGlassMessageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderRadius: 20,
    gap: 5,
    padding: 15,
    backgroundColor: "rgba(205,205,205,0.5)",
  },
});
