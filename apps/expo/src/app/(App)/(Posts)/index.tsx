import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PostPage() {
  return (
    <>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "white" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 24 }}>Posts Page</Text>
        </View>
      </SafeAreaView>
    </>
  );
}
