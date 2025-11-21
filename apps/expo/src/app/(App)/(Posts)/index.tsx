import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";
import * as ImagePicker from 'expo-image-picker';

export default function PostPage() {
  const header = "Posts";
  const baseColor = "255,178,0";
  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
  }
  return (
    <>
      <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
        <></>
      </AnimatedPageFrame>
    </>
  );
}
