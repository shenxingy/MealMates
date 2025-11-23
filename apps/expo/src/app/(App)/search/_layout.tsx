import type {
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import type { SearchBarProps } from "react-native-screens";
import { Platform } from "react-native";
import { Stack, useRouter } from "expo-router";

export default function SearchLayout() {
  const router = useRouter();

  const handleSearchTextChange = (
    e: NativeSyntheticEvent<TextInputFocusEventData>,
  ) => {
    const searchParam = e.nativeEvent.text;
    console.log("Search text changed", searchParam);
    router.setParams({ query: searchParam });
  };

  const headerSearchBarOptions: SearchBarProps | undefined =
    Platform.OS === "ios"
      ? {
          placement: "automatic",
          placeholder: "Search",
          onChangeText: handleSearchTextChange,
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
