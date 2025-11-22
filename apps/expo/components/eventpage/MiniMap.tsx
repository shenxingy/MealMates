import type { AppleMapsMarker } from "expo-maps/build/apple/AppleMaps.types";
import type { GoogleMapsMarker } from "expo-maps/build/google/GoogleMaps.types";
import type { Coordinates } from "expo-maps/src/shared.types";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { AppleMapPointOfInterestCategory } from "expo-maps/build/apple/AppleMaps.types";

import { calculateCenterCoordinates, calculateZoomLevel } from "~/utils/map";

interface NoPropMiniMapProps {
  meetPointCoord?: Coordinates;
  meetPoint?: string;
  restaurant?: string;
  restaurantCoord?: Coordinates;
  joined?: boolean;
  shareLocationCallback?: () => void;
  onMapPressedCallback: () => void;
}

interface NotJoinedMiniMapProps {
  meetPointCoord: Coordinates;
  meetPoint: string;
  restaurant?: string;
  restaurantCoord?: Coordinates;
  joined: false;
  onMapPressedCallback: () => void;
  shareLocationCallback?: () => void;
}

interface JoinedMiniMapProps {
  meetPointCoord: Coordinates;
  meetPoint: string;
  restaurant?: string;
  restaurantCoord?: Coordinates;
  joined: true;
  onMapPressedCallback: () => void;
  shareLocationCallback: () => void;
}

type MiniMapProps =
  | NoPropMiniMapProps
  | NotJoinedMiniMapProps
  | JoinedMiniMapProps;

export default function MiniMap(props: MiniMapProps) {
  const {
    meetPoint,
    meetPointCoord,
    restaurant,
    restaurantCoord,
    joined,
    shareLocationCallback,
    onMapPressedCallback,
  } = props;

  const [coordinates, setCoordinates] = useState<Coordinates | undefined>(
    undefined,
  );
  const [zoom, setZoom] = useState<number>(15);
  const [appleMarker, setAppleMarker] = useState<AppleMapsMarker[]>([]);
  const [googleMarker, setGoogleMarker] = useState<GoogleMapsMarker[]>([]);

  useEffect(() => {
    const configMap = () => {
      if (meetPointCoord == null) {
        return;
      }
      let center: Coordinates | undefined = meetPointCoord;
      let zoom = calculateZoomLevel([meetPointCoord]);
      const appleMarker: AppleMapsMarker[] = [
        {
          coordinates: meetPointCoord,
          title: meetPoint,
          systemImage: "flag.fill",
          id: "meet-point",
        },
      ];
      const googleMarker: GoogleMapsMarker[] = [
        {
          coordinates: meetPointCoord,
          title: meetPoint,
        },
      ];
      if (restaurantCoord != null) {
        center = calculateCenterCoordinates([meetPointCoord, restaurantCoord]);
        zoom = calculateZoomLevel([meetPointCoord, restaurantCoord]);
        if (restaurant != null) {
          appleMarker.push({
            coordinates: restaurantCoord,
            title: restaurant,
            systemImage: "fork.knife",
            id: "restaurant-point",
          });
          googleMarker.push({
            coordinates: restaurantCoord,
            title: restaurant,
          });
        }
      }
      setCoordinates(center);
      setZoom(zoom);
      setAppleMarker(appleMarker);
      setGoogleMarker(googleMarker);
    };
    void configMap();
  }, [meetPoint, meetPointCoord, restaurant, restaurantCoord]);

  return (
    <>
      {Platform.OS === "ios" ? (
        <View style={styles.mapContainer}>
          <AppleMaps.View
            style={styles.map}
            cameraPosition={{
              coordinates,
              zoom,
            }}
            markers={appleMarker}
            uiSettings={{
              myLocationButtonEnabled: false,
              togglePitchEnabled: false,
            }}
            properties={{
              pointsOfInterest: {
                excluding: excludingPointsOfInterest,
              },
            }}
          />
          <Pressable style={styles.mapMask} onPress={onMapPressedCallback} />
          {joined && (
            <Pressable
              style={styles.shareLocationButton}
              onPress={shareLocationCallback}
            >
              <GlassView
                style={
                  isLiquidGlassAvailable()
                    ? styles.glassContainer
                    : styles.androidContainer
                }
                glassEffectStyle="regular"
                isInteractive
              >
                <Text style={styles.shareLocationText}>Share Location</Text>
              </GlassView>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <GoogleMaps.View
            style={styles.map}
            cameraPosition={{ coordinates, zoom }}
            uiSettings={{
              mapToolbarEnabled: false,
              scaleBarEnabled: false,
              zoomControlsEnabled: false,
            }}
            markers={googleMarker}
          />
          <Pressable style={styles.mapMask} onPress={onMapPressedCallback} />
          {joined && (
            <Pressable
              style={styles.shareLocationButton}
              onPress={shareLocationCallback}
            >
              <View style={styles.androidContainer}>
                <Text style={styles.shareLocationText}>Share Location</Text>
              </View>
            </Pressable>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: "100%",
    height: 200,
    borderRadius: 30,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    position: "absolute",
  },
  mapMask: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF00",
  },
  shareLocationButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  glassContainer: {
    borderRadius: 25,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  androidContainer: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 25,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  shareLocationText: {
    width: "100%",
    height: "100%",
    fontWeight: "600",
    fontSize: 16,
    color: "#000",
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
});

export const excludingPointsOfInterest = [
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
];
