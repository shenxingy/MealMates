import type { FC } from "react";
import { StyleSheet, View } from "react-native";

import type { ProfileStat } from "./ProfileStatCard";
import ProfileStatCard from "./ProfileStatCard";

interface ProfileStatsRowProps {
  stats: ProfileStat[];
}

const ProfileStatsRow: FC<ProfileStatsRowProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      {stats.map((stat) => (
        <ProfileStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
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
