import type { AppleMapsViewType } from "expo-maps/build/apple/AppleMaps.types";
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
import SymbolButton from "../../../../../../components/frame/SymbolButton";

export default function MapModalPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const eventId = params.eventId as string;
  const shared = params.shared === "true";
  const latitude = parseFloat(params.latitude as string);
  const longitude = parseFloat(params.longitude as string);
  const meetPlaceCoord: Coordinates = { latitude, longitude };
  const zoom = parseFloat(params.zoom as string);
  const handleDismiss = () => {
    router.back();
  };
  const [locationPerm, setLocationPerm] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [meetPointView, setMeetPointView] = useState(true);

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
  }

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
  const handleCameraToMyLocation = () => {
    if (locationPerm && currentLocation) {
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
    } else {
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
        meetPlaceCoord,
      ]);
      if (meetPointView) {
        if (centerCoord && Platform.OS === "ios") {
          appleMap.current?.setCameraPosition({
            coordinates: centerCoord,
            zoom: calculateZoomLevel([currentCoord, meetPlaceCoord]),
          });
        }
      } else {
        if (Platform.OS === "ios") {
          appleMap.current?.setCameraPosition({
            coordinates: meetPlaceCoord,
            zoom: zoom,
          });
        }
      }
      setMeetPointView(!meetPointView);
    } else {
      if (Platform.OS === "ios") {
        appleMap.current?.setCameraPosition({
          coordinates: meetPlaceCoord,
          zoom: zoom,
        });
      }
    }
  };

  return (
    <>
      <SymbolButton
        onPress={handleDismiss}
        pressableStyle={styles.dismissButtonContainer}
        glassViewStyle={styles.dismissButtonGlassView}
        SFSymbolName="xmark"
      />
      <SymbolButton
        onPress={handleCameraToMyLocation}
        pressableStyle={styles.myLocationContainer}
        glassViewStyle={styles.myLocationGlassView}
        SFSymbolName="location"
      />
      <SymbolButton
        onPress={handleCameraToMeetPoint}
        pressableStyle={styles.meetPointButtonContainer}
        glassViewStyle={styles.meetPointGlassView}
        SFSymbolName="flag"
      />
      {Platform.OS === "ios" ? (
        <AppleMaps.View
          style={{ flex: 1 }}
          cameraPosition={{ coordinates: meetPlaceCoord, zoom }}
          circles={[
            {
              center: meetPlaceCoord,
              radius: 20,
              lineColor: "#F2F2F2",
              lineWidth: 3,
              color: "#FF8C004C",
            },
          ]}
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
        <GoogleMaps.View style={{ flex: 1 }} />
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
  meetPointGlassView: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});
