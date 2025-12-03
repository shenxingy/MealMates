import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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

  const { data, isLoading, refetch: refetchDetails } = useQuery({
    queryKey: ["eventDetails", eventId],
    queryFn: () => fetchDetailedEvent(eventId),
    enabled: !!eventId,
  });

  const emoji = data?.emoji ?? "🍽️";
  const status = data?.status;
  const isStatusSuccess = status === "success";
  const isHost = userId && data?.userId === userId;
  const hasConfirmed = useMemo(() => {
    if (!data || !userId) return false;
    if (data.status === "success") return true;
    if (data.userId === userId) {
      return Boolean(data.hostSuccessConfirmed);
    }
    return Boolean(data.participantSuccessConfirmed);
  }, [data, userId]);

  const fireworksScale = useRef(new Animated.Value(0)).current;
  const [showFireworks, setShowFireworks] = useState(false);

  const triggerFireworks = () => {
    setShowFireworks(true);
    Animated.sequence([
      Animated.timing(fireworksScale, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fireworksScale, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => {
      router.replace("/(App)/(Home)");
    }, 900);
  };

  useEffect(() => {
    if (data?.status === "success" && !showFireworks) {
      triggerFireworks();
    }
  }, [data?.status, showFireworks]);

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
      if (result.status === "success") {
        triggerFireworks();
      } else {
        Alert.alert("Success recorded", "Waiting for the other person to confirm.");
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
    !userId || isStatusSuccess || hasConfirmed || confirmSuccessMutation.isPending;

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
          <ActivityIndicator color={isDark ? "#FBBF24" : "#D97706"} size="large" />
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
      <View style={styles.fullHeightCenter}>
        <Text style={styles.bigEmoji}>{emoji}</Text>
        {showFireworks && (
          <Animated.View
            style={[
              styles.fireworks,
              { transform: [{ scale: fireworksScale }] },
            ]}
          >
            <Text style={styles.fireworksText}>🎆🎇🎆</Text>
          </Animated.View>
        )}
      </View>

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
            {hasConfirmed || isStatusSuccess ? "Waiting..." : "Success"}
          </Text>
        )}
      </Pressable>
    </AnimatedPageFrame>
  );
};

export default EmojiConfirmPage;

const styles = StyleSheet.create({
  fullHeightCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bigEmoji: {
    fontSize: 120,
  },
  fireworks: {
    position: "absolute",
  },
  fireworksText: {
    fontSize: 48,
  },
  confirmButton: {
    marginTop: 24,
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
