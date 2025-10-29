import { Stack } from "expo-router";

export default function YouLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "You Page" }} />
      </Stack>
    </>
  );
}
