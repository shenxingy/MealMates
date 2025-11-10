import { useState } from "react";
import { Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import MiniMap from "../../../../../../components/eventpage/MiniMap";
import AnimatedPageFrame from "../../../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../../../components/frame/EmptySpace";

const EventDetailsPage = () => {
  const {eventId} = useLocalSearchParams<{eventId: string}>();
  const baseColor = "255,140,0";
  const router = useRouter();

  const [latitude, setLatitude] = useState(36.001877);
  const [longitude, setLongitude] = useState(-78.940232);
  const [zoom, setZoom] = useState(18);

  const shareLocationCallback = () => {
    console.log("Share location button pressed");
    if (!eventId) {
      console.error("No event ID found in search params");
      return;
    }
    router.push(
      `/(App)/(Home)/event/${eventId}/map-modal?shared=true&latitude=${latitude}&longitude=${longitude}&zoom=${zoom}`,
    );
  };

  const handleOpenMapModal = () => {
    console.log("Map pressed, opening modal");
    if (!eventId) {
      console.error("No event ID found in search params");
      return;
    }
    router.push(
      `/(App)/(Home)/event/${eventId}/map-modal?shared=false&latitude=${latitude}&longitude=${longitude}&zoom=${zoom}`,
    );
  };

  return (
    <AnimatedPageFrame
      baseColor={baseColor}
      headerTitle={`Event #${eventId}`}
      scrollEnabled={false}
      enableReturnButton={true}
      returnButtonText="Home"
    >
      <EmptySpace marginTop={30} />
      <Text style={{ fontSize: 18 }}>
        Content holder for Event ID: {eventId}
      </Text>
      <EmptySpace marginTop={20} />
      <MiniMap
        coordinates={{ latitude, longitude }}
        zoom={18}
        joined={true}
        shareLocationCallback={shareLocationCallback}
        onMapPressedCallback={handleOpenMapModal}
      />
    </AnimatedPageFrame>
  );
};

export default EventDetailsPage;
