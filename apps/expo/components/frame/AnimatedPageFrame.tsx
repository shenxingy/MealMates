import { useMemo } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient as MaskGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

import LinearGradientBackground from "../background/LinearGradientBackground";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function AnimatedPageFrame(props: {
  children: React.ReactNode;
  baseColor: string;
  headerTitle?: string;
  scrollEnabled?: boolean;
}) {
  const { children, baseColor, headerTitle, scrollEnabled = true } = props;
  // Create a single Animated.Value instance without accessing ref.current during render
  const scrollY = useMemo(() => new Animated.Value(0), []);
  const insets = useSafeAreaInsets();

  // Gradient color
  const startColor = `rgba(${baseColor},0.5)`;
  const endColor = `rgba(${baseColor},0)`;
  const maskGradientColor = `rgba(${baseColor},0.8)`;
  const gradientColor = `rgba(${baseColor},1)`;

  // Height of the blurred area
  const HEADER_BLUR_HEIGHT = 80;
  const overlayHeight = insets.top + HEADER_BLUR_HEIGHT;

  // Blur fade in
  const blurOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Blur intensity
  const blurIntensity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: "clamp",
  });

  // Header fade transition at 58px scroll threshold
  const contentHeaderOpacity = scrollY.interpolate({
    inputRange: [50, 66],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const topHeaderOpacity = scrollY.interpolate({
    inputRange: [53, 71],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const topHeaderTranslateY = scrollY.interpolate({
    inputRange: [53, 71],
    outputRange: [20, 0],
    extrapolate: "clamp",
  });

  return (
    <LinearGradientBackground
      startColor={startColor}
      endColor={endColor}
      scrollY={scrollY}
      speed={1}
    >
      <View style={{ flex: 1 }}>
        <Animated.ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
          scrollEnabled={scrollEnabled}
        >
          <View style={{ paddingTop: insets.top + 58, paddingHorizontal: 20 }}>
            <Animated.Text
              style={[styles.contentHeader, { opacity: contentHeaderOpacity }]}
            >
              {headerTitle ?? ""}
            </Animated.Text>
            {/* Actual Content Started */}
            {children}
          </View>
        </Animated.ScrollView>

        {/* Header gradient-masked blur overlay */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: overlayHeight,
            opacity: blurOpacity,
          }}
        >
          <MaskedView
            style={{ flex: 1 }}
            maskElement={
              <MaskGradient
                // Change blur settings here
                colors={[gradientColor, maskGradientColor, endColor]}
                locations={[0, 0.7, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            }
          >
            <AnimatedBlurView
              intensity={blurIntensity}
              tint="systemChromeMaterial"
              style={StyleSheet.absoluteFill}
            />
          </MaskedView>
        </Animated.View>

        {/* Header on top */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: insets.top,
            left: 0,
            right: 0,
            alignItems: "center",
            opacity: topHeaderOpacity,
            transform: [
              {
                translateY: topHeaderTranslateY,
              },
            ],
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {headerTitle ?? ""}
          </Text>
        </Animated.View>
      </View>
    </LinearGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    paddingBottom: 200,
  },
  contentHeader: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
