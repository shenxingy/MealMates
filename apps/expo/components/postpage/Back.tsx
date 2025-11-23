import { StyleSheet, Text } from "react-native";

export default function Back({ text }: { text: string }) {
  return <Text style={styles.back}>{text}</Text>;
}

const styles = StyleSheet.create({
  back: {
    width: "30%",
    backgroundColor: "#ffa",
    borderRadius: 20,
    padding: 5,
    marginBottom: 10,
    fontSize: 25,
    textAlign: "center",
  },
});
