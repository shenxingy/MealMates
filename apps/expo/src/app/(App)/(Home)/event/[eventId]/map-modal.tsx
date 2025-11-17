import type {
  AppleMapsMarker,
  AppleMapsViewType,
} from "expo-maps/build/apple/AppleMaps.types";
import type {
  GoogleMapsMarker,
  GoogleMapsViewType,
} from "expo-maps/build/google/GoogleMaps.types";
import type { Coordinates } from "expo-maps/src/shared.types";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking, Platform, StyleSheet } from "react-native";
import * as Location from "expo-location";
import {
  AppleMaps,
  getPermissionsAsync,
  GoogleMaps,
  requestPermissionsAsync,
} from "expo-maps";
import { AppleMapPointOfInterestCategory } from "expo-maps/build/apple/AppleMaps.types";
import { useLocalSearchParams, useRouter } from "expo-router";

import { calculateCenterCoordinates, calculateZoomLevel } from "~/utils/map";
import { getStoredUserId } from "~/utils/user-storage";
import { useApiSocket } from "~/hooks/useApiSocket";
import SymbolButton from "../../../../../../components/frame/SymbolButton";

export default function MapModalPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [userId, setUserId] = useState<string>("");
  const eventId = params.eventId as string;
  const shared = params.shared === "true";
  const meetPoint = params.meetPoint as string;
  const meetPointLatitude = parseFloat(params.meetPointLatitude as string);
  const meetPointLongitude = parseFloat(params.meetPointLongitude as string);
  const meetPointCoord: Coordinates = {
    latitude: meetPointLatitude,
    longitude: meetPointLongitude,
  };
  const restaurantName = params.restaurantName as string;
  const restaurantLatitude = params.restaurantLatitude
    ? parseFloat(params.restaurantLatitude as string)
    : null;
  const restaurantLongitude = params.restaurantLongitude
    ? parseFloat(params.restaurantLongitude as string)
    : null;
  const restaurantCoord: Coordinates | null =
    restaurantLatitude !== null && restaurantLongitude !== null
      ? {
          latitude: restaurantLatitude,
          longitude: restaurantLongitude,
        }
      : null;

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

  // WebSocket
  const { shareLocation: _shareLocation, leaveEvent, isConnected } = useApiSocket({
    userId: userId,
    eventId: eventId,
    enabled: shared,
    handlers: {
      onJoinSuccess: (payload) => {
        console.log('[MapModal] Successfully joined event:', payload);
      },
      onLocationUpdate: (payload) => {
        console.log('[MapModal] Received location update:', payload);
        // TODO: update marker on map
      },
      onUserLeft: (payload) => {
        console.log('[MapModal] User left:', payload);
      },
      onError: (payload) => {
        console.error('[MapModal] WebSocket error:', payload);
      },
    },
  });

  const appleMarkerList: AppleMapsMarker[] = [
    {
      coordinates: meetPointCoord,
      title: meetPoint,
    },
    ...(restaurantCoord
      ? [
          {
            coordinates: restaurantCoord,
            title: restaurantName,
          },
        ]
      : []),
  ];
  const googleMarkerList: GoogleMapsMarker[] = [
    {
      coordinates: meetPointCoord,
      title: meetPoint,
    },
    ...(restaurantCoord
      ? [
          {
            coordinates: restaurantCoord,
            title: restaurantName,
          },
        ]
      : []),
  ];

  const [locationPerm, setLocationPerm] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [meetPointView, setMeetPointView] = useState(0);
  const [restaurantView, setRestaurantView] = useState(0);

  // console.log("Map Modal Params:", params);

  // close websocket when unmounting
  useEffect(() => {
    return () => {
      if (shared && isConnected) {
        console.log('[MapModal] Component unmounting, leaving event');
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

  useEffect(() => {
    const requestPermissionAndLocation = async () => {
      const getCurrentLocation = async () => {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setCurrentLocation(currentLocation);
      };

      const status = await getPermissionsAsync();
      console.log("Location permission status:", status);

      if (status.granted) {
        setLocationPerm(true);
        await getCurrentLocation();
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
      if (newStatus.granted) {
        await getCurrentLocation();
      }
    };
    void requestPermissionAndLocation();
  }, [shared]);

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
      setMeetPointView(0);
      setRestaurantView(0);
    } else if (!locationPerm) {
      alartLocationPerm();
    }
  };

  const handleCameraToMeetPoint = () => {
    if (locationPerm && currentLocation) {
      const currentCoord = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      const centerCoord = calculateCenterCoordinates([
        currentCoord,
        meetPointCoord,
      ]);
      if (meetPointView) {
        if (centerCoord && Platform.OS === "ios") {
          appleMap.current?.setCameraPosition({
            coordinates: centerCoord,
            zoom: calculateZoomLevel([currentCoord, meetPointCoord]),
          });
        }
        if (centerCoord && Platform.OS === "android") {
          googleMap.current?.setCameraPosition({
            coordinates: centerCoord,
            zoom: calculateZoomLevel([currentCoord, meetPointCoord]),
          });
        }
      } else {
        if (Platform.OS === "ios") {
          appleMap.current?.setCameraPosition({
            coordinates: meetPointCoord,
            zoom: calculateZoomLevel([meetPointCoord]),
          });
        }
        if (Platform.OS === "android") {
          googleMap.current?.setCameraPosition({
            coordinates: meetPointCoord,
            zoom: calculateZoomLevel([meetPointCoord]),
          });
        }
      }
      setMeetPointView(1 - meetPointView);
      setRestaurantView(0);
    } else {
      if (Platform.OS === "ios") {
        appleMap.current?.setCameraPosition({
          coordinates: meetPointCoord,
          zoom: calculateZoomLevel([meetPointCoord]),
        });
      }
      if (Platform.OS === "android") {
        googleMap.current?.setCameraPosition({
          coordinates: meetPointCoord,
          zoom: calculateZoomLevel([meetPointCoord]),
        });
      }
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
        setMeetPointView(0);
      } else if (restaurantView === 1) {
        const centerCoord = calculateCenterCoordinates([
          meetPointCoord,
          restaurantCoord,
        ]);
        if (centerCoord && Platform.OS === "ios") {
          appleMap.current?.setCameraPosition({
            coordinates: centerCoord,
            zoom: calculateZoomLevel([meetPointCoord, restaurantCoord]),
          });
        }
        if (centerCoord && Platform.OS === "android") {
          googleMap.current?.setCameraPosition({
            coordinates: centerCoord,
            zoom: calculateZoomLevel([meetPointCoord, restaurantCoord]),
          });
        }
        if (locationPerm && currentLocation) {
          setRestaurantView(2);
        } else {
          setRestaurantView(0);
        }
        setMeetPointView(0);
      } else if (restaurantView === 2 && locationPerm && currentLocation) {
        const currentCoord = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
        const centerCoord = calculateCenterCoordinates([
          meetPointCoord,
          restaurantCoord,
          currentCoord,
        ]);
        if (centerCoord && Platform.OS === "ios") {
          appleMap.current?.setCameraPosition({
            coordinates: centerCoord,
            zoom: calculateZoomLevel([
              meetPointCoord,
              restaurantCoord,
              currentCoord,
            ]),
          });
        }
        if (centerCoord && Platform.OS === "android") {
          googleMap.current?.setCameraPosition({
            coordinates: centerCoord,
            zoom: calculateZoomLevel([
              meetPointCoord,
              restaurantCoord,
              currentCoord,
            ]),
          });
        }
        setRestaurantView(0);
        setMeetPointView(0);
      }
    }
  };

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
      <SymbolButton
        onPress={handleCameraToMeetPoint}
        pressableStyle={styles.meetPointButtonContainer}
        androidStyle={styles.meetPointAndroidContainer}
        glassViewStyle={styles.meetPointGlassView}
        SFSymbolName="flag"
        MaterialSymbolName="flag"
      />
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
          cameraPosition={{
            coordinates: meetPointCoord,
            zoom: calculateZoomLevel([meetPointCoord]),
          }}
          markers={appleMarkerList}
          uiSettings={{
            myLocationButtonEnabled: false,
            togglePitchEnabled: false,
            compassEnabled: false,
          }}
          properties={{
            isMyLocationEnabled: locationPerm,
            pointsOfInterest: {
              excluding: [
                AppleMapPointOfInterestCategory.AIRPORT,
                AppleMapPointOfInterestCategory.ATM,
                AppleMapPointOfInterestCategory.AQUARIUM,
                AppleMapPointOfInterestCategory.ANIMAL_SERVICE,
                AppleMapPointOfInterestCategory.AUTOMOTIVE_REPAIR,
                AppleMapPointOfInterestCategory.BANK,
                AppleMapPointOfInterestCategory.BEAUTY,
                AppleMapPointOfInterestCategory.BEACH,
                AppleMapPointOfInterestCategory.BASEBALL,
                AppleMapPointOfInterestCategory.BASKETBALL,
                AppleMapPointOfInterestCategory.BOWLING,
                AppleMapPointOfInterestCategory.CASTLE,
                AppleMapPointOfInterestCategory.CAMPGROUND,
                AppleMapPointOfInterestCategory.CAR_RENTAL,
                AppleMapPointOfInterestCategory.DISTILLERY,
                AppleMapPointOfInterestCategory.EV_CHARGER,
                AppleMapPointOfInterestCategory.FISHING,
                AppleMapPointOfInterestCategory.FAIRGROUND,
                AppleMapPointOfInterestCategory.FORTRESS,
                AppleMapPointOfInterestCategory.FIRE_STATION,
                AppleMapPointOfInterestCategory.FITNESS_CENTER,
                AppleMapPointOfInterestCategory.GOLF,
                AppleMapPointOfInterestCategory.GAS_STATION,
                AppleMapPointOfInterestCategory.GO_KART,
                AppleMapPointOfInterestCategory.HIKING,
                AppleMapPointOfInterestCategory.KAYAKING,
                AppleMapPointOfInterestCategory.LAUNDRY,
                AppleMapPointOfInterestCategory.MAILBOX,
                AppleMapPointOfInterestCategory.MARINA,
                AppleMapPointOfInterestCategory.MUSEUM,
                AppleMapPointOfInterestCategory.NATIONAL_MONUMENT,
                AppleMapPointOfInterestCategory.PARKING,
                AppleMapPointOfInterestCategory.POLICE,
                AppleMapPointOfInterestCategory.PHARMACY,
                AppleMapPointOfInterestCategory.PLANETARIUM,
                AppleMapPointOfInterestCategory.PUBLIC_TRANSPORT,
                AppleMapPointOfInterestCategory.RESTROOM,
                AppleMapPointOfInterestCategory.RV_PARK,
                AppleMapPointOfInterestCategory.ROCK_CLIMBING,
                AppleMapPointOfInterestCategory.SPA,
                AppleMapPointOfInterestCategory.SKATING,
                AppleMapPointOfInterestCategory.SOCCER,
                AppleMapPointOfInterestCategory.SKIING,
                AppleMapPointOfInterestCategory.SKATE_PARK,
                AppleMapPointOfInterestCategory.STADIUM,
                AppleMapPointOfInterestCategory.SURFING,
                AppleMapPointOfInterestCategory.SWIMMING,
                AppleMapPointOfInterestCategory.TENNIS,
                AppleMapPointOfInterestCategory.THEATER,
                AppleMapPointOfInterestCategory.VOLLEYBALL,
                AppleMapPointOfInterestCategory.WINERY,
                AppleMapPointOfInterestCategory.ZOO,
              ],
            },
          }}
          ref={appleMap}
        />
      ) : (
        <GoogleMaps.View
          style={{ flex: 1 }}
          cameraPosition={{
            coordinates: meetPointCoord,
            zoom: calculateZoomLevel([meetPointCoord]),
          }}
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
  meetPointButtonContainer: {
    position: "absolute",
    top: 75,
    right: 15,
    zIndex: 1,
  },
  meetPointAndroidContainer: {
    position: "absolute",
    top: 135,
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
  meetPointGlassView: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  restaurantButtonContainer: {
    position: "absolute",
    top: 135,
    right: 15,
    zIndex: 1,
  },
  restaurantAndroidContainer: {
    position: "absolute",
    top: 195,
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
