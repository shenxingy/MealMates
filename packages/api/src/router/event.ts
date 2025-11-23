import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { desc } from "@mealmates/db";
import { event } from "@mealmates/db/schema";

import { publicProcedure } from "../trpc";

const CreateEventSchema = z.object({
  userId: z.string(),
  username: z.string(),
  avatarUrl: z.string().nullable().optional(),
  avatarColor: z.string().optional(),
  restaurantName: z.string(),
  scheduleTime: z.string(),
  mood: z.string().optional(),
  message: z.string().optional(),
  restaurantCoordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  meetPointCoordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export const eventRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.event.findMany({
      orderBy: desc(event.createdAt),
      limit: 20,
    });
  }),

  create: publicProcedure
    .input(CreateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const [newEvent] = await ctx.db.insert(event).values(input).returning();
      return newEvent;
    }),
} satisfies TRPCRouterRecord;
