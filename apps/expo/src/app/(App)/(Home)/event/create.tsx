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

export default function CreateEventPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [description, setDescription] = useState("");

  const baseColor = "255,120,0";

  const handleSubmit = () => {
    if (!title || !location || !time) {
      Alert.alert("Missing Info", "Please fill in the required fields.");
      return;
    }

    console.log("Creating Event:", {
      title,
      location,
      time,
      maxParticipants,
      description,
    });

    // Mock success and go back
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
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Title</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., Lunch at Pitchforks"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Location Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Where are you meeting?"
              placeholderTextColor="#9CA3AF"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Time Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              placeholder="When? (e.g. Today 12:00 PM)"
              placeholderTextColor="#9CA3AF"
              value={time}
              onChangeText={setTime}
            />
          </View>

          {/* Max Participants Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Participants</Text>
            <TextInput
              style={styles.input}
              placeholder="Max people (e.g. 4)"
              placeholderTextColor="#9CA3AF"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="numeric"
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any details? (e.g. specific topic, casual chat)"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <EmptySpace marginTop={20} />

          {/* Submit Button */}
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
