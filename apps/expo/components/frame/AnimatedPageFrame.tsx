import type { ComponentProps } from "react";
import type React from "react";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import {
  LinearGradient,
  LinearGradient as MaskGradient,
} from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaskedView from "@react-native-masked-view/masked-view";

import LinearGradientBackground from "../background/LinearGradientBackground";
import SymbolButton from "./SymbolButton";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface BasePageProps {
  children: React.ReactNode;
  baseColor: string;
  headerTitle?: string;
  headerRightSFSymbolName?: ComponentProps<typeof SymbolView>["name"];
  headerRightMaterialSymbolName?: ComponentProps<typeof MaterialIcons>["name"];
  headerRightOnPress?: () => void;
  enableReturnButton?: boolean;
  returnButtonText?: string;
  paddingHorizontal?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}

// Simple page - no scrollEnabled specified, no onRefresh
interface SimplePageProps extends BasePageProps {
  scrollEnabled?: false;
  onRefresh?: never;
}

// Scrollable page - scrollEnabled: true, but no onRefresh
interface ScrollablePageProps extends BasePageProps {
  scrollEnabled: true;
  onRefresh?: never;
}

// Refreshable page - scrollEnabled: true and onRefresh required
interface RefreshablePageProps extends BasePageProps {
  scrollEnabled?: true;
  onRefresh: () => void | Promise<void>;
}

type PageFrameProps =
  | SimplePageProps
  | ScrollablePageProps
  | RefreshablePageProps;

export default function AnimatedPageFrame(props: PageFrameProps) {
  const {
    children,
    baseColor,
    headerTitle,
    headerRightSFSymbolName,
    headerRightMaterialSymbolName,
    headerRightOnPress,
    paddingHorizontal,
    scrollEnabled = true,
    enableReturnButton = false,
    returnButtonText,
    onRefresh,
    onEndReached,
    onEndReachedThreshold = 0.5,
  } = props;

  // Create a single Animated.Value instance
  const scrollY = useMemo(() => new Animated.Value(0), []);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  // iOS manual pull to refresh tracking
  const scrollYValue = useRef(0);
  const isPulling = useRef(false);
  const hasCalledOnEndReached = useRef(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Update scroll Y value
  scrollY.addListener(({ value }) => {
    scrollYValue.current = value;
    // Update scroll to top button visibility
    setShowScrollToTop(value > 300);
  });

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

  // Scroll to top button fade in
  const scrollToTopOpacity = scrollY.interpolate({
    inputRange: [500, 800],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Pull-down title opacity
  const pullDownTitleOpacity = scrollY.interpolate({
    inputRange: [-100, -50, 0],
    outputRange: [1, 0.2, 0],
    extrapolate: "clamp",
  });

  const router = useRouter();
  const handleReturnButton = () => {
    router.back();
  };

  const scrollViewRef = useRef<any>(null);
  const handleScrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Handle refresh using RefreshControl
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Handle scroll begin
  const handleScrollBeginDrag = () => {
    if (Platform.OS === "ios") {
      isPulling.current = true;
    }
  };

  // Handle scroll end
  const handleScrollEndDrag = async () => {
    if (
      Platform.OS === "ios" &&
      isPulling.current &&
      scrollYValue.current < -100 &&
      onRefresh
    ) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    isPulling.current = false;
  };

  // Handle scroll to detect when reaching end
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromEnd =
      contentSize.height - layoutMeasurement.height - contentOffset.y;
    const threshold = layoutMeasurement.height * onEndReachedThreshold;

    if (distanceFromEnd < threshold && !hasCalledOnEndReached.current) {
      hasCalledOnEndReached.current = true;
      onEndReached?.();
    } else if (distanceFromEnd > threshold) {
      hasCalledOnEndReached.current = false;
    }
  };

  return (
    <>
      <LinearGradientBackground
        startColor={startColor}
        endColor={endColor}
        scrollY={scrollY}
        speed={1}
      >
        <View style={{ flex: 1 }}>
          <Animated.ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.container}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              {
                useNativeDriver: true,
                listener: handleScroll,
              },
            )}
            scrollEventThrottle={16}
            scrollEnabled={scrollEnabled}
            // Android uses RefreshControl
            refreshControl={
              Platform.OS === "android" && onRefresh ? (
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[
                    isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                  ]}
                  progressViewOffset={insets.top}
                />
              ) : undefined
            }
            // iOS uses manual pull detection
            onScrollBeginDrag={
              Platform.OS === "ios" && onRefresh
                ? handleScrollBeginDrag
                : undefined
            }
            onScrollEndDrag={
              Platform.OS === "ios" && onRefresh
                ? handleScrollEndDrag
                : undefined
            }
          >
            {/* Pull-down title at y = -50 */}
            <Animated.View
              style={{
                position: "absolute",
                top: -50,
                left: 0,
                right: 0,
                alignItems: "center",
                opacity: pullDownTitleOpacity,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Image
                  source={require("../../assets/icon-light.png")}
                  style={{
                    width: 64,
                    height: 64,
                  }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: isDark
                      ? "rgba(255, 255, 255, 0.6)"
                      : "rgba(0, 0, 0, 0.8)",
                  }}
                >
                  MealMate
                </Text>
              </View>
            </Animated.View>

            <View style={{ paddingTop: insets.top + 58 }}>
              <Animated.View
                style={[
                  styles.headerRow,
                  {
                    opacity: contentHeaderOpacity,
                    paddingHorizontal: paddingHorizontal ?? 20,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.contentHeader,
                    isDark && styles.contentHeaderDark,
                  ]}
                >
                  {headerTitle ?? ""}
                </Text>
                {headerRightSFSymbolName &&
                  headerRightMaterialSymbolName &&
                  headerRightOnPress && (
                    <Pressable
                      onPress={headerRightOnPress}
                      style={({ pressed }) => [
                        styles.headerRightButtonContainer,
                        styles.headerRightButton,
                        isDark && styles.headerRightButtonDark,
                        { opacity: pressed ? 0.5 : 1 },
                      ]}
                    >
                      {Platform.OS === "ios" ? (
                        <SymbolView
                          name={headerRightSFSymbolName}
                          size={23}
                          tintColor={
                            isDark ? "rgba(255, 255, 255, 0.85)" : "black"
                          }
                        />
                      ) : (
                        <MaterialIcons
                          name={headerRightMaterialSymbolName}
                          size={23}
                          color={isDark ? "rgba(255, 255, 255, 0.85)" : "black"}
                        />
                      )}
                    </Pressable>
                  )}
              </Animated.View>
              {/* Actual Content Started */}
              <View style={{ paddingHorizontal: paddingHorizontal ?? 20 }}>
                {children}
              </View>
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
            pointerEvents="box-none"
            style={{
              position: "absolute",
              top: insets.top,
              left: 0,
              right: 0,
              paddingHorizontal: 20,
              opacity: topHeaderOpacity,
              transform: [
                {
                  translateY: topHeaderTranslateY,
                },
              ],
            }}
          >
            <View style={styles.topHeaderRow}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: isDark ? "rgba(255, 255, 255, 0.85)" : "black",
                }}
              >
                {headerTitle ?? ""}
              </Text>
              <Pressable
                onPress={headerRightOnPress}
                style={({ pressed }) => [
                  styles.headerRightButtonContainer,
                  styles.topHeaderRightButton,
                  { opacity: pressed ? 0.5 : 1 },
                ]}
              >
                {Platform.OS === "ios" &&
                  headerRightSFSymbolName &&
                  headerRightOnPress && (
                    <SymbolView
                      name={headerRightSFSymbolName}
                      size={23}
                      tintColor={isDark ? "rgba(255, 255, 255, 0.85)" : "black"}
                    />
                  )}
                {Platform.OS === "android" &&
                  headerRightMaterialSymbolName &&
                  headerRightOnPress && (
                    <MaterialIcons
                      name={headerRightMaterialSymbolName}
                      size={23}
                      color={isDark ? "rgba(255, 255, 255, 0.85)" : "black"}
                    />
                  )}
              </Pressable>
            </View>
          </Animated.View>
        </View>
        {/* Return button */}
        {enableReturnButton && (
          <Pressable
            onPress={handleReturnButton}
            style={[
              { top: isLiquidGlassAvailable() ? insets.top : insets.top + 5 },
              styles.returnPressable,
            ]}
          >
            <GlassView
              style={
                isLiquidGlassAvailable()
                  ? styles.returnGlassButton
                  : [styles.returnButton, isDark && styles.returnButtonDark]
              }
              isInteractive
            >
              <View style={styles.returnButtonContainer}>
                {Platform.OS === "ios" ? (
                  <SymbolView
                    name="chevron.backward"
                    size={17}
                    tintColor={isDark ? "rgba(255, 255, 255, 0.85)" : "black"}
                  />
                ) : (
                  <MaterialIcons
                    name="arrow-back-ios"
                    size={17}
                    color={isDark ? "rgba(255, 255, 255, 0.85)" : "black"}
                  />
                )}
                {returnButtonText && (
                  <Text
                    style={[
                      styles.returnButtonText,
                      isDark && styles.returnButtonTextDark,
                    ]}
                  >
                    {returnButtonText}
                  </Text>
                )}
                {!returnButtonText && Platform.OS == "android" && (
                  <Text
                    style={[
                      styles.returnButtonText,
                      isDark && styles.returnButtonTextDark,
                    ]}
                  >
                    Back
                  </Text>
                )}
              </View>
            </GlassView>
          </Pressable>
        )}
        {/* Scroll to top button */}
        <Animated.View
          pointerEvents={showScrollToTop ? "auto" : "none"}
          style={[
            styles.scrollToTopButton,
            {
              bottom: insets.bottom + 100,
              opacity: scrollToTopOpacity,
            },
          ]}
        >
          <Pressable
            onPress={handleScrollToTop}
            style={({ pressed }) => [
              styles.scrollToTopButtonContainer,
              isDark && styles.scrollToTopButtonContainerDark,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            {Platform.OS === "ios" ? (
              <SymbolView
                name="chevron.up"
                size={27}
                tintColor={isDark ? "rgba(255, 255, 255, 0.85)" : "black"}
              />
            ) : (
              <MaterialIcons
                name="keyboard-arrow-up"
                size={24}
                color={isDark ? "rgba(255, 255, 255, 0.85)" : "black"}
              />
            )}
          </Pressable>
        </Animated.View>
      </LinearGradientBackground>
      {Platform.OS == "ios" && !isLiquidGlassAvailable() && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: insets.bottom + 100,
            backgroundColor: "transparent",
          }}
          pointerEvents="none"
        >
          <LinearGradient
            colors={
              isDark
                ? ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 1)"]
                : [
                    "rgba(255, 255, 255, 0)",
                    "rgba(255, 255, 255, 0.7)",
                    "rgba(255, 255, 255, 1)",
                  ]
            }
            locations={[0, 0.3, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ flex: 1 }}
          />
        </View>
      )}
    </>
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
  },
  contentHeaderDark: {
    color: "rgba(255, 255, 255, 0.85)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10,
  },
  topHeaderRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  headerRightButtonContainer: {
    marginRight: 1,
  },
  topHeaderRightButton: {
    position: "absolute",
    right: 0,
  },
  headerRightButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerRightButtonDark: {
    backgroundColor: "rgba(45,45,45,0.8)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  returnPressable: {
    position: "absolute",
    left: 20,
  },
  returnGlassButton: {
    height: 48,
    minWidth: 48,
    borderRadius: 24,
  },
  returnButton: {
    height: 48,
    minWidth: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  returnButtonDark: {
    backgroundColor: "rgba(45,45,45,0.8)",
  },
  returnButtonContainer: {
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  returnButtonText: {
    fontSize: 17,
  },
  returnButtonTextDark: {
    color: "rgba(255, 255, 255, 0.85)",
  },
  scrollToTopButton: {
    position: "absolute",
    right: 20,
  },
  scrollToTopButtonContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  scrollToTopButtonContainerDark: {
    backgroundColor: "rgba(45,45,45,0.8)",
    borderColor: "rgba(255,255,255,0.1)",
  },
});
