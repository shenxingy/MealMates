import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function HomePageLayout() {
  return <>
    <NativeTabs>
      <NativeTabs.Trigger name="(Home)">
        <Label>Home</Label>
        <Icon sf={{default: "house", selected: "house.fill"}} drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(Posts)">
        <Label>Posts</Label>
        <Icon sf={{default: "scribble", selected: "scribble.variable"}} drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(You)">
        <Label>You</Label>
        <Icon sf={{default: "person", selected: "person.fill"}} drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
    </NativeTabs>
  </>
}