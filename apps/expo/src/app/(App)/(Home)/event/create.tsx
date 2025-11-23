import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import type { RouterOutputs } from "~/utils/api";
import { trpcClient } from "~/utils/api";
import { getStoredUserId } from "~/utils/user-storage";
import AnimatedPageFrame from "../../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../../components/frame/EmptySpace";

// 定义 UserProfile 类型
type UserProfile = RouterOutputs["user"]["byId"];

export default function CreateEventPage() {
  const router = useRouter();
  
  // 1. 状态：存储用户ID
  const [storedUserId, setStoredUserId] = useState<string | null>(null);

  // 2. 加载 storedUserId
  useEffect(() => {
    getStoredUserId().then(setStoredUserId).catch(console.error);
  }, []);

  // 3. 查询用户详细信息
  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ["userProfile", storedUserId],
    enabled: !!storedUserId, // 只有拿到了 ID 才查询
    queryFn: async () => {
      if (!storedUserId) throw new Error("No user ID");
      return trpcClient.user.byId.query({ id: storedUserId });
    },
  });

  const [restaurantName, setRestaurantName] = useState("");
  const [meetPoint, setMeetPoint] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [mood, setMood] = useState("");
  const [message, setMessage] = useState("");

  const baseColor = "255,120,0";

  const handleSubmit = () => {
    if (!restaurantName || !meetPoint || !scheduleTime) {
      Alert.alert("Missing Info", "Please fill in the required fields.");
      return;
    }

    // 4. 获取当前用户的最新信息
    const currentUsername = userProfile?.name ?? "Anonymous";
    
    // 获取头像逻辑：
    // 优先使用用户设置的 image (Emoji)
    // 如果没有，则构造一个默认头像链接，或者直接存 null (让前端展示时自动回退到首字母)
    // 这里为了简单和一致，如果你存的是 Emoji，就直接存入 avatarUrl
    // 如果是 URL 形式的头像系统，这里应该是 URL
    const currentAvatar = userProfile?.image ?? null;

    const newEvent = {
      username: currentUsername,
      avatarUrl: currentAvatar, // 存入 Emoji 或 URL
      restaurantName,
      meetPoint,
      scheduleTime,
      mood,
      message,
      meetPointCoordinates: { latitude: 36.00162, longitude: -78.93963 },
      restaurantCoordinates: { latitude: 36.01126, longitude: -78.92182 },
    };

    console.log("Creating Event:", newEvent);

    Alert.alert("Success", "Event created successfully!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <AnimatedPageFrame
      baseColor={baseColor}
      headerTitle="Create Event"
      enableReturnButton={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <EmptySpace marginTop={20} />

        <View style={styles.formContainer}>
          {/* Restaurant Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Restaurant Name</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g. RING"
              placeholderTextColor="#9CA3AF"
              value={restaurantName}
              onChangeText={setRestaurantName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Meeting Point</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g. Tsuki no mori Girls' School"
              placeholderTextColor="#9CA3AF"
              value={meetPoint}
              onChangeText={setMeetPoint}
            />
          </View>

          {/* Schedule Time Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Schedule Time</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g. 12:20"
              placeholderTextColor="#9CA3AF"
              value={scheduleTime}
              onChangeText={setScheduleTime}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mood (Emoji)</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g. 🤓"
              placeholderTextColor="#9CA3AF"
              value={mood}
              onChangeText={setMood}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Say something to your mates..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <EmptySpace marginTop={20} />

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
            ]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Create Event</Text>
          </Pressable>

          <EmptySpace marginTop={40} />
        </View>
      </KeyboardAvoidingView>
    </AnimatedPageFrame>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151", // Gray-700
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937", // Gray-800
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: "#000000",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
