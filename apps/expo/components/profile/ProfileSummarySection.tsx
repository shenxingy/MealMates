import type { ElementType } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import type { ProfileStat } from "./ProfileStatCard";
import ProfileHeader from "./ProfileHeader";
import ProfileInfoCard from "./ProfileInfoCard";
import ProfileStatsRow from "./ProfileStatsRow";

interface ProfileSummarySectionProps {
  isFetchingProfile: boolean;
  profileError?: string | null;
  shouldPromptSignIn: boolean;
  profileMissing: boolean;
  greetingName: string;
  profileEmail: string;
  profileAvatar: string | null;
  avatarColor: string;
  fallbackLabel: string;
  stats: ProfileStat[];
  onRetry: () => void;
  onLogout: () => void;
  onEditPress: () => void;
  onSettingsPress: () => void;
  isLogoutDisabled: boolean;
  showLogoutSpinner: boolean;
}

const ProfileSummarySection: ElementType<ProfileSummarySectionProps> = ({
  isFetchingProfile,
  profileError,
  shouldPromptSignIn,
  profileMissing,
  greetingName,
  profileEmail,
  profileAvatar,
  avatarColor,
  fallbackLabel,
  stats,
  onRetry,
  onLogout,
  onEditPress,
  onSettingsPress,
  isLogoutDisabled,
  showLogoutSpinner,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const renderPrimaryContent = () => {
    if (isFetchingProfile) {
      return (
        <View style={[styles.messageCard, isDark && styles.messageCardDark]}>
          <ActivityIndicator size="large" color={isDark ? "rgba(255, 255, 255, 0.85)" : "#0F172A"} />
          <Text style={[styles.loadingLabel, isDark && styles.loadingLabelDark]}>Loading your profile...</Text>
        </View>
      );
    }

    if (profileError) {
      return (
        <View style={[styles.messageCard, isDark && styles.messageCardDark]}>
          <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
            We could not load your profile. Pull to refresh or try again later.
          </Text>
          <Pressable style={[styles.retryButton, isDark && styles.retryButtonDark]} onPress={onRetry}>
            <Text style={styles.retryLabel}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    if (shouldPromptSignIn) {
      return (
        <View style={[styles.messageCard, isDark && styles.messageCardDark]}>
          <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
            Sign in with your Duke account to view your profile.
          </Text>
        </View>
      );
    }

    if (profileMissing) {
      return (
        <View style={[styles.messageCard, isDark && styles.messageCardDark]}>
          <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
            We couldn&apos;t find your profile record. Please sign out and sign
            back in.
          </Text>
          <Pressable style={[styles.retryButton, isDark && styles.retryButtonDark]} onPress={onLogout}>
            <Text style={styles.retryLabel}>Sign Out</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <>
        <ProfileHeader
          greetingName={greetingName}
          onEditPress={onEditPress}
          onSettingsPress={onSettingsPress}
          isDark={isDark}
        />

        <ProfileInfoCard
          name={greetingName}
          email={profileEmail}
          avatarEmoji={profileAvatar}
          avatarColor={avatarColor}
          fallbackLabel={fallbackLabel}
          isDark={isDark}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      {renderPrimaryContent()}

      <ProfileStatsRow stats={stats} isDark={isDark} />

      <Pressable
        style={[styles.logoutButton, isLogoutDisabled && styles.disabledButton]}
        onPress={onLogout}
        disabled={isLogoutDisabled}
      >
        {showLogoutSpinner ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.logoutLabel}>Logout</Text>
        )}
      </Pressable>

      <View style={styles.bottomSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingTop: 16,
    gap: 24,
  },
  messageCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
    gap: 8,
  },
  messageCardDark: {
    backgroundColor: "rgba(45, 45, 45, 0.9)",
  },
  loadingLabel: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
    textAlign: "center",
  },
  loadingLabelDark: {
    color: "rgba(255, 255, 255, 0.85)",
  },
  errorText: {
    fontSize: 16,
    color: "#B91C1C",
    textAlign: "center",
  },
  errorTextDark: {
    color: "#FCA5A5",
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#1F2937",
  },
  retryButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  retryLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  logoutButton: {
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
  disabledButton: {
    opacity: 0.6,
  },
  bottomSpacer: {
    height: 120,
  },
});

export default ProfileSummarySection;
