import { StyleSheet, View } from "react-native";

export default function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "rgba(15,23,42,0.08)",
    marginTop: 32,
    marginBottom: 28,
  },
});

