import { StyleSheet, View, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type React from "react";

const BACKDROP_HEIGHT = 1000; // large enough to cover translate range
const BACKDROP_TOP = -750; // center the tall backdrop on screen

const LinearGradientBackground = (props: {
  children: React.ReactNode,
  startColor: string,
  endColor: string,
  scrollY?: Animated.Value,
  speed?: number
}) => {
  // Default speed to 1 so background moves with content unless specified otherwise
  const { children, startColor, endColor, scrollY, speed = 1 } = props;

  const animatedStyle = scrollY ? {
    transform: [
      { translateY: Animated.multiply(scrollY, -speed) },
    ],
  } : undefined;

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents="none"
        style={[styles.background, { top: BACKDROP_TOP, height: BACKDROP_HEIGHT }, animatedStyle]}
      >
        <LinearGradient
          // Background Linear Gradient
          colors={[startColor, startColor, endColor]}
          style={StyleSheet.absoluteFill}
          locations={[0, 0.75, 1]}
        />
      </Animated.View>
      <View style={styles.children}>{children}</View>
    </View>
  );
}

export default LinearGradientBackground;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 400,
  },
  children: {
    flex: 1,
    backgroundColor: 'transparent',
  }
})
