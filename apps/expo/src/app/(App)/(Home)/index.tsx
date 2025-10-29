import { Pressable, StyleSheet, View } from "react-native";

import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import EventView from "../../../../components/Homepage/EventView";

export default function HomePage() {
  // Gradient color
  const baseColor = "255,120,0";
  const header = "MealMate";

  return (
    <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
      <View style={styles.emptySpace}></View>

      {Array.from({ length: 20 }, (_, i) => (
        <View key={i} style={{ marginBottom: 20 }}>
          <Pressable
            onPress={() => {
              console.log(`Event ${i} Pressed!`);
            }}
          >
            <EventView
              scheduleTime={`12:${i}`}
              username={"Nagasaki Soyo"}
              mood={"🤓"}
              meetPoint={"Tsuki no mori Girls' School"}
              restaurantName={"RING"}
              message={
                "Hello! Let's have lunch together. Let me know if you're interested. Could be fun!"
              }
            />
          </Pressable>
        </View>
      ))}
    </AnimatedPageFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  emptySpace: {
    marginTop: 30,
  },
});
