import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { RouterInputs, RouterOutputs } from "~/utils/api";
import { trpcClient } from "~/utils/api";
import { getStoredUserId } from "~/utils/user-storage";
import AnimatedPageFrame from "../../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../../components/frame/EmptySpace";

type UserProfile = RouterOutputs["user"]["byId"];
type CreateEventInput = RouterInputs["event"]["create"];

export default function CreateEventPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [storedUserId, setStoredUserId] = useState<string | null>(null);

  useEffect(() => {
    getStoredUserId().then(setStoredUserId).catch(console.error);
  }, []);

  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ["userProfile", storedUserId],
    enabled: !!storedUserId,
    queryFn: async () => {
      if (!storedUserId) throw new Error("No user ID");
      return trpcClient.user.byId.query({ id: storedUserId });
    },
  });

  const [restaurantName, setRestaurantName] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  
  // Add state for the Date picker
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [mood, setMood] = useState("");
  const [message, setMessage] = useState("");

  const baseColor = "255,120,0";

  const createEventMutation = useMutation({
    mutationFn: (input: CreateEventInput) => { 
      return trpcClient.event.create.mutate(input);
    },
    onSuccess: () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      queryClient.invalidateQueries({ queryKey: ["event", "all"] });

      Alert.alert("Success", "Event created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      console.error("Failed to create event:", error);
      Alert.alert("Error", "Failed to create event. Please try again.");
    },
  });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    
    // On Android, the picker closes automatically after selection
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    setDate(currentDate);

    // Format the date nicely for the 'scheduleTime' string (e.g., "Mon, Nov 23 - 12:20 PM")
    const formattedDate = currentDate.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    setScheduleTime(formattedDate);
  };

  const handleSubmit = () => {
    if (!storedUserId) {
      Alert.alert("Error", "You must be logged in to create an event.");
      return;
    }

    if (!restaurantName || !scheduleTime) {
      Alert.alert("Missing Info", "Please fill in the required fields.");
      return;
    }

    const currentUsername = userProfile?.name ?? "Anonymous";
    
    const currentAvatar = userProfile?.image ?? null;
    const currentAvatarColor = userProfile?.avatarColor ?? "#F5F7FB";

    const newEvent: CreateEventInput = {
      username: currentUsername,
      avatarUrl: currentAvatar,
      avatarColor: currentAvatarColor,
      restaurantName,
      scheduleTime,
      mood: mood || undefined,
      message: message || undefined,
      // TODO: Replace with real map picker
      restaurantCoordinates: { latitude: 36.01126, longitude: -78.92182 },
    };

    console.log("Creating Event:", newEvent);

    createEventMutation.mutate(newEvent);
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
            <Text style={styles.label}>Schedule Time</Text>
            {/* Replace TextInput with a Pressable that toggles the picker */}
            <Pressable 
              onPress={() => setShowPicker(!showPicker)}
              style={styles.input}
            >
              <Text style={{ color: scheduleTime ? "#1F2937" : "#9CA3AF", fontSize: 16 }}>
                {scheduleTime || "Select Date & Time"}
              </Text>
            </Pressable>

            {/* iOS: Show Spinner Inline when expanded */}
            {showPicker && Platform.OS === "ios" && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="datetime"
                is24Hour={true}
                display="spinner"
                onChange={handleDateChange}
                style={{ height: 120, marginTop: 10 }}
              />
            )}

            {/* Android: Show Modal (only when showPicker is true) */}
            {showPicker && Platform.OS === "android" && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date" 
                is24Hour={true}
                display="default"
                onChange={handleDateChange}
              />
            )}
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
            disabled={createEventMutation.isPending}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
              createEventMutation.isPending && { opacity: 0.7 } 
            ]}
            onPress={handleSubmit}
          >
            {createEventMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create Event</Text>
            )}
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
