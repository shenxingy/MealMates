import React, { ComponentProps, useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
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
  } = props;

  // Create a single Animated.Value instance
  const scrollY = useMemo(() => new Animated.Value(0), []);
  const insets = useSafeAreaInsets();

  // Pull to refresh tracking
  const [_isRefreshing, setIsRefreshing] = useState(false);
  const scrollYValue = useRef(0);
  const isPulling = useRef(false);

  // Update scroll Y value
  scrollY.addListener(({ value }) => {
    scrollYValue.current = value;
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

  const router = useRouter();
  const handleReturnButton = () => {
    router.back();
  };

  // Handle scroll begin - user starts scrolling
  const handleScrollBeginDrag = () => {
    isPulling.current = true;
  };

  // Handle scroll end - user releases the scroll
  const handleScrollEndDrag = async () => {
    if (isPulling.current && scrollYValue.current < -100 && onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    isPulling.current = false;
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
            style={{ flex: 1 }}
            contentContainerStyle={styles.container}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false },
            )}
            scrollEventThrottle={16}
            scrollEnabled={scrollEnabled}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEndDrag}
          >
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
                <Text style={styles.contentHeader}>{headerTitle ?? ""}</Text>
                {headerRightSFSymbolName
                  && headerRightMaterialSymbolName
                  && headerRightOnPress
                  && <Pressable
                    onPress={headerRightOnPress}
                    style={({ pressed }) => [
                      styles.headerRightButtonContainer,
                      styles.headerRightButton,
                      { opacity: pressed ? 0.5 : 1 }
                    ]}
                  >
                    {Platform.OS === "ios" ? (
                      <SymbolView
                        name={headerRightSFSymbolName}
                        size={23}
                        tintColor="black"
                      />
                    ) : (
                      <MaterialIcons
                        name={headerRightMaterialSymbolName}
                        size={23}
                        color="black"
                      />
                    )}
                  </Pressable>}
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
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {headerTitle ?? ""}
              </Text>
              <Pressable 
                onPress={headerRightOnPress} 
                style={({ pressed }) => [
                  styles.headerRightButtonContainer,
                  { opacity: pressed ? 0.5 : 1 }
                ]}
              >
                {Platform.OS === "ios"
                  && headerRightSFSymbolName
                  && headerRightOnPress
                  && <SymbolView name={headerRightSFSymbolName} size={23} tintColor="black" />
                }
                {Platform.OS === "android"
                  && headerRightMaterialSymbolName
                  && headerRightOnPress
                  && <MaterialIcons name={headerRightMaterialSymbolName} size={23} color="black" />
                }
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
                  : styles.returnButton
              }
              isInteractive
            >
              <View style={styles.returnButtonContainer}>
                {Platform.OS === "ios" ? (
                  <SymbolView
                    name="chevron.backward"
                    size={17}
                    tintColor="black"
                  />
                ) : (
                  <MaterialIcons
                    name="arrow-back-ios"
                    size={17}
                    color="black"
                  />
                )}
                {returnButtonText && (
                  <Text style={styles.returnButtonText}>
                    {returnButtonText}
                  </Text>
                )}
                {!returnButtonText && Platform.OS == "android" && (
                  <Text style={styles.returnButtonText}>Back</Text>
                )}
              </View>
            </GlassView>
          </Pressable>
        )}
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
            colors={[
              "rgba(255, 255, 255, 0)",
              "rgba(255, 255, 255, 0.7)",
              "rgba(255, 255, 255, 1)",
            ]}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  headerRightButtonContainer: {
    marginRight: 3,
  },
  headerRightButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
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
});
