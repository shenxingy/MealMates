import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";

import type { ProfileStat } from "../../../../components/profile";
import type { RouterInputs, RouterOutputs } from "~/utils/api";
import { useDukeAuth } from "~/hooks/useDukeAuth";
import { trpcClient } from "~/utils/api";
import {
  getStoredUserId,
  setStoredUserId as persistUserId,
} from "~/utils/user-storage";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import {
  ProfileHeader,
  ProfileInfoCard,
  ProfileStatsRow,
} from "../../../../components/profile";

type UserProfile = RouterOutputs["user"]["byId"];
type UpdateProfileInput = RouterInputs["user"]["updateProfileById"];

const getNetIdFromSub = (sub: string) => {
  const separatorIndex = sub.indexOf("@");
  return separatorIndex === -1 ? undefined : sub.slice(0, separatorIndex);
};
const DEFAULT_AVATAR_EMOJI = "🙂";
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;
const CJK_REGEX = /[\u4e00-\u9fa5\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;
const MAX_VISUAL_NAME_LENGTH = 15;
const isSingleEmoji = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  const graphemes = [...trimmed];
  return graphemes.length === 1 && EMOJI_REGEX.test(trimmed);
};

const isAsciiCharacter = (char: string) => {
  const codePoint = char.codePointAt(0);
  return codePoint !== undefined && codePoint <= 0x7f;
};

const getVisualNameLength = (value: string) => {
  let length = 0;
  for (const char of value) {
    if (isAsciiCharacter(char)) {
      length += 1;
    } else if (CJK_REGEX.test(char)) {
      length += 1.363;
    } else {
      length += 1.1;
    }
  }
  return length;
};

export const validateDisplayName = (name: string) => {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: "Display name cannot be empty." };
  }

  if (EMOJI_REGEX.test(trimmed)) {
    return { valid: false, error: "Emoji characters are not supported here." };
  }

  if (getVisualNameLength(trimmed) > MAX_VISUAL_NAME_LENGTH) {
    return { valid: false, error: "Display name is too long for the header." };
  }

  return { valid: true };
};

export default function YouPage() {
  const router = useRouter();
  const [storedUserId, setStoredUserIdState] = useState<string | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameLengthError, setNameLengthError] = useState<string | null>(null);
  const [emojiInput, setEmojiInput] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const {
    logout,
    isLoading: isAuthMutating,
    userInfo,
    isAuthenticated,
  } = useDukeAuth();

  const stats: ProfileStat[] = [
    { label: "Invitations", value: 10, icon: "mail-open-outline" },
    { label: "Acceptances", value: 8, icon: "checkmark-circle-outline" },
    { label: "Posts", value: 5, icon: "planet-outline" },
  ];

  const loadUserId = useCallback(async () => {
    setIsLoadingUserId(true);
    try {
      const storedId = await getStoredUserId();
      if (storedId) {
        setStoredUserIdState(storedId);
        return;
      }

      if (userInfo) {
        const fallback = userInfo.dukeNetID ?? getNetIdFromSub(userInfo.sub);
        if (fallback) {
          setStoredUserIdState(fallback);
          await persistUserId(fallback);
          return;
        }
      }

      setStoredUserIdState(null);
    } catch (error) {
      console.error("[YOU PAGE] Failed to load stored user id:", error);
    } finally {
      setIsLoadingUserId(false);
    }
  }, [userInfo]);

  useEffect(() => {
    void loadUserId();
  }, [loadUserId]);

  useFocusEffect(
    useCallback(() => {
      void loadUserId();
    }, [loadUserId]),
  );

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery<UserProfile>({
    queryKey: ["userProfile", storedUserId],
    enabled: Boolean(storedUserId),
    queryFn: async () => {
      if (!storedUserId) {
        throw new Error("Missing user id");
      }
      return trpcClient.user.byId.query({ id: storedUserId });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      trpcClient.user.updateProfileById.mutate(input),
  });

  const handleNameInputChange = (value: string) => {
    setNameInput(value);
    const validation = validateDisplayName(value);
    setNameLengthError(validation.valid ? null : validation.error ?? null);
  };

  const handleEditProfile = () => {
    if (!userProfile || !storedUserId) {
      Alert.alert(
        "Profile unavailable",
        "We could not load your profile information. Please sign in again.",
      );
      return;
    }

    handleNameInputChange(userProfile.name);
    setEmojiInput(userProfile.image ?? "");
    setModalError(null);
    setIsEditVisible(true);
  };

  const handleOpenSettings = () => {
    // TODO: Navigate to settings page
  };

  const handleCloseEditModal = () => {
    setIsEditVisible(false);
    setNameLengthError(null);
    setModalError(null);
  };

  const handleSaveProfile = async () => {
    if (!storedUserId) {
      setModalError("You need to sign in before editing your profile.");
      return;
    }

    const trimmedName = nameInput.trim();

    const validation = validateDisplayName(trimmedName);
    if (!validation.valid) {
      const errorMessage =
        validation.error ?? "Please enter a shorter display name.";
      setNameLengthError(errorMessage);
      setModalError(errorMessage);
      return;
    }

    const trimmedEmoji = emojiInput.trim();
    if (trimmedEmoji && !isSingleEmoji(trimmedEmoji)) {
      setModalError("Please enter exactly one emoji.");
      return;
    }

    try {
      const result = await updateProfileMutation.mutateAsync({
        id: storedUserId,
        name: trimmedName,
        image: trimmedEmoji,
      });
      if (!result.success) {
        setModalError("We couldn't update your profile. Please try again.");
        return;
      }
      await refetchProfile();
      handleCloseEditModal();
    } catch (error: unknown) {
      console.error("[YOU PAGE] Failed to update profile:", error);
      setModalError("Unable to save your changes. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setStoredUserIdState(null);
      handleCloseEditModal();
      await loadUserId();
    } catch (error) {
      console.error("[YOU PAGE] Failed to logout:", error);
      Alert.alert("Logout failed", "Please try again.");
    } finally {
      router.replace("/");
    }
  };

  const isFetchingProfile = isLoadingUserId || isProfileLoading;
  const shouldPromptSignIn =
    !storedUserId && !isLoadingUserId && !isAuthenticated;
  const profileMissing =
    storedUserId && !userProfile && !isFetchingProfile && !profileError;
  const greetingName = userProfile?.name ?? "Meal Mate";
  const profileEmail = userProfile?.email ?? "Sign in to view your email";
  const profileAvatar = userProfile?.image ?? DEFAULT_AVATAR_EMOJI;
  const header = "Profile";
  const baseColor = "195,227,255";

  return (
    <>
      <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
        <View style={styles.content}>
          {isFetchingProfile ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0F172A" />
              <Text style={styles.loadingLabel}>Loading your profile...</Text>
            </View>
          ) : profileError ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorText}>
                We could not load your profile. Pull to refresh or try again
                later.
              </Text>
              <Pressable
                style={styles.retryButton}
                onPress={() => {
                  void loadUserId();
                  if (storedUserId) {
                    void refetchProfile();
                  }
                }}
              >
                <Text style={styles.retryLabel}>Try Again</Text>
              </Pressable>
            </View>
          ) : shouldPromptSignIn ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorText}>
                Sign in with your Duke account to view your profile.
              </Text>
            </View>
          ) : profileMissing ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorText}>
                We couldn&apos;t find your profile record. Please sign out and
                sign back in.
              </Text>
              <Pressable style={styles.retryButton} onPress={handleLogout}>
                <Text style={styles.retryLabel}>Sign Out</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <ProfileHeader
                greetingName={greetingName}
                onEditPress={handleEditProfile}
                onSettingsPress={handleOpenSettings}
              />

              <ProfileInfoCard
                name={greetingName}
                email={profileEmail}
                avatarEmoji={profileAvatar}
                fallbackLabel={userProfile?.name ?? userProfile?.email ?? "?"}
              />
            </>
          )}

          <ProfileStatsRow stats={stats} />

          <Pressable
            style={[
              styles.logoutButton,
              (isAuthMutating || isFetchingProfile) && styles.disabledButton,
            ]}
            onPress={handleLogout}
            disabled={isAuthMutating || isFetchingProfile}
          >
            {isAuthMutating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.logoutLabel}>Logout</Text>
            )}
          </Pressable>

          <View style={styles.bottomSpacer} />
        </View>
      </AnimatedPageFrame>

      <Modal
        transparent
        visible={isEditVisible}
        animationType="slide"
        onRequestClose={handleCloseEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.textInput}
              value={nameInput}
              placeholder="Display name"
              onChangeText={handleNameInputChange}
            />
            {nameLengthError ? (
              <Text style={styles.nameErrorText}>{nameLengthError}</Text>
            ) : null}
            <TextInput
              style={styles.textInput}
              value={emojiInput}
              placeholder="Favorite emoji (e.g., 🍣)"
              onChangeText={setEmojiInput}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={4}
            />
            <View style={styles.emojiPreviewRow}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.previewCircle}>
                <Text style={styles.previewEmoji}>
                  {emojiInput.trim() || DEFAULT_AVATAR_EMOJI}
                </Text>
              </View>
            </View>
            <Text style={styles.emojiHint}>
              Enter a single emoji to use as your avatar. Leave blank to use
              your initials.
            </Text>
            {modalError ? (
              <Text style={styles.modalError}>{modalError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.button, styles.secondaryButton]}
                onPress={handleCloseEditModal}
                disabled={updateProfileMutation.isPending}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.primaryButton,
                  (!nameInput.trim() ||
                    updateProfileMutation.isPending ||
                    !!nameLengthError) &&
                    styles.disabledButton,
                ]}
                onPress={handleSaveProfile}
                disabled={
                  !nameInput.trim() ||
                  updateProfileMutation.isPending ||
                  !!nameLengthError
                }
              >
                {updateProfileMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 4,
    paddingTop: 16,
    gap: 24,
  },
  loadingContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
    gap: 8,
  },
  loadingLabel: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#B91C1C",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#1F2937",
  },
  retryLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#CBD5F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  nameErrorText: {
    marginTop: 4,
    marginBottom: 4,
    color: "#B91C1C",
    fontSize: 14,
  },
  emojiPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  previewCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  previewEmoji: {
    fontSize: 30,
  },
  emojiHint: {
    fontSize: 13,
    color: "#6B7280",
  },
  modalError: {
    color: "#B91C1C",
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  },
  secondaryButton: {
    backgroundColor: "#E2E8F0",
  },
  secondaryButtonText: {
    color: "#1F2937",
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: "#DC2626",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
