import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { LinearGradient } from "~/utils/nativeViews";

const Skeleton = (props: {
  isLoading: boolean;
  start: number;
  end: number;
  duration?: number;
}) => {
  const { isLoading, start, end, duration = 1000 } = props;

  // Shimmer animation
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    if (isLoading) {
      shimmerPosition.value = withRepeat(
        withTiming(1, { duration }),
        -1,
        false,
      );
    }
  }, [duration, isLoading, shimmerPosition]);

  const animatedGradientStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 1],
      [start, end],
    );
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.shimmerContainer}>
      <Animated.View style={[styles.shimmerGradient, animatedGradientStyle]}>
        <LinearGradient
          colors={["#E6E6E6", "#F2F2F2", "#E6E6E6"]}
          style={styles.shimmerOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          locations={[0, 0.5, 1]}
        />
      </Animated.View>
      <View style={styles.shimmerBase} />
    </View>
  );
};

export default Skeleton;

const styles = StyleSheet.create({
  shimmerContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  shimmerBase: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E6E6E6",
    borderRadius: 24,
  },
  shimmerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  shimmerOverlay: {
    width: "200%",
    height: "100%",
  },
});
