import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const handleFakeLogin = () => {
    router.replace("/(App)/(Home)");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <Text style={{ textAlign: "center", fontSize: 40, color: "black" }}>
          Login Page
        </Text>
        <Pressable
          onPress={handleFakeLogin}
          style={{ marginTop: 20, backgroundColor: "blue", borderRadius: 10 }}
        >
          <Text style={{ color: "white", padding: 10, fontSize: 20 }}>
            Fake Login
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
