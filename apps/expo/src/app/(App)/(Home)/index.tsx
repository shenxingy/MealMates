import { useMemo } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LinearGradientBackground from "../../../../components/background/LinearGradientBackground";

export default function HomePage() {
  // Create a single Animated.Value instance without accessing ref.current during render
  const scrollY = useMemo(() => new Animated.Value(0), []);
  const insets = useSafeAreaInsets();

  return (
    <LinearGradientBackground
      startColor="rgba(255,120,0,0.5)"
      endColor="rgba(255,120,0,0)"
      scrollY={scrollY}
      speed={0.2}
    >
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <Text style={{ fontSize: 24 }}>Home Page</Text>
        </View>
      </Animated.ScrollView>
    </LinearGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
  },
});
