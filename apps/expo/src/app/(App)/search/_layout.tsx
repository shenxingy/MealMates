import { Platform } from "react-native";
import { Stack, useRouter } from "expo-router";

export default function SearchLayout() {
  const router = useRouter();
  const headerSearchBarOptions =
    Platform.OS === "ios"
      ? {
          placement: "automatic",
          placeholder: "Search",
          onChangeText: (e: any) => {
            const searchParam = e.nativeEvent.text;
            console.log("Search text changed", searchParam);
            router.setParams({ query: searchParam });
          },
        }
      : undefined;

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "",
          headerStyle: {
            backgroundColor: "rgba(0,0,0,0)",
          },
          headerShown: Platform.OS !== "android",
          headerSearchBarOptions,
        }}
      />
    </Stack>
  );
}
