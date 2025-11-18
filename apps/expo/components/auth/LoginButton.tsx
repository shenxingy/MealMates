import { Pressable, StyleSheet, Text } from "react-native";

interface LoginButtonProps {
  onPress: () => void;
  label?: string;
}

export default function LoginButton({
  onPress,
  label = "Log in",
}: LoginButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.loginButton}>
      <Text style={styles.loginText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loginButton: {
    backgroundColor: "#007AFF",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 60,
    shadowColor: "#1D4ED8",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
<<<<<<< HEAD

=======
>>>>>>> dev
