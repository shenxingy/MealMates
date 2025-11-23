import type { Coordinates } from "expo-maps/src/shared.types";
import { Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { fetchDetailedEvent } from "~/utils/api";
import MiniMap from "../../../../../../components/eventpage/MiniMap";
import AnimatedPageFrame from "../../../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../../../components/frame/EmptySpace";

const EventDetailsPage = () => {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const baseColor = "255,140,0";
  const router = useRouter();

  const {
    data,
    isLoading,
    error: _error,
  } = useQuery({
    queryKey: ["eventDetails", eventId],
    queryFn: () => fetchDetailedEvent(eventId),
    enabled: !!eventId,
  });

  const meetPointCoord: Coordinates | undefined =
    data?.meetPointCoordinates ?? undefined;
  const meetPointLatitude = meetPointCoord?.latitude ?? 0;
  const meetPointLongitude = meetPointCoord?.longitude ?? 0;
  const restaurantCoord: Coordinates | undefined =
    data?.restaurantCoordinates ?? undefined;
  const restaurantLatitude = restaurantCoord?.latitude ?? 0;
  const restaurantLongitude = restaurantCoord?.longitude ?? 0;
  const meetPoint = data?.meetPoint ?? "Meet Point";
  const restaurantName = data?.restaurantName ?? "Restaurant";

  console.log("Meet Point Coordinates:", meetPointLatitude, meetPointLongitude);

  const shareLocationCallback = () => {
    console.log("Share location button pressed");
    if (!eventId) {
      console.error("No event ID found in search params");
      return;
    }
    router.push(
      `/(App)/(Home)/event/${eventId}/map-modal?shared=true&meetPoint=${meetPoint}&meetPointLatitude=${meetPointLatitude}&meetPointLongitude=${meetPointLongitude}&restaurantName=${restaurantName}${restaurantCoord ? `&restaurantLatitude=${restaurantLatitude}&restaurantLongitude=${restaurantLongitude}` : ""}`,
    );
  };

  const handleOpenMapModal = () => {
    console.log("Map pressed, opening modal");
    if (!eventId) {
      console.error("No event ID found in search params");
      return;
    }
    router.push(
      `/(App)/(Home)/event/${eventId}/map-modal?shared=false&meetPoint=${meetPoint}&meetPointLatitude=${meetPointLatitude}&meetPointLongitude=${meetPointLongitude}&restaurantName=${restaurantName}${restaurantCoord ? `&restaurantLatitude=${restaurantLatitude}&restaurantLongitude=${restaurantLongitude}` : ""}`,
    );
  };

  if (isLoading) {
    return (
      <>
        <AnimatedPageFrame
          baseColor={baseColor}
          headerTitle={`Event #${eventId}`}
          scrollEnabled={false}
          enableReturnButton={true}
        >
          <EmptySpace marginTop={30} />
          <Text style={{ fontSize: 18 }}>Loading event details...</Text>
        </AnimatedPageFrame>
      </>
    );
  }

  return (
    <AnimatedPageFrame
      baseColor={baseColor}
      headerTitle={`Event #${eventId}`}
      scrollEnabled={false}
      enableReturnButton={true}
    >
      <EmptySpace marginTop={30} />
      <Text style={{ fontSize: 18 }}>
        Content holder for Event ID: {eventId}
      </Text>
      <EmptySpace marginTop={20} />
      {meetPointCoord && (
        <MiniMap
          meetPointCoord={meetPointCoord}
          meetPoint={meetPoint}
          restaurantCoord={restaurantCoord}
          restaurant={restaurantName}
          joined={true}
          shareLocationCallback={shareLocationCallback}
          onMapPressedCallback={handleOpenMapModal}
        />
      )}
    </AnimatedPageFrame>
  );
};

export default EventDetailsPage;
