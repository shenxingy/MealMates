import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function PostLayout() {
  const colorScheme = useColorScheme();
  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colorScheme === "dark" ? "#000" : "#f3f3f3" } }}>
        <Stack.Screen name="index" options={{ title: "Posts Page" }} />
      </Stack>
    </>
  );
}
