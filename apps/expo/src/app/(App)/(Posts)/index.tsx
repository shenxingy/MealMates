import { useColorScheme } from "react-native";
import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";

export default function PostPage() {
  const header = "Posts";
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const baseColor = isDark ? "70,70,70" : "255,178,0";
  return (
    <>
      <AnimatedPageFrame baseColor={baseColor} headerTitle={header}>
        <></>
      </AnimatedPageFrame>
    </>
  );
}
