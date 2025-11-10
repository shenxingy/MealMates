import { Text } from "react-native";
import { useSearchParams } from "expo-router/build/hooks";

import AnimatedPageFrame from "../../../../../../components/frame/AnimatedPageFrame";
import EmptySpace from "../../../../../../components/frame/EmptySpace";
import MiniMap from "../../../../../../components/eventpage/MiniMap";

const EventDetailsPage = () => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const baseColor = "255,140,0";

  const shareLocationCallback = () => {
    console.log("Share location button pressed");
  }

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
      <MiniMap coordinates={{ latitude: 36.001877, longitude: -78.940232 }} zoom={18} joined={true} shareLocationCallback={shareLocationCallback} />
    </AnimatedPageFrame>
  );
};

export default EventDetailsPage;
