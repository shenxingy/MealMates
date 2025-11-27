import { View } from "react-native";

export default function EmptySpace({ marginTop, marginLeft }: { marginTop?: number, marginLeft?: number }) {
  return <View style={{ marginTop: marginTop ?? 0, marginLeft: marginLeft ?? 0 }} />;
}
