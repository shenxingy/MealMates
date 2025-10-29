import { StyleSheet, Text, View } from "react-native";


import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";

export default function HomePage() {
  // Gradient color
  const baseColor = "255,120,0";
  const header = "MealMate";

  return (
    <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
      <Text style={styles.contentText}>
        Scroll up to see the blur effect. When the content scrolls into
        the Header area, a gradient blur effect will become visible.
      </Text>
      {Array.from({ length: 20 }, (_, i) => (
        <View key={i} style={styles.contentBlock}>
          <Text style={styles.blockTitle}>Content Block {i + 1}</Text>
          <Text style={styles.blockText}>
            Home Page Content Block {i + 1}
          </Text>
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
  contentHeader: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  contentText: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  contentBlock: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  blockText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
