import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchDetailedEvent, trpcClient } from "~/utils/api";
import { getStoredUserId } from "~/utils/user-storage";
import AnimatedPageFrame from "../../../../../../components/frame/AnimatedPageFrame";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FireworkParticle {
  id: number;
  emoji: string;
  anim: Animated.Value;
  delay: number;
  duration: number;
  startX: number;
  startY: number;
  endXDelta: number;
  rotateStart: string;
  rotateEnd: string;
  scale: number;
}

interface EventParticipant {
  id: number;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  avatarColor: string | null;
  successConfirmed: boolean;
}

interface EventDetails {
  id: number;
  userId: string;
  status: string;
  emoji: string;
  hostSuccessConfirmed: boolean;
  participantSuccessConfirmed: boolean;
  participants: EventParticipant[];
}

const PARTICLE_COUNT = 80;

const createParticles = (eventEmoji: string): FireworkParticle[] => {
  const emojis = ["🎉", "✨", "🎊", eventEmoji];
  return Array.from({ length: PARTICLE_COUNT }).map((_, idx) => {
    const startX = Math.random() * SCREEN_WIDTH;
    const startY = -Math.random() * (SCREEN_HEIGHT * 0.5) - 50;
    const endXDelta = (Math.random() - 0.5) * 100;

    return {
      id: idx,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      anim: new Animated.Value(0),
      delay: Math.random() * 1500,
      duration: 2500 + Math.random() * 1500,
      startX,
      startY,
      endXDelta,
      rotateStart: `${Math.random() * 360}deg`,
      rotateEnd: `${Math.random() * 360 + 360 * (Math.random() > 0.5 ? 1 : -1)}deg`,
      scale: 0.8 + Math.random() * 0.7,
    };
  });
};

const EmojiConfirmPage = () => {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const baseColor = isDark ? "70,70,70" : "255,140,0";

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    void getStoredUserId().then(setUserId).catch(console.error);
  }, []);

  const {
    data,
    isLoading,
    refetch: refetchDetails,
  } = useQuery<EventDetails | null>({
    queryKey: ["eventDetails", eventId],
    queryFn: async () => {
      const response = await fetchDetailedEvent(eventId);
      return response as EventDetails;
    },
    enabled: !!eventId,
  });

  const eventEmoji = data?.emoji ?? "🍽️";
  const status = data?.status;
  const isStatusSuccess = status === "success";
  const participantConfirm = useMemo(() => {
    if (!data || !userId) {
      return { hasConfirmed: false, isHost: false };
    }
    if (data.status === "success") {
      return { hasConfirmed: true, isHost: data.userId === userId };
    }
    if (data.userId === userId) {
      return { hasConfirmed: Boolean(data.hostSuccessConfirmed), isHost: true };
    }
    const participantRecord = data.participants.find(
      (p) => p.userId === userId,
    );
    return {
      hasConfirmed: Boolean(participantRecord?.successConfirmed),
      isHost: false,
    };
  }, [data, userId]);

  const canUserConfirm = useMemo(() => {
    if (!data || !userId) return false;
    if (data.userId === userId) return true;
    return Boolean(
      data.participants.some((participant) => participant.userId === userId),
    );
  }, [data, userId]);

  // --- Fireworks Rain Animation Logic ---
  const [showFireworks, setShowFireworks] = useState(false);
  const [fireworksRain, setFireworksRain] = useState<FireworkParticle[]>([]);
  const hasNavigated = useRef(false);

  useEffect(() => {
    setFireworksRain(createParticles(eventEmoji));
  }, [eventEmoji]);

  const triggerFireworks = useCallback(() => {
    setShowFireworks(true);

    const animations = fireworksRain.map((item) => {
      item.anim.setValue(0);
      return Animated.timing(item.anim, {
        toValue: 1,
        duration: item.duration,
        delay: item.delay,
        useNativeDriver: true, // Important for performance
      });
    });

    Animated.parallel(animations).start(() => {
      if (hasNavigated.current) {
        return;
      }
      hasNavigated.current = true;
      setShowFireworks(false);
      router.replace("/(App)/(Home)");
    });
  }, [fireworksRain, router]);

  useEffect(() => {
    // Trigger automatically if status is already success on load
    if (data?.status === "success" && !showFireworks) {
      triggerFireworks();
    }
  }, [data?.status, showFireworks, triggerFireworks]);

  const confirmSuccessMutation = useMutation({
    mutationFn: async () => {
      if (!eventId || !userId) {
        throw new Error("Missing event or user ID");
      }
      return await trpcClient.event.confirmSuccess.mutate({
        eventId: Number(eventId),
        userId,
      });
    },
    onSuccess: async (result) => {
      void queryClient.invalidateQueries({
        queryKey: ["eventDetails", eventId],
      });
      await refetchDetails();
      // Trigger animation if this action completed the success state
      if (result.status === "success") {
        triggerFireworks();
      } else {
        Alert.alert(
          participantConfirm.hasConfirmed
            ? "Success removed"
            : "Success recorded",
          "Waiting for everyone to confirm.",
        );
      }
    },
    onError: (error: unknown) => {
      console.error("[EMOJI CONFIRM] Failed to confirm success:", error);
      Alert.alert("Error", "Could not record success. Please try again.");
    },
  });

  const handleConfirm = () => {
    confirmSuccessMutation.mutate();
  };

  const disableButton =
    !userId ||
    !canUserConfirm ||
    isStatusSuccess ||
    confirmSuccessMutation.isPending;

  if (isLoading) {
    return (
      <AnimatedPageFrame
        baseColor={baseColor}
        headerTitle="Event Emoji"
        enableReturnButton
        returnButtonText="Back"
        scrollEnabled={false}
      >
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            color={isDark ? "#FBBF24" : "#D97706"}
            size="large"
          />
        </View>
      </AnimatedPageFrame>
    );
  }

  return (
    <AnimatedPageFrame
      baseColor={baseColor}
      headerTitle="Event Emoji"
      enableReturnButton
      returnButtonText="Back"
    >
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.bigEmoji}>{eventEmoji}</Text>
        </View>

        {showFireworks && (
          // Full screen overlay that ignores pointer events
          <View style={styles.fireworksOverlay} pointerEvents="none">
            {fireworksRain.map((item) => {
              const translateY = item.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [item.startY, SCREEN_HEIGHT + 100], // Fall past screen bottom
              });
              const translateX = item.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [item.startX, item.startX + item.endXDelta],
              });
              const rotate = item.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [item.rotateStart, item.rotateEnd],
              });
              const opacity = item.anim.interpolate({
                inputRange: [0, 0.8, 1], // Fade out near the end
                outputRange: [1, 1, 0],
              });

              return (
                <Animated.Text
                  key={item.id}
                  style={[
                    styles.fireworkParticle,
                    {
                      transform: [
                        { translateX },
                        { translateY },
                        { rotate },
                        { scale: item.scale },
                      ],
                      opacity,
                    },
                  ]}
                >
                  {item.emoji}
                </Animated.Text>
              );
            })}
          </View>
        )}

        <Pressable
          style={[
            styles.confirmButton,
            disableButton && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={disableButton}
        >
          {confirmSuccessMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmText}>
              {isStatusSuccess
                ? "Waiting..."
                : participantConfirm.hasConfirmed
                  ? "Undo Success"
                  : "Success"}
            </Text>
          )}
        </Pressable>
      </View>
    </AnimatedPageFrame>
  );
};

export default EmojiConfirmPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Ensure button is at bottom
    justifyContent: "space-between",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bigEmoji: {
    fontSize: 120,
  },
  // New styles for the rain animation
  fireworksOverlay: {
    ...StyleSheet.absoluteFillObject, // Covers entire screen
    zIndex: 10, // Ensure it's on top
    elevation: 10,
  },
  fireworkParticle: {
    position: "absolute",
    top: 0,
    left: 0,
    fontSize: 28, // Good size for particles
  },
  confirmButton: {
    marginBottom: 34, // Space from bottom safe area
    marginHorizontal: 16,
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
