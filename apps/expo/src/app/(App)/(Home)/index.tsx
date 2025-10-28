import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradientBackground from "../../../../components/background/LinearGradientBackground";

export default function HomePage() {
  return (
    <LinearGradientBackground startColor='rgba(255,120,0,0.5)' endColor='rgba(255,120,0,0)'>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "transparent" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24 }}>Home Page</Text>
        </View>
      </SafeAreaView>
    </LinearGradientBackground>
  );
}
