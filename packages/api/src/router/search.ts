import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { desc, ilike, or } from "@mealmates/db";
import { event, post } from "@mealmates/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const searchRouter = {
  globalSearch: publicProcedure
    .input(
      z.object({
        query: z.string(),
        type: z.enum(["all", "events", "posts"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const trimmedQuery = input.query.trim();

      if (trimmedQuery.length === 0) {
        return [];
      }

      const pattern = `%${trimmedQuery}%`;
      const shouldSearchEvents = ["all", "events"].includes(input.type);
      const shouldSearchPosts = ["all", "posts"].includes(input.type);

      const results: (
        | ({ type: "event" } & typeof event.$inferSelect)
        | ({ type: "post" } & typeof post.$inferSelect)
      )[] = [];

      if (shouldSearchEvents) {
        const events = await ctx.db
          .select()
          .from(event)
          .where(
            or(
              ilike(event.message, pattern),
              ilike(event.restaurantName, pattern),
              ilike(event.scheduleTime, pattern),
              ilike(event.mood, pattern),
              ilike(event.userId, pattern),
            ),
          )
          .orderBy(desc(event.createdAt))
          .limit(30);

        results.push(
          ...events.map((row) => ({
            type: "event" as const,
            ...row,
          })),
        );
      }

      if (shouldSearchPosts) {
        const posts = await ctx.db
          .select()
          .from(post)
          .where(or(ilike(post.title, pattern), ilike(post.content, pattern)))
          .orderBy(desc(post.createdAt))
          .limit(30);

        results.push(
          ...posts.map((row) => ({
            type: "post" as const,
            ...row,
          })),
        );
      }

      return results;
    }),

  // Call AI Agent
  genWithAI: protectedProcedure
    .input(z.any())
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await fetch("http://localhost:8080/events/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error(`AI service returned ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("AI service request failed:", error);
        throw new Error("Failed to generate event with AI");
      }
    }),
} satisfies TRPCRouterRecord;
