import type { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ProfileStat {
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
}

const ProfileStatCard: FC<ProfileStat> = ({ label, value, icon }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={24} color="#0F172A" />
      </View>
      <Text style={styles.labelText}>{label}</Text>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );
};

export default ProfileStatCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    marginHorizontal: 6,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    shadowColor: "#102A54",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5FB",
    marginBottom: 12,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  valueText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
});
