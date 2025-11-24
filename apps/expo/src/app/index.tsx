import type { ImageSourcePropType } from "react-native";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

import mealmatesHeroAsset from "../../assets/mealmates.png";
import { DukeRegisterButton } from "../../components/auth";
import AnimatedPageFrame from "../../components/frame/AnimatedPageFrame";
import { useDukeAuth } from "../hooks/useDukeAuth";

const mealmatesHero: ImageSourcePropType = mealmatesHeroAsset;

export default function Index() {
  const { isLoading, login } = useDukeAuth();
  const header = "MealMates";
  const baseColor = "195,227,255";

  const handleDukeAuth = async () => {
    try {
      await login();
    } catch (err) {
      console.error("Duke authentication error:", err);
    }
  };

  return (
    <AnimatedPageFrame
      baseColor={baseColor}
      headerTitle={header}
      scrollEnabled={false}
    >
      <View style={styles.content}>
        <Text style={styles.tagline}>
          Plan the perfect bite with friends, classmates, or new faces around
          Duke.
        </Text>

        <View style={styles.heroCard}>
          <Image
            source={mealmatesHero}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.actionSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0F172A" />
              <Text style={styles.loadingText}>
                Authenticating with Duke...
              </Text>
            </View>
          ) : (
            <DukeRegisterButton
              label="Continue with Duke"
              onPress={handleDukeAuth}
              style={styles.dukeButton}
            />
          )}
        </View>
      </View>
    </AnimatedPageFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  tagline: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 22,
  },
  heroCard: {
    marginTop: 28,
    borderRadius: 32,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: 220,
  },
  actionSection: {
    marginTop: 32,
  },
  dukeButton: {
    marginTop: 28,
    width: "100%",
    alignSelf: "stretch",
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
});
