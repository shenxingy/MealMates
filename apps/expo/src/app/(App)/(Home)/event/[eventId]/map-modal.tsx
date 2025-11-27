import type {
  AppleMapsMarker,
  AppleMapsViewType,
} from "expo-maps/build/apple/AppleMaps.types";
import type {
  GoogleMapsMarker,
  GoogleMapsViewType,
} from "expo-maps/build/google/GoogleMaps.types";
import type { Coordinates } from "expo-maps/src/shared.types";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Linking, Platform, StyleSheet } from "react-native";
import * as Location from "expo-location";
import {
  AppleMaps,
  getPermissionsAsync,
  GoogleMaps,
  requestPermissionsAsync,
} from "expo-maps";
import { useLocalSearchParams, useRouter } from "expo-router";

import type { LocationUpdatePayload } from "~/definition";
import { useApiSocket } from "~/hooks/useApiSocket";
import { calculateCenterCoordinates, calculateZoomLevel } from "~/utils/map";
import { getStoredUserId } from "~/utils/user-storage";
import { excludingPointsOfInterest } from "../../../../../../components/eventpage/MiniMap";
import SymbolButton from "../../../../../../components/frame/SymbolButton";

const LOCATION_UPDATE_INTERVAL =
  process.env.EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL;

export default function MapModalPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [userId, setUserId] = useState<string>("");
  const eventId = params.eventId as string;
  const shared = params.shared === "true";

  const restaurantName = params.restaurantName as string;
  const restaurantLatitude = params.restaurantLatitude
    ? parseFloat(params.restaurantLatitude as string)
    : null;
  const restaurantLongitude = params.restaurantLongitude
    ? parseFloat(params.restaurantLongitude as string)
    : null;
  const restaurantCoord: Coordinates | null = useMemo(
    () =>
      restaurantLatitude !== null && restaurantLongitude !== null
        ? {
            latitude: restaurantLatitude,
            longitude: restaurantLongitude,
          }
        : null,
    [restaurantLatitude, restaurantLongitude],
  );

  // get userId from storage
  useEffect(() => {
    const loadUserId = async () => {
      const storedId = await getStoredUserId();
      if (storedId) {
        setUserId(storedId);
      }
    };
    void loadUserId();
  }, []);

  // State to track user locations from WebSocket
  const [userLocations, setUserLocations] = useState<
    Map<string, LocationUpdatePayload>
  >(new Map());

  // WebSocket
  const { shareLocation, leaveEvent, isConnected } = useApiSocket({
    userId: userId,
    eventId: eventId,
    enabled: shared,
    handlers: {
      onJoinSuccess: (payload) => {
        console.log("[MapModal] Successfully joined event:", payload);
      },
      onLocationUpdate: (payload) => {
        console.log("[MapModal] Received location update:", payload);
        if (payload.userId === userId) {
          return;
        }

        // Update user location
        setUserLocations((prev) => {
          const newMap = new Map(prev);
          newMap.set(payload.userId, payload);
          return newMap;
        });
      },
      onUserLeft: (payload) => {
        console.log("[MapModal] User left:", payload);

        // Remove user location marker
        setUserLocations((prev) => {
          const newMap = new Map(prev);
          newMap.delete(payload.userId);
          return newMap;
        });
      },
      onError: (payload) => {
        console.error("[MapModal] WebSocket error:", payload);
      },
    },
  });

  // compute marker lists
  const appleMarkerList = useMemo(() => {
    const markers: AppleMapsMarker[] = [];

    if (restaurantCoord) {
      markers.push({
        coordinates: restaurantCoord,
        title: restaurantName,
        systemImage: "flag.fill",
        id: "restaurant",
      });
    }

    // Add user location markers
    userLocations.forEach((location, uid) => {
      markers.push({
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        title: `User ${uid.slice(0, 8)}`, // Show first 8 chars of userId
        systemImage: "person.fill",
        id: `user-${uid}`,
      });
    });

    return markers;
  }, [restaurantCoord, restaurantName, userLocations]);

  const googleMarkerList = useMemo(() => {
    const markers: GoogleMapsMarker[] = [];

    // Add restaurant marker if available
    if (restaurantCoord) {
      markers.push({
        coordinates: restaurantCoord,
        title: restaurantName,
      });
    }

    // Add user location markers from WebSocket
    userLocations.forEach((location, uid) => {
      markers.push({
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        title: `User ${uid.slice(0, 8)}`,
      });
    });

    return markers;
  }, [restaurantCoord, restaurantName, userLocations]);

  const [locationPerm, setLocationPerm] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [restaurantView, setRestaurantView] = useState(0);

  // console.log("Map Modal Params:", params);

  // close websocket when unmounting
  useEffect(() => {
    return () => {
      if (shared && isConnected) {
        console.log("[MapModal] Component unmounting, leaving event");
        leaveEvent();
      }
    };
  }, [shared, isConnected, leaveEvent]);

  const handleDismiss = () => {
    if (shared && isConnected) {
      leaveEvent();
    }
    router.back();
  };

  const alartLocationPerm = () => {
    Alert.alert(
      "Location Permission Required",
      "To share your location with your mates, please enable location access in Settings.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setLocationPerm(false),
        },
        {
          text: "Open Settings",
          onPress: () => {
            void Linking.openSettings();
            setLocationPerm(false);
          },
        },
      ],
    );
  };

  // Request location permission
  useEffect(() => {
    const requestPermission = async () => {
      const status = await getPermissionsAsync();
      console.log("Location permission status:", status);

      if (status.granted) {
        setLocationPerm(true);
        return;
      }
      if (!status.canAskAgain) {
        if (shared) {
          alartLocationPerm();
        }
        return;
      }

      // Request permission if not granted yet
      const newStatus = await requestPermissionsAsync();
      setLocationPerm(newStatus.granted);

      if (!newStatus.granted && !newStatus.canAskAgain) {
        console.log("Permission denied by user");
        if (shared) {
          alartLocationPerm();
        }
      }
    };
    void requestPermission();
  }, [shared]);

  const locationUpdateIntervalMs = LOCATION_UPDATE_INTERVAL
    ? Number(LOCATION_UPDATE_INTERVAL)
    : 30000; // 30 seconds

  // Update location every 30 seconds when permission is granted
  // If sharing is enabled and connected, also share the location
  useEffect(() => {
    if (!locationPerm) {
      return;
    }

    const updateLocation = async () => {
      try {
        const newLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // Balance between accuracy and battery
        });
        setCurrentLocation(newLocation);
        console.log("[MapModal] Location updated:", {
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
        });

        // Share location if sharing is enabled and connected
        if (shared && isConnected) {
          shareLocation(
            newLocation.coords.latitude,
            newLocation.coords.longitude,
          );
          console.log("[MapModal] Location shared with event participants");
        }
      } catch (error) {
        console.error("[MapModal] Failed to get location:", error);
      }
    };

    // Get location immediately
    void updateLocation();

    // Set up interval to update location every 30 seconds
    const locationInterval = setInterval(() => {
      void updateLocation();
    }, locationUpdateIntervalMs);

    return () => {
      clearInterval(locationInterval);
    };
  }, [
    locationPerm,
    shared,
    isConnected,
    shareLocation,
    locationUpdateIntervalMs,
  ]);

  const appleMap = useRef<AppleMapsViewType>(null);
  const googleMap = useRef<GoogleMapsViewType>(null);

  const handleCameraToMyLocation = () => {
    console.log(
      "locationPerm & currentLocation:",
      locationPerm,
      currentLocation,
    );
    if (currentLocation) {
      const currentCoord = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      if (Platform.OS === "ios") {
        appleMap.current?.setCameraPosition({
          coordinates: currentCoord,
          zoom: calculateZoomLevel([currentCoord]),
        });
      }
      if (Platform.OS === "android") {
        googleMap.current?.setCameraPosition({
          coordinates: currentCoord,
          zoom: calculateZoomLevel([currentCoord]),
        });
      }
      setRestaurantView(0);
    } else if (!locationPerm) {
      alartLocationPerm();
    }
  };

  const handleCameraToRestaurant = () => {
    if (restaurantCoord) {
      if (restaurantView === 0) {
        if (Platform.OS === "ios") {
          appleMap.current?.setCameraPosition({
            coordinates: restaurantCoord,
            zoom: calculateZoomLevel([restaurantCoord]),
          });
        }
        if (Platform.OS === "android") {
          googleMap.current?.setCameraPosition({
            coordinates: restaurantCoord,
            zoom: calculateZoomLevel([restaurantCoord]),
          });
        }
        setRestaurantView(1);
      } else if (restaurantView === 1 && locationPerm && currentLocation) {
        const currentCoord = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
        const centerCoord = calculateCenterCoordinates([
          restaurantCoord,
          currentCoord,
        ]);
        if (centerCoord && Platform.OS === "ios") {
          appleMap.current?.setCameraPosition({
            coordinates: centerCoord,
            zoom: calculateZoomLevel([restaurantCoord, currentCoord]),
          });
        }
        if (centerCoord && Platform.OS === "android") {
          googleMap.current?.setCameraPosition({
            coordinates: centerCoord,
            zoom: calculateZoomLevel([restaurantCoord, currentCoord]),
          });
        }
        setRestaurantView(0);
      } else {
        // Toggle back to restaurant only if no location or already viewing both
        if (Platform.OS === "ios") {
          appleMap.current?.setCameraPosition({
            coordinates: restaurantCoord,
            zoom: calculateZoomLevel([restaurantCoord]),
          });
        }
        if (Platform.OS === "android") {
          googleMap.current?.setCameraPosition({
            coordinates: restaurantCoord,
            zoom: calculateZoomLevel([restaurantCoord]),
          });
        }
        setRestaurantView(1);
      }
    }
  };

  // Initial camera position: Restaurant if available, else default
  const initialCameraPosition = restaurantCoord
    ? {
        coordinates: restaurantCoord,
        zoom: calculateZoomLevel([restaurantCoord]),
      }
    : undefined;

  return (
    <>
      <SymbolButton
        onPress={handleDismiss}
        pressableStyle={styles.dismissButtonContainer}
        androidStyle={styles.dismissButtonAndroidContainer}
        glassViewStyle={styles.dismissButtonGlassView}
        SFSymbolName="xmark"
        MaterialSymbolName="close"
      />
      <SymbolButton
        onPress={handleCameraToMyLocation}
        pressableStyle={styles.myLocationContainer}
        androidStyle={styles.myLocationAndroidContainer}
        glassViewStyle={styles.myLocationGlassView}
        SFSymbolName="location"
        MaterialSymbolName="my-location"
      />
      {/* Removed Meet Point Button */}
      {restaurantCoord && (
        <SymbolButton
          onPress={handleCameraToRestaurant}
          pressableStyle={styles.restaurantButtonContainer}
          androidStyle={styles.restaurantAndroidContainer}
          glassViewStyle={styles.restaurantGlassView}
          SFSymbolName="fork.knife"
          MaterialSymbolName="restaurant"
        />
      )}
      {Platform.OS === "ios" ? (
        <AppleMaps.View
          style={{ flex: 1 }}
          cameraPosition={initialCameraPosition}
          markers={appleMarkerList}
          uiSettings={{
            myLocationButtonEnabled: false,
            togglePitchEnabled: false,
            compassEnabled: false,
          }}
          properties={{
            isMyLocationEnabled: locationPerm,
            pointsOfInterest: {
              excluding: excludingPointsOfInterest,
            },
          }}
          ref={appleMap}
        />
      ) : (
        <GoogleMaps.View
          style={{ flex: 1 }}
          cameraPosition={initialCameraPosition}
          markers={googleMarkerList}
          uiSettings={{
            myLocationButtonEnabled: false,
            togglePitchEnabled: false,
            compassEnabled: false,
          }}
          properties={{
            isMyLocationEnabled: locationPerm,
          }}
          ref={googleMap}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  dismissButtonContainer: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 1,
  },
  dismissButtonAndroidContainer: {
    position: "absolute",
    top: 75,
    left: 15,
    zIndex: 1,
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    elevation: 5,
  },
  dismissButtonGlassView: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  myLocationContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
  },
  myLocationAndroidContainer: {
    position: "absolute",
    top: 75,
    right: 15,
    zIndex: 1,
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    elevation: 5,
  },
  myLocationGlassView: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  // Removed Meet Point styles
  restaurantButtonContainer: {
    position: "absolute",
    top: 75, // Moved up since meet point button is gone
    right: 15,
    zIndex: 1,
  },
  restaurantAndroidContainer: {
    position: "absolute",
    top: 135, // Adjusted for Android status bar
    right: 15,
    zIndex: 1,
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    elevation: 5,
  },
  restaurantGlassView: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});
