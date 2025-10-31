import { useColorScheme } from "react-native";
import { Stack } from "expo-router";

export default function HomeLayout() {
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
        <Stack.Screen name="index" options={{ title: "Home Page" }} />
        <Stack.Screen name="event/[eventId]" options={{ title: "Event Details" }} />
      </Stack>
    </>
  );
}
