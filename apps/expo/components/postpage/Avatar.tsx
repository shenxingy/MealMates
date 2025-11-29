import { StyleSheet, Text, View } from "react-native";

export default function Avatar({
  name,
  image,
  color,
}: {
  name: string;
  image: string | null;
  color: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase();
  const emoji = image?.trim();
  return (
    <View style={[styles.avatarContainer, { backgroundColor: color }]}>
      <Text style={[styles.avatarEmoji, !emoji && styles.avatarLetter]}>
        {emoji ?? initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FB",
    marginRight: 5,
  },
  avatarEmoji: {
    fontSize: 16,
    lineHeight: 20,
    color: "#1F2937",
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: "700",
  },
});
