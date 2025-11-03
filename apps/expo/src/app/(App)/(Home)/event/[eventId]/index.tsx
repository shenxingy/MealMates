import { Text } from "react-native";
import { useSearchParams } from "expo-router/build/hooks";

import AnimatedPageFrame from "../../../../../../components/frame/AnimatedPageFrame";

const EventDetailsPage = () => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const baseColor = "255,140,0";
  return (
    <AnimatedPageFrame
      baseColor={baseColor}
      headerTitle={`Event #${eventId}`}
      scrollEnabled={false}
      enableReturnButton={true}
      returnButtonText="Home"
    >
      <Text style={{ fontSize: 18 }}>
        Content holder for Event ID: {eventId}
      </Text>
    </AnimatedPageFrame>
  );
};

export default EventDetailsPage;
