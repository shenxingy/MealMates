import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";



import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import { Ionicons } from "@expo/vector-icons";


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
            <Text style={styles.userName}>Toshi Li</Text>
          </View>
          <View style={styles.scheduleTimeContainer}>
            {Platform.OS === "ios" ?
              <SymbolView
                name="clock"
                style={{ width: 24, height: 24 }}
                tintColor="#ff7800"
              /> :
              <Ionicons name="time" size={24} color="#ff7800" />
            }
            <Text style={styles.scheduleTime}>12:30</Text>
          </View>
        </View>
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
  glassContainer: {
    height: 200,
    borderRadius: 30,
    overflow: "hidden",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  nonGlassContainer: {
    height: 200,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 15,
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
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff7800",
    textAlign: "center",
  },
  scheduleTimeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});
