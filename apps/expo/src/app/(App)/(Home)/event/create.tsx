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
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { AppleMaps, GoogleMaps } from "expo-maps";

import type { RouterInputs, RouterOutputs } from "~/utils/api";
import { trpcClient } from "~/utils/api";
import { getStoredUserId } from "~/utils/user-storage";
import AnimatedPageFrame from "../../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../../components/frame/EmptySpace";

type UserProfile = RouterOutputs["user"]["byId"];
type CreateEventInput = RouterInputs["event"]["create"];

type SearchResult = Location.LocationGeocodedLocation & {
  formattedAddress?: string;
  placeId?: string;
};

interface GooglePlacesAutocompleteResult {
  predictions: {
    description: string;
    place_id: string;
  }[];
}

interface GooglePlaceDetailsResult {
  result?: {
    geometry?: {
      location?: {
        lat: number;
        lng: number;
      };
    };
  };
}

export default function CreateEventPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [storedUserId, setStoredUserId] = useState<string | null>(null);

  useEffect(() => {
    void getStoredUserId().then(setStoredUserId).catch(console.error);
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
  // Change state type to include address info
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [restaurantCoordinates, setRestaurantCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 36.0014,
    longitude: -78.9382,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Function to handle text input and search
  const handleRestaurantNameChange = async (text: string) => {
    setRestaurantName(text);
    
    if (text.length > 2) {
      try {
        setIsSearching(true);
        
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error("Google Maps API Key is missing");
            return;
        }

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${apiKey}&types=establishment|geocode`,
          {
            headers: {
              "User-Agent": "MealMatesApp/1.0" 
            }
          }
        );
        
        if (!response.ok) {
             throw new Error("Network response was not ok");
        }

        const data = (await response.json()) as GooglePlacesAutocompleteResult;

        // Map Google Places results to our format
        // Note: Auto-complete doesn't give lat/lon, so we set them to 0 initially
        // We'll fetch the actual coordinates when the user selects a result.
        const results: SearchResult[] = data.predictions.map((item) => ({
             latitude: 0, 
             longitude: 0,
             formattedAddress: item.description,
             placeId: item.place_id
        }));

        setSearchResults(results); 
      } catch (e) {
        console.log("Autocomplete error (maybe no results):", e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectSearchResult = async (location: SearchResult) => {
    // 1. Hide results
    setSearchResults([]);
    setRestaurantName(location.formattedAddress ?? "");

    // 2. If we have a placeId, fetch the details to get coordinates
    if (location.placeId) {
        try {
            setIsSearching(true);
            const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${location.placeId}&fields=geometry&key=${apiKey}`
            );
            
            if (!response.ok) throw new Error("Failed to fetch place details");
            
            const data = (await response.json()) as GooglePlaceDetailsResult;
            
            if (data.result?.geometry?.location) {
                const { lat, lng } = data.result.geometry.location;
                
                // Update map region to selected location
                setMapRegion({
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });
                
                // Update the coordinates immediately
                setRestaurantCoordinates({
                    latitude: lat,
                    longitude: lng
                });
                
                // 3. Open the map picker
                setShowMapPicker(true);
            }
        } catch (e) {
            console.error("Error fetching place details:", e);
            Alert.alert("Error", "Could not fetch location details.");
        } finally {
            setIsSearching(false);
        }
    } else {
        // Fallback for existing behavior if no placeId (shouldn't happen with Google Places)
        setMapRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        });
        
        setRestaurantCoordinates({
            latitude: location.latitude,
            longitude: location.longitude
        });

        setShowMapPicker(true);
    }
  };

  // Initialize location for map
  useEffect(() => {
    void (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === Location.PermissionStatus.GRANTED) {
        const location = await Location.getCurrentPositionAsync({});
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        // Remove the following block so we don't auto-set the pin
        // if (!restaurantCoordinates) {
        //    setRestaurantCoordinates({
        //      latitude: location.coords.latitude,
        //      longitude: location.coords.longitude
        //    });
        // }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [scheduleTime, setScheduleTime] = useState("");
  
  // Add state for the Date picker
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [mood, setMood] = useState("");
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const baseColor = "255,120,0";

  const EMOJI_LIST = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "🥹",
    "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘",
    "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐",
    "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟",
    "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭",
    "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨",
    "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🫢", "🫡", "🤫",
    "🫠", "🤥", "😶", "🫥", "😐", "😑", "😬", "🙄", "😯", "😦",
    "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "😵‍💫", "🤐",
    "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "😈","👋", 
    "✌️", "🤞", "🤟", "🤘", "🤙", "👍", "👎", "👊", "🙌", "❤️", 
    "💔", "🔥", "✨", "🌟", "💯", "💢", "💥", "💤", "🎉"
  ];

  const handleSelectEmoji = (emoji: string) => {
    setMood(emoji);
    setShowEmojiPicker(false);
  };

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

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    const currentDate = selectedDate ?? date;
    
    // On Android, the picker closes automatically after selection
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    setDate(currentDate);

    // Format the date nicely for the 'scheduleTime' string (e.g., "Mon, Nov 23 - 12:20 PM")
    // Change formatting to only show time, e.g., "12:20 PM"
    const formattedTime = currentDate.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    setScheduleTime(formattedTime);
  };

  const handleConfirmLocation = () => {
    setShowMapPicker(false);
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

    if (!restaurantCoordinates) {
      Alert.alert("Missing Location", "Please select a location on the map.");
      return;
    }

    const currentUsername = userProfile?.name ?? "Anonymous";
    
    const currentAvatar = userProfile?.image ?? null;
    const currentAvatarColor = userProfile?.avatarColor ?? "#F5F7FB";

    const newEvent: CreateEventInput = {
      userId: storedUserId,
      username: currentUsername,
      avatarUrl: currentAvatar,
      avatarColor: currentAvatarColor,
      restaurantName,
      scheduleTime,
      mood: mood || undefined,
      message: message || undefined,
      restaurantCoordinates: restaurantCoordinates,
      meetPointCoordinates: restaurantCoordinates,
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
      {/* Map Picker Modal */}
      <Modal
        visible={showMapPicker}
        animationType="slide"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.mapHeader}>
             <Text style={styles.mapTitle}>Drag to Select Location</Text>
             <TouchableOpacity onPress={() => setShowMapPicker(false)} style={styles.closeButton}>
                <Text style={{color: "white", fontWeight: "bold"}}>Close</Text>
             </TouchableOpacity>
          </View>
          
          <View style={{ flex: 1 }}>
              {Platform.OS === "ios" ? (
                <AppleMaps.View
                  style={{ flex: 1 }}
                  cameraPosition={{
                    coordinates: {
                        latitude: mapRegion.latitude,
                        longitude: mapRegion.longitude
                    },
                    zoom: 15
                  }}
                  properties={{
                    isMyLocationEnabled: true
                  }}
                  onCameraMove={(e) => {
                    const { latitude, longitude } = e.coordinates;
                    if (latitude !== undefined && longitude !== undefined) {
                         // Update the pin location data
                         setRestaurantCoordinates({ latitude, longitude });
                         
                         // Sync the map region state so it doesn't snap back on re-render
                         setMapRegion(prev => ({
                             ...prev,
                             latitude,
                             longitude
                         }));
                    }
                  }}
                />
              ) : (
                <GoogleMaps.View
                  style={{ flex: 1 }}
                  cameraPosition={{
                     coordinates: {
                        latitude: mapRegion.latitude,
                        longitude: mapRegion.longitude
                    },
                    zoom: 15
                  }}
                  properties={{
                    isMyLocationEnabled: true
                  }}
                  onCameraMove={(e) => {
                    const { latitude, longitude } = e.coordinates;
                    if (latitude !== undefined && longitude !== undefined) {
                        setRestaurantCoordinates({ latitude, longitude });
                        setMapRegion(prev => ({
                            ...prev,
                            latitude,
                            longitude
                        }));
                    }
                  }}
                />
              )}
              
              {/* Center Pin */}
              <View style={styles.centerMarker} pointerEvents="none">
                <Text style={{fontSize: 40}}>📍</Text>
              </View>

              <Pressable style={styles.confirmLocationButton} onPress={handleConfirmLocation}>
                 <Text style={styles.confirmLocationText}>Confirm Location</Text>
              </Pressable>
          </View>
        </View>
      </Modal>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <Pressable 
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} 
            onPress={() => setShowEmojiPicker(false)}
        >
            <View style={styles.emojiPickerContainer}>
                <View style={styles.emojiPickerHeader}>
                    <Text style={styles.emojiPickerTitle}>Select Mood</Text>
                    <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                        <Text style={{ color: "#6B7280", fontSize: 16 }}>Close</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={EMOJI_LIST}
                    numColumns={7}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.emojiItem}
                            onPress={() => handleSelectEmoji(item)}
                        >
                            <Text style={{ fontSize: 30 }}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Pressable>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <EmptySpace marginTop={20} />

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Restaurant Name</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, zIndex: 10 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="E.g. RING or search address..."
                  placeholderTextColor="#9CA3AF"
                  value={restaurantName}
                  onChangeText={handleRestaurantNameChange}
                />
                {isSearching && <ActivityIndicator size="small" color="#000" />}
            </View>

            {/* Search Results Dropdown */}
            {/* If we have results, show them */}
            {searchResults.length > 0 && (
              <View style={styles.searchResultsContainer}>
                {searchResults.map((result, index) => (
                  <TouchableOpacity 
                    key={`${result.latitude}-${index}`}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectSearchResult(result)}
                  >
                    <Text style={styles.searchResultText}>
                      {result.formattedAddress ?? "Unknown Location"}
                    </Text>
                    <Text style={{fontSize: 10, color: "gray"}}>Tap to select and pin on map</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* If no results but text exists, suggest opening map */}
            {searchResults.length === 0 && restaurantName.length > 2 && !restaurantCoordinates && (
                 <View style={styles.searchResultsContainer}>
                    <TouchableOpacity 
                        style={styles.searchResultItem}
                        onPress={() => setShowMapPicker(true)}
                    >
                        <Text style={styles.searchResultText}>
                            🗺️ Pin "{restaurantName}" on Map
                        </Text>
                        <Text style={{fontSize: 10, color: "gray"}}>Cannot find address? Select manually.</Text>
                    </TouchableOpacity>
                 </View>
            )}

            {restaurantCoordinates ? (
                <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 4, marginLeft: 4 }}>
                    📍 Location set: {restaurantCoordinates.latitude.toFixed(4)}, {restaurantCoordinates.longitude.toFixed(4)}
                </Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Schedule Time</Text>
            {/* Replace TextInput with a Pressable that toggles the picker */}
            <Pressable 
              onPress={() => setShowPicker(!showPicker)}
              style={styles.input}
            >
              <Text style={{ color: scheduleTime ? "#1F2937" : "#9CA3AF", fontSize: 16 }}>
                {scheduleTime || "Select Time"}
              </Text>
            </Pressable>

            {/* iOS: Show Spinner Inline when expanded */}
            {showPicker && Platform.OS === "ios" && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="time"
                display="spinner"
                onChange={handleDateChange}
                style={{ height: 120, marginTop: 10 }}
                minimumDate={new Date()} // Prevent selecting past times
              />
            )}

            {/* Android: Show Modal (only when showPicker is true) */}
            {showPicker && Platform.OS === "android" && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="time" 
                is24Hour={false}
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()} // Prevent selecting past times
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mood (Emoji)</Text>
            <Pressable
              style={styles.input}
              onPress={() => setShowEmojiPicker(true)}
            >
               <Text style={{ color: mood ? "#1F2937" : "#9CA3AF", fontSize: 24 }}>
                  {mood || "Select Emoji"}
               </Text>
            </Pressable>
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
  mapButton: {
    backgroundColor: "#255,120,0", 
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultsContainer: {
    position: "absolute",
    top: 85, // Adjust based on input height + label
    left: 0,
    right: 0, // Changed from 60 to 0 to fill the space
    backgroundColor: "white",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100, // Ensure it floats above other elements
  },
  searchResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  searchResultText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 2,
  },
  mapHeader: {
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
      backgroundColor: "black",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
  },
  mapTitle: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
  },
  closeButton: {
      padding: 8,
  },
  centerMarker: {
    position: "absolute",
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -35, // Offset for pin visual
  },
  confirmLocationButton: {
      position: "absolute",
      bottom: 50,
      alignSelf: "center",
      backgroundColor: "black",
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 30,
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
  },
  confirmLocationText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
  },
  emojiPickerContainer: {
    marginTop: 'auto',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '50%',
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  emojiPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  emojiItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    margin: 5,
  },
});
