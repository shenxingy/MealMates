import { useColorScheme } from "react-native";
import { Stack } from "expo-router";

export default function PostLayout() {
  const colorScheme = useColorScheme();
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === "dark" ? "#000" : "#f3f3f3",
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Posts Page" }} />
        <Stack.Screen name="detail" options={{ title: "Detail Page" }} />
        <Stack.Screen name="create" options={{ title: "Create Page" }} />
        <Stack.Screen
          name="comment"
          options={{ title: "Comment Page", presentation: "modal" }}
        />
      </Stack>
    </>
  );
}
