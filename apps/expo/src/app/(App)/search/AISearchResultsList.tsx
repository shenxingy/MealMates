import type { ElementType } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useMutation } from "@tanstack/react-query";

import { trpcClient } from "~/utils/api";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";

interface AIRestaurantRecommendation {
  restaurant_name: string;
  recommendation_rating: number;
  main_dishes: string;
  short_reason: string;
}

interface AISearchPayload {
  user_id: string;
  username: string;
  user_prompt: string;
}

interface AISearchResultsListProps {
  query: string;
  shouldTrigger: boolean;
  onTriggerComplete: () => void;
  userId: string;
  username: string;
}

const AISearchResultsList: ElementType<AISearchResultsListProps> = ({
  query,
  shouldTrigger,
  onTriggerComplete,
  userId,
  username,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {data, mutate, isPending, isError } = useMutation({
    mutationFn: (payload: AISearchPayload) =>
      trpcClient.search.genWithAI.mutate(payload),
    onSuccess: () => {
      onTriggerComplete();
    },
    onError: () => {
      onTriggerComplete();
    },
  });

  // Trigger query when shouldTrigger becomes true
  if (shouldTrigger && !isPending) {
    const payload: AISearchPayload = {
      user_id: userId,
      username: username,
      user_prompt: query,
    };
    mutate(payload);
  }

  if (!shouldTrigger && !data) {
    return null;
  }

  if (isPending) {
    return (
      <View style={styles.messageContainer}>
        <ActivityIndicator size="small" color={isDark ? "rgba(255, 255, 255, 0.85)" : "#0F172A"} />
        <Text style={[styles.messageText, isDark && styles.messageTextDark]}>
          AI is analyzing your search...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.messageContainer}>
        <Text style={[styles.messageText, isDark && styles.messageTextDark]}>
          AI search error. Please try again later.
        </Text>
      </View>
    );
  }

  // Parse JSON string from response field
  let recommendations: AIRestaurantRecommendation[] | null = null;
  
  if (data && typeof data === 'object' && 'response' in data && typeof (data as { response: string }).response === 'string') {
    try {
      const responseString = (data as { response: string }).response;
      const parsed = JSON.parse(responseString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        recommendations = parsed as AIRestaurantRecommendation[];
      }
    } catch (error) {
      console.error("[AI Search] Failed to parse response JSON:", error);
    }
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <View style={styles.messageContainer}>
        <Text style={[styles.messageText, isDark && styles.messageTextDark]}>
          No AI recommendations found
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerText, isDark && styles.headerTextDark]}>
          AI Recommendations
        </Text>
        <Text style={[styles.subheaderText, isDark && styles.subheaderTextDark]}>
          Recommended based on your search
        </Text>
      </View>
      <View style={styles.listContent}>
        {recommendations.map((item, index) => (
          <GlassView key={index} style={isLiquidGlassAvailable() ? styles.glassCard : [styles.card, isDark && styles.cardDark]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.restaurantName, isDark && styles.restaurantNameDark]}>
                {item.restaurant_name}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={[styles.ratingText, isDark && styles.ratingTextDark]}>
                  ⭐ {item.recommendation_rating.toFixed(1)}
                </Text>
              </View>
            </View>
            <Text style={[styles.mainDishes, isDark && styles.mainDishesDark]}>
              Signature Dish: {item.main_dishes}
            </Text>
            <Text style={[styles.reason, isDark && styles.reasonDark]}>
              {item.short_reason}
            </Text>
          </GlassView>
        ))}
      </View>
    </View>
  );
};

export default AISearchResultsList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  headerContainer: {
    marginBottom: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  headerTextDark: {
    color: "rgba(255, 255, 255, 0.95)",
  },
  subheaderText: {
    fontSize: 14,
    color: "#6B7280",
  },
  subheaderTextDark: {
    color: "#9CA3AF",
  },
  listContent: {
    gap: 12,
  },
  glassCard: {
    borderRadius: 16,
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: "rgba(45, 45, 45, 0.9)",
    borderColor: "rgba(75, 75, 75, 0.8)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
  },
  restaurantNameDark: {
    color: "rgba(255, 255, 255, 0.95)",
  },
  ratingContainer: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F59E0B",
  },
  ratingTextDark: {
    color: "#FCD34D",
  },
  mainDishes: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  mainDishesDark: {
    color: "#9CA3AF",
  },
  reason: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  reasonDark: {
    color: "rgba(255, 255, 255, 0.75)",
  },
  messageContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  messageText: {
    fontSize: 15,
    color: "#1F2937",
  },
  messageTextDark: {
    color: "rgba(255, 255, 255, 0.85)",
  },
});

