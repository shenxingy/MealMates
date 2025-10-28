import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function YouPage() {
  return (
    <>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white"}}>
          <Text style={{fontSize: 24}}>You Page</Text>
        </View>
      </SafeAreaView>
    </>
  );
}