import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";

export default function SearchPage() {
  return (
    <>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white"}}>
          <Text style={{fontSize: 24}}>
            Search Page
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}