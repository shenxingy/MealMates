import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { desc } from "@mealmates/db";
import { event } from "@mealmates/db/schema";

import { publicProcedure } from "../trpc";

const CreateEventSchema = z.object({
  userId: z.string(),
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
  all: publicProcedure.query(async ({ ctx }) => {
    const events = await ctx.db.query.event.findMany({
      orderBy: desc(event.createdAt),
      limit: 20,
      with: {
        user: true,
      },
    });

    return events.map((row) => {
      const { user, ...eventData } = row;
      return {
        ...eventData,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        username: user.name,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        avatarUrl: user.image,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        avatarColor: user.avatarColor,
      };
    });
  }),

  create: publicProcedure
    .input(CreateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const [newEvent] = await ctx.db.insert(event).values(input).returning();
      return newEvent;
    }),
} satisfies TRPCRouterRecord;
