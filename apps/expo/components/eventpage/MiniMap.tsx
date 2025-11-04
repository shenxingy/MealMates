import { Platform, StyleSheet } from "react-native";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { AppleMapPointOfInterestCategory } from "expo-maps/build/apple/AppleMaps.types";

interface MiniMapProps {
  coordinates?: { latitude: number; longitude: number },
  zoom?: number,
}

export default function MiniMap(props: MiniMapProps) {
  const { coordinates, zoom } = props;
  return (
    <>
      {Platform.OS === "ios" ? (
        <>
          <AppleMaps.View
            style={styles.mapContainer}
            cameraPosition={{
              coordinates,
              zoom,
            }}
            circles={[
              {
                center: { latitude: 36.001877, longitude: -78.940232 },
                radius: 20,
                lineColor: "#F2F2F2",
                lineWidth: 3,
                color: "#FF8C004C",
              },
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
                ]
              }
            }}
          />
        </>
      ) : (
        <>
          <GoogleMaps.View style={{ flex: 1 }} />
        </>
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
    justifyContent: "center",
    alignItems: "center",
  },
});
