import type { FC } from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProfileInfoCardProps {
  name: string;
  email: string;
  avatarEmoji?: string;
}

const ProfileInfoCard: FC<ProfileInfoCardProps> = ({
  name,
  email,
  avatarEmoji = "🐿️",
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
      </View>
      <View>
        <Text style={styles.nameText}>{name}</Text>
        <Text style={styles.emailText}>{email}</Text>
      </View>
    </View>
  );
};

export default ProfileInfoCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 28,
    marginBottom: 24,
    shadowColor: "#102A54",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FB",
    marginRight: 18,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  emailText: {
    marginTop: 4,
    fontSize: 16,
    color: "#374151",
  },
});

