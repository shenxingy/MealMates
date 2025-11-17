import type { StyleProp, ViewStyle } from "react-native";
import { Image, Pressable, StyleSheet, Text } from "react-native";

interface DukeRegisterButtonProps {
  onPress?: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export default function DukeRegisterButton({
  onPress,
  label = "Register with Duke",
  style,
  disabled = false,
}: DukeRegisterButtonProps) {
  return (
    <Pressable
      style={[styles.registerButton, disabled && styles.disabledButton, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Image
        source={require("../../assets/blue-devil.png")}
        style={styles.dukeIcon}
        resizeMode="contain"
      />
      <Text style={styles.registerText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  registerButton: {
    marginTop: 32,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 28,
    shadowColor: "#1F2937",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  dukeIcon: {
    width: 32,
    height: 32,
  },
  registerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginLeft: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
