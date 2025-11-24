import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router";



import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";


export default function SearchPage() {
  const baseColor = "255,120,0";
  const header = "Search";
  const {query}: {query: string} = useLocalSearchParams()
  return (
    <>
      <AnimatedPageFrame
        baseColor={baseColor}
        headerTitle={header}
        scrollEnabled={false}
      >
        <>
          <Text>{query}</Text>
        </>
      </AnimatedPageFrame>
    </>
  );
}
