import type { ElementType } from "react";
import { StyleSheet, View } from "react-native";

import type { ProfileStat } from "./ProfileStatCard";
import ProfileStatCard from "./ProfileStatCard";

interface ProfileStatsRowProps {
  stats: ProfileStat[];
  isDark?: boolean;
}

const ProfileStatsRow: ElementType<ProfileStatsRowProps> = ({ stats, isDark = false }) => {
  return (
    <View style={styles.container}>
      {stats.map((stat) => (
        <ProfileStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          isDark={isDark}
        />
      ))}
    </View>
  );
};

export default ProfileStatsRow;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
});
