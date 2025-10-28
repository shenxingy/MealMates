import { Stack } from "expo-router";

export default function PostLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Posts Page" }} />
      </Stack>
    </>
  );
}