import type { ReactNode } from "react";
import { useEffect } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "~/utils/api";
import { DukeAuthProvider, useDukeAuth } from "../hooks/useDukeAuth";

function AuthNavigationGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isAuthHydrated } = useDukeAuth();
  const { key: rootNavigationKey } = useRootNavigationState();

  const inAppGroup = segments[0] === "(App)";

  useEffect(() => {
    if (!isAuthHydrated || !rootNavigationKey) {
      return;
    }

    if (!isAuthenticated && inAppGroup) {
      setTimeout(() => router.replace("/"), 0);
    } else if (isAuthenticated && !inAppGroup) {
      setTimeout(() => router.replace("/(App)/(Home)"), 0);
    }
  }, [
    isAuthHydrated,
    isAuthenticated,
    inAppGroup,
    rootNavigationKey,
    router,
  ]);

  if (!isAuthHydrated) return null;

  if (!isAuthenticated && inAppGroup) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return children;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  SplashScreen.setOptions({
    duration: 1000,
    fade: true,
  });
  return (
    <SafeAreaProvider>
      <DukeAuthProvider>
        <QueryClientProvider client={queryClient}>
          <AuthNavigationGate>
            <Stack
              screenOptions={{
                contentStyle: {
                  backgroundColor: colorScheme === "dark" ? "#000" : "#f3f3f3",
                },
                headerShown: false,
              }}
            >
              <Stack.Screen name="index" options={{ title: "Login Page" }} />
              <Stack.Screen name="(App)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar />
          </AuthNavigationGate>
        </QueryClientProvider>
      </DukeAuthProvider>
    </SafeAreaProvider>
  );
}
