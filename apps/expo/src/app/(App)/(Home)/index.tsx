import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";

import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";

export default function HomePage() {
  // Gradient color
  const baseColor = "255,120,0";
  const header = "MealMate";

  return (
    <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
      <Text style={styles.contentText}>
        Scroll up to see the blur effect. When the content scrolls into the
        Header area, a gradient blur effect will become visible.
      </Text>
      <GlassView
        style={
          isLiquidGlassAvailable()
            ? styles.glassContainer
            : styles.nonGlassContainer
        }
        isInteractive
      >
        <View style={styles.infoContainer}>
          <View style={styles.profileGroup}>
            <GlassView style={styles.selfieContainer}>
              <Image
                src="https://rcucryvgjbthzoirnzam.supabase.co/storage/v1/object/public/Avatar/avatar_user_1.jpeg"
                alt="Selfie"
                style={styles.selfie}
              />
            </GlassView>
            <Text style={styles.userNameText}>Toshi Li</Text>
          </View>
          <View style={styles.scheduleTimeContainer}>
            {Platform.OS === "ios" ? (
              <SymbolView name="clock" style={{ width: 24, height: 24 }} />
            ) : (
              <Ionicons name="time" size={24} color="#ff7800" />
            )}
            <Text style={styles.normalText}>12:30</Text>
          </View>
        </View>
        <View style={styles.detailedInfoContainer}>
          <View style={styles.detailedInfo}>
            {Platform.OS === "ios" ? (
              <SymbolView
                name="mappin.circle"
                style={{ width: 24, height: 24 }}
              />
            ) : (
              <Ionicons name="location" size={24} color="#ff7800" />
            )}
            <Text style={styles.normalText}>Duke Chapel</Text>
          </View>
        </View>
        <View style={styles.detailedInfoContainer}>
          <View style={styles.detailedInfo}>
            {Platform.OS === "ios" ? (
              <SymbolView
                name="storefront.circle"
                style={{ width: 24, height: 24 }}
              />
            ) : (
              <Ionicons name="restaurant" size={24} color="#ff7800" />
            )}
            <Text style={styles.normalText}>JB roast</Text>
          </View>
        </View>
        <GlassView
          style={
            isLiquidGlassAvailable()
              ? styles.glassMessageContainer
              : styles.nonGlassMessageContainer
          }
        >
          {Platform.OS === "ios" ? (
            <SymbolView
              name="message.badge.circle"
              style={{ width: 24, height: 24 }}
            />
          ) : (
            <Ionicons name="chatbubbles" size={24} color="#ff7800" />
          )}
          <Text style={{ flex: 1, fontSize: 16, fontWeight: "normal" }}>
            You're welcome to eat together! I'll be waiting near the entrance of
            Duke Chapel waiting for you.
          </Text>
        </GlassView>
      </GlassView>
      {Array.from({ length: 20 }, (_, i) => (
        <View key={i} style={styles.contentBlock}>
          <Text style={styles.blockTitle}>Content Block {i + 1}</Text>
          <Text style={styles.blockText}>Home Page Content Block {i + 1}</Text>
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
  contentHeader: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  contentText: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  contentBlock: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  blockText: {
    fontSize: 14,
    lineHeight: 20,
  },
  normalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c2c2c",
    textAlign: "center",
  },
  glassContainer: {
    borderRadius: 30,
    overflow: "hidden",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 10,
  },
  nonGlassContainer: {
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 10,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 15,
  },
  profileGroup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  selfieContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  selfie: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
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
    marginHorizontal: 30,
  },
  detailedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  glassMessageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginHorizontal: 15,
    borderRadius: 20,
    marginBottom: 15,
    gap: 5,
    padding: 15,
  },
  nonGlassMessageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginHorizontal: 15,
    borderRadius: 20,
    marginBottom: 15,
    gap: 5,
    padding: 15,
    backgroundColor: "rgba(205,205,205,0.5)",
  },
});
