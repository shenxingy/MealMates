import type { ElementType } from "react";
import { StyleSheet, Text, View } from "react-native";

const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

const DEFAULT_AVATAR_BG = "#F5F7FB";

interface ProfileInfoCardProps {
  name: string;
  email: string;
  avatarEmoji?: string | null;
  fallbackLabel?: string;
  avatarColor?: string;
}

const ProfileInfoCard: ElementType<ProfileInfoCardProps> = ({
  name,
  email,
  avatarEmoji,
  fallbackLabel,
  avatarColor,
}) => {
  const trimmedName = name.trim();
  const trimmedLabel = fallbackLabel?.trim();
  const labelInitial = trimmedLabel?.at(0);
  const nameInitial = trimmedName.at(0);
  const fallbackInitial = labelInitial ?? nameInitial ?? "?";
  const displayInitial = fallbackInitial.toUpperCase();
  const trimmedEmoji = avatarEmoji?.trim();

  const isEmojiAvatar =
    trimmedEmoji && trimmedEmoji.length > 0 && EMOJI_REGEX.test(trimmedEmoji);
  const avatarDisplay = trimmedEmoji
    ? isEmojiAvatar
      ? trimmedEmoji
      : (trimmedEmoji.at(0)?.toUpperCase() ?? displayInitial)
    : displayInitial;
  const isLetterAvatar =
    avatarDisplay.length === 1 && !EMOJI_REGEX.test(avatarDisplay);

  const avatarBackgroundColor =
    avatarColor && avatarColor.trim().length > 0
      ? avatarColor
      : DEFAULT_AVATAR_BG;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatarContainer,
          { backgroundColor: avatarBackgroundColor },
        ]}
      >
        <Text
          style={[styles.avatarEmoji, isLetterAvatar && styles.avatarLetter]}
        >
          {avatarDisplay}
        </Text>
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
    fontSize: 34,
    lineHeight: 38,
    color: "#1F2937",
  },
  avatarLetter: {
    fontSize: 30,
    fontWeight: "700",
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
