import { Platform } from "react-native";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function HomePageLayout() {
  return (
    <>
      <NativeTabs minimizeBehavior="onScrollDown">
        <NativeTabs.Trigger name="(Home)">
          <Label>Home</Label>
          {Platform.select({
            ios: (
              <Icon
                sf={{ default: "house", selected: "house.fill" }}
                drawable="custom_android_drawable"
              />
            ),
            android: (
              <Icon src={<VectorIcon family={MaterialIcons} name="home" />} />
            ),
          })}
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(Posts)">
          <Label>Posts</Label>
          {Platform.select({
            ios: (
              <Icon
                sf={{ default: "scribble", selected: "scribble.variable" }}
                drawable="custom_android_drawable"
              />
            ),
            android: (
              <Icon
                src={<VectorIcon family={MaterialIcons} name="post-add" />}
              />
            ),
          })}
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(You)">
          <Label>You</Label>
          {Platform.select({
            ios: (
              <Icon
                sf={{ default: "person", selected: "person.fill" }}
                drawable="custom_android_drawable"
              />
            ),
            android: (
              <Icon src={<VectorIcon family={MaterialIcons} name="person" />} />
            ),
          })}
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="search" role="search">
          <Label>Search</Label>
          {Platform.select({
            ios: (
              <Icon
                sf={{ default: "magnifyingglass", selected: "magnifyingglass" }}
                drawable="custom_android_drawable"
              />
            ),
            android: (
              <Icon src={<VectorIcon family={MaterialIcons} name="search" />} />
            ),
          })}
        </NativeTabs.Trigger>
      </NativeTabs>
    </>
  );
}
