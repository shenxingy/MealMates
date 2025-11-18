import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
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
  ProfileEditModal,
  ProfileSummarySection,
} from "../../../../components/profile";

type UserProfile = RouterOutputs["user"]["byId"];
type UpdateProfileInput = RouterInputs["user"]["updateProfileById"];

const getNetIdFromSub = (sub: string) => {
  const separatorIndex = sub.indexOf("@");
  return separatorIndex === -1 ? undefined : sub.slice(0, separatorIndex);
};
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;
const CJK_REGEX =
  /[\u4e00-\u9fa5\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;
const MAX_VISUAL_NAME_LENGTH = 15;
const AVATAR_COLOR_OPTIONS = [
  "#F5F7FB",
  "#FFE4E6",
  "#FEF3C7",
  "#DCFCE7",
  "#E0F2FE",
  "#F3E8FF",
];
const DEFAULT_AVATAR_COLOR = AVATAR_COLOR_OPTIONS[0] ?? "#F5F7FB";
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6})$/;
const isSingleEmojiOrLetter = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  const graphemes = [...trimmed];
  if (graphemes.length !== 1) {
    return false;
  }
  const char = graphemes[0];
  if (!char) {
    return false;
  }
  if (EMOJI_REGEX.test(char)) {
    return true;
  }
  return /^[A-Za-z]$/.test(char);
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

const normalizeHexColor = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
};

const isValidHexColor = (value: string) => HEX_COLOR_REGEX.test(value);

export default function YouPage() {
  const router = useRouter();
  const [storedUserId, setStoredUserIdState] = useState<string | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameLengthError, setNameLengthError] = useState<string | null>(null);
  const [emojiInput, setEmojiInput] = useState("");
  const [emojiError, setEmojiError] = useState<string | null>(null);
  const [avatarColorInput, setAvatarColorInput] =
    useState<string>(DEFAULT_AVATAR_COLOR);
  const [customColorInput, setCustomColorInput] =
    useState<string>(DEFAULT_AVATAR_COLOR);
  const [colorError, setColorError] = useState<string | null>(null);
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
    setNameLengthError(validation.valid ? null : (validation.error ?? null));
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
    setEmojiError(null);
    setAvatarColorInput(userProfile.avatarColor);
    setCustomColorInput(userProfile.avatarColor);
    setColorError(null);
    setModalError(null);
    setIsEditVisible(true);
  };

  const handleOpenSettings = () => {
    // TODO: Navigate to settings page
  };

  const handleSelectColor = (color: string) => {
    setAvatarColorInput(color);
    setCustomColorInput(color);
    setColorError(null);
  };

  const handleCustomColorChange = (value: string) => {
    setCustomColorInput(value);
    const normalized = normalizeHexColor(value);
    if (!normalized) {
      setColorError("Please enter a color value.");
      return;
    }
    if (isValidHexColor(normalized)) {
      setAvatarColorInput(normalized);
      setColorError(null);
    } else {
      setColorError("Use a valid hex color, e.g. #FF5733.");
    }
  };

  const handleEmojiInputChange = (value: string) => {
    setEmojiInput(value);
    const trimmed = value.trim();
    if (!trimmed) {
      setEmojiError(null);
      return;
    }
    if (isSingleEmojiOrLetter(trimmed)) {
      setEmojiError(null);
    } else {
      setEmojiError("Use a single emoji or letter.");
    }
  };

  const handleCloseEditModal = () => {
    setIsEditVisible(false);
    setNameLengthError(null);
    setModalError(null);
    setAvatarColorInput(userProfile?.avatarColor ?? DEFAULT_AVATAR_COLOR);
    setCustomColorInput(userProfile?.avatarColor ?? DEFAULT_AVATAR_COLOR);
    setColorError(null);
    setEmojiError(null);
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
    if (emojiError) {
      setModalError(emojiError);
      return;
    }
    if (trimmedEmoji && !isSingleEmojiOrLetter(trimmedEmoji)) {
      setModalError("Use a single emoji or letter.");
      setEmojiError("Use a single emoji or letter.");
      return;
    }

    try {
      const result = await updateProfileMutation.mutateAsync({
        id: storedUserId,
        name: trimmedName,
        image: trimmedEmoji,
        avatarColor: avatarColorInput,
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
    Boolean(storedUserId) &&
    !userProfile &&
    !isFetchingProfile &&
    !profileError;
  const greetingName = userProfile?.name ?? "Meal Mate";
  const profileEmail = userProfile?.email ?? "Sign in to view your email";
  const profileAvatar = userProfile?.image ?? null;
  const header = "Profile";
  const baseColor = "195,227,255";
  const isLogoutDisabled = isAuthMutating || isFetchingProfile;
  const showLogoutSpinner = isAuthMutating;
  const disableSaveButton =
    !nameInput.trim() ||
    updateProfileMutation.isPending ||
    !!nameLengthError ||
    avatarColorInput.trim().length === 0 ||
    !!colorError ||
    !!emojiError;
  const handleRetry = () => {
    void loadUserId();
    if (storedUserId) {
      void refetchProfile();
    }
  };
  const fallbackLabel = userProfile?.name ?? userProfile?.email ?? "?";
  const normalizedGreeting = greetingName.trim();
  const defaultAvatarLabel =
    normalizedGreeting.length > 0
      ? normalizedGreeting.charAt(0).toUpperCase()
      : "?";

  return (
    <>
      <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
        <ProfileSummarySection
          isFetchingProfile={isFetchingProfile}
          profileError={
            profileError
              ? profileError instanceof Error
                ? profileError.message
                : String(profileError)
              : null
          }
          shouldPromptSignIn={shouldPromptSignIn}
          profileMissing={profileMissing}
          greetingName={greetingName}
          profileEmail={profileEmail}
          profileAvatar={profileAvatar}
          avatarColor={userProfile?.avatarColor ?? DEFAULT_AVATAR_COLOR}
          fallbackLabel={fallbackLabel}
          stats={stats}
          onRetry={handleRetry}
          onLogout={handleLogout}
          onEditPress={handleEditProfile}
          onSettingsPress={handleOpenSettings}
          isLogoutDisabled={isLogoutDisabled}
          showLogoutSpinner={showLogoutSpinner}
        />
      </AnimatedPageFrame>

      <ProfileEditModal
        visible={isEditVisible}
        nameValue={nameInput}
        onNameChange={handleNameInputChange}
        nameError={nameLengthError}
        emojiValue={emojiInput}
        onEmojiChange={handleEmojiInputChange}
        emojiError={emojiError}
        availableColors={AVATAR_COLOR_OPTIONS}
        selectedColor={avatarColorInput}
        onColorChange={handleSelectColor}
        colorInputValue={customColorInput}
        onCustomColorInputChange={handleCustomColorChange}
        colorError={colorError}
        onClose={handleCloseEditModal}
        onSave={handleSaveProfile}
        modalError={modalError}
        isSaving={updateProfileMutation.isPending}
        disableSave={disableSaveButton}
        defaultAvatarLabel={defaultAvatarLabel}
      />
    </>
  );
}
