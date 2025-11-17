import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { DukeRegisterButton } from "../../components/auth";
import LinearGradientBackground from "../../components/background/LinearGradientBackground";
import { useDukeAuth } from "../hooks/useDukeAuth";

export default function Index() {
  const router = useRouter();

  const { isLoading, isAuthenticated, userInfo, error, login } = useDukeAuth();

  // Navigate to home when authenticated
  useEffect(() => {
    if (isAuthenticated && userInfo) {
      console.log("User authenticated:", userInfo);
      Alert.alert(
        "Welcome!",
        `Successfully logged in as ${userInfo.name} (${userInfo.email})`,
        [
          {
            text: "Continue",
            onPress: () => router.replace("/(App)/(Home)"),
          },
        ],
      );
    }
  }, [isAuthenticated, userInfo, router]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert("Authentication Error", error);
    }
  }, [error]);

  const handleDukeAuth = async () => {
    try {
      await login();
    } catch (err) {
      console.error("Duke authentication error:", err);
    }
  };

  return (
    <LinearGradientBackground startColor="#C3E3FF" endColor="#F7F7FB">
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <Text style={styles.title}>Meal Mates</Text>
          <Text style={styles.tagline}>
            Plan the perfect bite with friends, classmates, or new faces around
            Duke.
          </Text>

          <View style={styles.heroCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80",
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.actionCard}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0F172A" />
                <Text style={styles.loadingText}>
                  Authenticating with Duke...
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.subtitle}>Sign in with your Duke NetID</Text>
                <Text style={styles.helperText}>
                  One secure Duke login powers both registration and return
                  visits. No extra passwords, ever.
                </Text>
                <DukeRegisterButton
                  label="Continue with Duke"
                  onPress={handleDukeAuth}
                  style={styles.dukeButton}
                />
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 0.4,
  },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    color: "#475569",
    lineHeight: 22,
  },
  heroCard: {
    marginTop: 28,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.65)",
    shadowColor: "#1F2937",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 14,
  },
  heroImage: {
    width: "100%",
    height: 220,
  },
  actionCard: {
    marginTop: 32,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: "#1F2937",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 30,
    elevation: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
    letterSpacing: 0.2,
  },
  helperText: {
    marginTop: 12,
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
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
