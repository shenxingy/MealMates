import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import {
  Divider,
  DukeRegisterButton,
  LoginButton,
  LoginForm,
} from "../../components/auth";
import LinearGradientBackground from "../../components/background/LinearGradientBackground";
import { useDukeAuth } from "../hooks/useDukeAuth";

export default function Index() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    isLoading,
    isAuthenticated,
    userInfo,
    error,
    login,
    logout,
  } = useDukeAuth();

  // TEMPORARY: Clear auth on mount for testing registration
  useEffect(() => {
    void logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        ]
      );
    }
  }, [isAuthenticated, userInfo, router]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert("Authentication Error", error);
    }
  }, [error]);

  const handleLogin = () => {
    // For now, use traditional login (you can implement this later)
    router.replace("/(App)/(Home)");
  };

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
          <Text style={styles.title}>Welcome Back,</Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0F172A" />
              <Text style={styles.loadingText}>Authenticating with Duke...</Text>
            </View>
          ) : (
            <>
              <LoginForm
                email={email}
                password={password}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
              />

              <DukeRegisterButton onPress={handleDukeAuth} />

              <Divider />

              <View style={styles.loginRow}>
                <LoginButton onPress={handleLogin} />
              </View>
            </>
          )}
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
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
});
