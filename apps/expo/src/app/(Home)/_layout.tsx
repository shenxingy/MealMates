import { Stack } from "expo-router";

export default function HomePageLayout() {
  return <>
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home Page", headerShown: false}} />
    </Stack>
  </>
}