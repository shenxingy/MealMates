import { StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

export default function CreateEventPage() {
  return (
    <>
      <Stack.Screen options={{ title: "Create Meeting Event", presentation: "modal" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Create Meeting Event</Text>
        <Text>This page is under construction.</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

