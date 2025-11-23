import { Stack, useRouter } from "expo-router";

export default function SearchLayout() {
  const router = useRouter();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "",
          headerStyle: {
            backgroundColor: "rgba(0,0,0,0)",
          },
          headerSearchBarOptions: {
            placement: "automatic",
            placeholder: "Search",
            onChangeText: (e) => {
              const searchParam = e.nativeEvent.text;
              console.log("Search text changed", searchParam);
              router.setParams({ query: searchParam });
            },
          },
        }}
      />
    </Stack>
  );
}
