import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
export const getBaseUrl = () => {
  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   *
   * **NOTE**: This is only for development. In production, you'll want to set the
   * baseUrl to your production API URL.
   */
  
  // Priority 1: Use production API URL if set (for EAS builds)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Priority 2: Development mode with debugger
  const debuggerHost = Constants.expoConfig?.hostUri;
  let localhost = debuggerHost?.split(":")[0];

  // Priority 3: Fallback for production builds without env var
  if (!localhost) {
    // For testing production builds on emulator/simulator
    localhost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
    console.warn(
      `[getBaseUrl] No hostUri found, using fallback: ${localhost}. ` +
      `Set EXPO_PUBLIC_API_URL for production builds.`,
    );
  }

  // Android emulator needs 10.0.2.2 instead of localhost
  if (
    Platform.OS === "android" &&
    (localhost === "localhost" || localhost === "127.0.0.1")
  ) {
    localhost = "10.0.2.2";
  }

  return `http://${localhost}:3000`;
};
