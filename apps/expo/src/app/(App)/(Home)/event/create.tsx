import { useState } from "react";
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

import AnimatedPageFrame from "../../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../../components/frame/EmptySpace";
// 1. 引入 useDukeAuth
import { useDukeAuth } from "../../../../hooks/useDukeAuth";

export default function CreateEventPage() {
  const router = useRouter();
  // 2. 获取用户信息
  const { userInfo } = useDukeAuth();

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

    // 3. 使用真实用户信息
    // 注意：userInfo 可能为空，建议处理这种情况，或者使用 "Anonymous" 作为回退
    const currentUsername = userInfo?.name ?? "Anonymous User";
    // 如果 userInfo 里有头像字段，也可以在这里获取，例如: userInfo?.picture
    // const currentAvatarUrl = userInfo?.picture; 

    const newEvent = {
      username: currentUsername,
      restaurantName,
      meetPoint,
      scheduleTime,
      mood,
      message,
      meetPointCoordinates: { latitude: 36.00162, longitude: -78.93963 }, 
      restaurantCoordinates: { latitude: 36.01126, longitude: -78.92182 },
      // 如果 Schema 中有 avatarUrl，也可以加上
      // avatarUrl: currentAvatarUrl,
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
