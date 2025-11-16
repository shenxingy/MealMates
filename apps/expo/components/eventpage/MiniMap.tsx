import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GlassView } from "expo-glass-effect";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { AppleMapPointOfInterestCategory } from "expo-maps/build/apple/AppleMaps.types";
import type { Coordinates } from "expo-maps/src/shared.types";





interface NoPropMiniMapProps {
  coordinates?: Coordinates;
  zoom?: number;
  joined?: boolean;
  shareLocationCallback?: () => void;
  onMapPressedCallback: () => void;
}

interface NotJoinedMiniMapProps {
  coordinates: Coordinates;
  zoom: number;
  joined: false;
  onMapPressedCallback: () => void;
  shareLocationCallback?: () => void;
}

interface JoinedMiniMapProps {
  coordinates: Coordinates;
  zoom: number;
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
    coordinates,
    zoom,
    joined,
    shareLocationCallback,
    onMapPressedCallback,
  } = props;
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
            markers={[
              {
                coordinates: coordinates,
              }
            ]}
            uiSettings={{
              myLocationButtonEnabled: false,
              togglePitchEnabled: false,
            }}
            properties={{
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
          />
          <Pressable style={styles.mapMask} onPress={onMapPressedCallback} />
          {joined && (
            <Pressable
              style={styles.shareLocationButton}
              onPress={shareLocationCallback}
            >
              <GlassView
                style={styles.glassContainer}
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
            markers={[
              {
                coordinates: coordinates,
              }
            ]}
          />
          <Pressable style={styles.mapMask} onPress={onMapPressedCallback} />
          {joined && (
            <Pressable
              style={styles.shareLocationButton}
              onPress={shareLocationCallback}
            >
              <View
                style={styles.androidContainer}
              >
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
