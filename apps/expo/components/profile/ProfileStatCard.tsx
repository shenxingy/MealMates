import type { ElementType } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ProfileStat {
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  isDark?: boolean;
}

const ProfileStatCard: ElementType<ProfileStat> = ({ label, value, icon, isDark = false }) => {
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.iconWrapper, isDark && styles.iconWrapperDark]}>
        <Ionicons name={icon} size={24} color={isDark ? "rgba(255, 255, 255, 0.85)" : "#0F172A"} />
      </View>
      <Text style={[styles.labelText, isDark && styles.labelTextDark]}>{label}</Text>
      <Text style={[styles.valueText, isDark && styles.valueTextDark]}>{value}</Text>
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
  containerDark: {
    backgroundColor: "rgba(45, 45, 45, 0.9)",
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
  iconWrapperDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  labelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  labelTextDark: {
    color: "rgba(255, 255, 255, 0.85)",
  },
  valueText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  valueTextDark: {
    color: "rgba(255, 255, 255, 0.95)",
  },
});
