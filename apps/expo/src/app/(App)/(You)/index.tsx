import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradientBackground from "../../../../components/background/LinearGradientBackground";
import {
  ProfileHeader,
  ProfileInfoCard,
  ProfileStatsRow,
} from "../../../../components/profile";
import type { ProfileStat } from "../../../../components/profile";

export default function YouPage() {
  const stats: ProfileStat[] = [
    { label: "Invitations", value: 10, icon: "mail-open-outline" },
    { label: "Acceptances", value: 8, icon: "checkmark-circle-outline" },
    { label: "Posts", value: 5, icon: "planet-outline" },
  ];

  const handleEditProfile = () => {
    // TODO: Navigate to profile edit screen
  };

  const handleOpenSettings = () => {
    // TODO: Navigate to settings
  };

  return (
    <LinearGradientBackground startColor="#C3E3FF" endColor="#F7F7FB">
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader
            greetingName="Chipmunk Bar"
            onEditPress={handleEditProfile}
            onSettingsPress={handleOpenSettings}
          />

          <ProfileInfoCard
            name="Chipmunk Bar"
            email="cb123@duke.edu"
            avatarEmoji="🐿️"
          />

          <ProfileStatsRow stats={stats} />

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  bottomSpacer: {
    height: 120,
  },
});
