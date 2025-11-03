import type { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProfileHeaderProps {
  greetingName: string;
  onEditPress?: () => void;
  onSettingsPress?: () => void;
}

const ProfileHeader: FC<ProfileHeaderProps> = ({
  greetingName,
  onEditPress,
  onSettingsPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <Pressable
          onPress={onEditPress}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={20} color="#1F2937" />
          <Text style={styles.editLabel}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={onSettingsPress}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color="#1F2937" />
        </Pressable>
      </View>
      <Text style={styles.greetingText}>Hi, {greetingName}</Text>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 12,
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    color: "#0F172A",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  editLabel: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
