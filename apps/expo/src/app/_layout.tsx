import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "~/utils/api";

import "../styles.css";

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {/*
            The Stack component displays the current page.
            It also allows you to configure your screens
          */}
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: colorScheme === "dark" ? "#000" : "#f3f3f3",
            },
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ title: "Login Page" }} />
        </Stack>
        <StatusBar />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
