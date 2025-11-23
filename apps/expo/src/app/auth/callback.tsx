import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

/**
 * OAuth Callback Screen
 *
 * This screen handles the OAuth callback from Duke authentication.
 * The actual token exchange is handled by expo-auth-session in useDukeAuth hook.
 * This screen just provides a UI while the authentication completes.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // The expo-auth-session will handle the callback automatically
    // After a short delay, redirect to the login screen
    // The useDukeAuth hook will process the authentication result
    const timer = setTimeout(() => {
      router.replace("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0F172A" />
      <Text style={styles.text}>Finalizing authentication...</Text>
      <Text style={styles.subtext}>Please wait a moment...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7FB",
    gap: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  subtext: {
    fontSize: 14,
    color: "#64748B",
  },
});
