import type {
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import type { SearchBarProps } from "react-native-screens";
import { Platform, useColorScheme } from "react-native";
import { Stack, useRouter } from "expo-router";
import { isLiquidGlassAvailable } from "expo-glass-effect";

export default function SearchLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  

  const handleSearchTextChange = (
    e: NativeSyntheticEvent<TextInputFocusEventData>,
  ) => {
    const searchParam = e.nativeEvent.text;
    console.log("Search text changed", searchParam);
    router.setParams({ query: searchParam });
  };

  const headerSearchBarOptions: SearchBarProps | undefined =
    Platform.OS === "ios" && isLiquidGlassAvailable()
      ? {
          placement: "automatic",
          placeholder: "Search",
          onChangeText: handleSearchTextChange,
        }
      : undefined;

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colorScheme === "dark" ? "#000" : "#f3f3f3" } }}>
      <Stack.Screen
        name="index"
        options={{
          title: "",
          headerStyle: {
            backgroundColor: "rgba(0,0,0,0)",
          },
          headerShown: Platform.OS === "ios" && isLiquidGlassAvailable(),
          headerSearchBarOptions,
        }}
      />
    </Stack>
  );
}
