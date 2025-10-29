import { useMemo } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient as MaskGradient } from "expo-linear-gradient";

import LinearGradientBackground from "../../../../components/background/LinearGradientBackground";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function HomePage() {
  // Create a single Animated.Value instance without accessing ref.current during render
  const scrollY = useMemo(() => new Animated.Value(0), []);
  const insets = useSafeAreaInsets();

  // Height of the blurred area
  const HEADER_BLUR_HEIGHT = 80;
  const overlayHeight = insets.top + HEADER_BLUR_HEIGHT;

  // Fade in
  const blurOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Blur intensity based on scroll position
  const blurIntensity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: "clamp",
  });

  // Header fade transition at 58px scroll threshold
  const contentHeaderOpacity = scrollY.interpolate({
    inputRange: [0, 58],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const topHeaderOpacity = scrollY.interpolate({
    inputRange: [0, 58],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <LinearGradientBackground
      startColor="rgba(255,120,0,0.5)"
      endColor="rgba(255,120,0,0)"
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
        >
          <View style={{ paddingTop: insets.top + 58, paddingHorizontal: 20 }}>
            <Animated.Text style={[styles.contentHeader, { opacity: contentHeaderOpacity }]}>
              Header
            </Animated.Text>
            {/* Actual Content Started */}
            <Text style={styles.contentText}>
              Scroll up to see the blur effect. When the content scrolls into the Header area, a gradient blur effect will become visible.
            </Text>
            {Array.from({ length: 20 }, (_, i) => (
              <View key={i} style={styles.contentBlock}>
                <Text style={styles.blockTitle}>Content Block {i + 1}</Text>
                <Text style={styles.blockText}>
                  Home Page Content Block {i + 1}
                </Text>
              </View>
            ))}
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
                colors={["rgba(0,0,0,1)", "rgba(0,0,0,0.8)", "rgba(0,0,0,0)"]}
                locations={[0, 0.7, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            }
          >
            <AnimatedBlurView
              intensity={blurIntensity}
              tint="systemMaterial"
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
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Header</Text>
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
  },
  contentHeader: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  contentText: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  contentBlock: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  blockText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
