import { Image, Platform, StyleSheet, Text, useColorScheme, View } from "react-native";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";

import Skeleton from "../frame/Skeleton";

interface LoadingProps {
  isLoading: true;
  scheduleTime?: string;
  avatarUrl?: string;
  avatarColor?: string;
  username?: string;
  mood?: string;
  restaurantName?: string;
  message?: string;
}

interface LoadedProps {
  isLoading?: false;
  scheduleTime: string;
  avatarUrl?: string;
  avatarColor?: string;
  username: string;
  mood?: string;
  restaurantName: string;
  message?: string;
}

type EventViewProps = LoadingProps | LoadedProps;

const getInitials = (name: string) => {
  return name.trim().charAt(0).toUpperCase();
};

const EventView = (props: EventViewProps) => {
  const {
    scheduleTime,
    username,
    avatarUrl,
    avatarColor = "#F5F7FB",
    mood,
    restaurantName,
    message,
    isLoading = false,
  } = props;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <GlassView
      style={
        isLiquidGlassAvailable()
          ? styles.glassContainer
          : [styles.nonGlassContainer, isDark && styles.nonGlassContainerDark]
      }
      isInteractive={!isLoading}
    >
      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <View style={styles.profileGroup}>
            <GlassView style={styles.avatarContainer}>
              {isLoading ? (
                <Skeleton isLoading={isLoading} start={-96} end={48} />
              ) : (
                <>
                  {avatarUrl?.startsWith("http") ? (
                    <Image src={avatarUrl} alt="Avatar" style={styles.avatar} />
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
                      <Text style={{ fontSize: 24, color: '#000000' }}>
                        {avatarUrl ?? getInitials(username ?? "?")}
                      </Text>
                    </View>
                  )}
                  {mood && (
                    <View style={styles.moodBadgeContainer}>
                      <Text style={{ fontSize: 20 }}>{mood}</Text>
                    </View>
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
              <Text style={[styles.userNameText, isDark && styles.userNameTextDark]}>{username}</Text>
            )}
          </View>
          <View style={styles.scheduleTimeContainer}>
            {Platform.OS === "ios" ? (
              <SymbolView name="clock" style={{ width: 24, height: 24 }} tintColor={isDark ? '#ffffff' : undefined} />
            ) : (
              <Ionicons name="time" size={24} color={isDark ? '#ffffff' : '#ff7800'} />
            )}
            {isLoading ? (
              <View style={{ width: 50, height: 24 }}>
                <Skeleton isLoading={isLoading} start={-100} end={50} />
              </View>
            ) : (
              <Text style={[styles.normalText, isDark && styles.normalTextDark]}>{scheduleTime}</Text>
            )}
          </View>
        </View>

        {/* Removed Meet Point section */}

        <View style={[styles.detailedInfoContainer, { marginTop: 5 }]}>
          <View style={styles.detailedInfo}>
            {Platform.OS === "ios" ? (
              <SymbolView name="fork.knife" style={{ width: 24, height: 24 }} tintColor={isDark ? '#ffffff' : undefined} />
            ) : (
              <Ionicons name="restaurant" size={24} color={isDark ? '#ffffff' : '#ff7800'} />
            )}
            {isLoading ? (
              <View style={{ width: 180, height: 30 }}>
                <Skeleton isLoading={isLoading} start={-360} end={180} />
              </View>
            ) : (
              <Text 
                style={[styles.normalText, { flex: 1 }, isDark && styles.normalTextDark]} 
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {restaurantName}
              </Text>
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
                    : [styles.nonGlassMessageContainer, isDark && styles.nonGlassMessageContainerDark]
                }
              >
                {Platform.OS === "ios" ? (
                  <SymbolView
                    name="message.badge"
                    style={{ width: 24, height: 24 }}
                    tintColor={isDark ? '#ffffff' : undefined}
                  />
                ) : (
                  <Ionicons name="chatbubbles" size={24} color={isDark ? '#ffffff' : '#ff7800'} />
                )}
                <Text style={{ flex: 1, fontSize: 16, fontWeight: "normal", color: isDark ? '#ffffff' : '#000000' }}>
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
  },
  normalTextDark: {
    color: "#ffffff",
  },
  glassContainer: {
    borderRadius: 30,
  },
  nonGlassContainer: {
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  nonGlassContainerDark: {
    backgroundColor: "rgba(45, 45, 45, 0.9)",
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
  moodBadgeContainer: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
  moodBadgeNonGlassContainerDark: {
    backgroundColor: "rgba(45, 45, 45, 0.9)",
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
    borderRadius: 24,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#636363",
  },
  userNameTextDark: {
    color: "#ffffffaa",
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
    flex: 1,
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
  nonGlassMessageContainerDark: {
    backgroundColor: "rgba(60, 60, 60, 0.7)",
  },
});
