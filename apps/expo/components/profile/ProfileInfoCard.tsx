import type { FC } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface ProfileInfoCardProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
  fallbackLabel?: string;
}

const ProfileInfoCard: FC<ProfileInfoCardProps> = ({
  name,
  email,
  avatarUrl,
  fallbackLabel,
}) => {
  const trimmedName = name.trim();
  const trimmedLabel = fallbackLabel?.trim();
  const labelInitial = trimmedLabel?.at(0);
  const nameInitial = trimmedName.at(0);
  const fallbackInitial = labelInitial ?? nameInitial ?? "?";
  const displayInitial = fallbackInitial.toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarInitial}>{displayInitial}</Text>
        )}
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
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
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
