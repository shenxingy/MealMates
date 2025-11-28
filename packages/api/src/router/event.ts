import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { and, desc, eq, schema } from "@mealmates/db";

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
      orderBy: desc(schema.event.createdAt),
      limit: 20,
      with: {
        user: true,
      },
    });

    return events.map((row) => {
      const { user, ...eventData } = row;
      return {
        ...eventData,
        username: user.name,
        avatarUrl: user.image,
        avatarColor: user.avatarColor,
      };
    });
  }),

  list: publicProcedure
    .input(z.object({ page: z.number().min(1).default(1) }))
    .query(async ({ ctx, input }) => {
      const pageSize = 20;
      const offset = (input.page - 1) * pageSize;

      const events = await ctx.db.query.event.findMany({
        orderBy: desc(schema.event.createdAt),
        limit: pageSize,
        offset: offset,
        with: {
          user: true,
        },
      });

      return events.map((row) => {
        const { user, ...eventData } = row;
        return {
          ...eventData,
          username: user.name,
          avatarUrl: user.image,
          avatarColor: user.avatarColor,
        };
      });
    }),

  create: publicProcedure
    .input(CreateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const [newEvent] = await ctx.db
        .insert(schema.event)
        .values(input)
        .returning();
      return newEvent;
    }),

  checkJoined: publicProcedure
    .input(z.object({ eventId: z.number(), userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const existingRows = await ctx.db
        .select()
        .from(schema.eventParticipant)
        .where(
          and(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            eq(schema.eventParticipant.eventId, input.eventId),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            eq(schema.eventParticipant.userId, input.userId),
          ),
        )
        .limit(1);

      return { joined: existingRows.length > 0 };
    }),

  join: publicProcedure
    .input(z.object({ eventId: z.number(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingRows = await ctx.db
        .select()
        .from(schema.eventParticipant)
        .where(
          and(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            eq(schema.eventParticipant.eventId, input.eventId),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            eq(schema.eventParticipant.userId, input.userId),
          ),
        )
        .limit(1);

      if (existingRows.length > 0) {
        return { success: true, alreadyJoined: true };
      }

      await ctx.db
        .insert(schema.eventParticipant)
        .values({ eventId: input.eventId, userId: input.userId });

      return { success: true, alreadyJoined: false };
    }),

  leave: publicProcedure
    .input(z.object({ eventId: z.number(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(schema.eventParticipant).where(
        and(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          eq(schema.eventParticipant.eventId, input.eventId),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          eq(schema.eventParticipant.userId, input.userId),
        ),
      );

      return { success: true };
    }),

  cancel: publicProcedure
    .input(z.object({ eventId: z.number(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const targetEvent = await ctx.db.query.event.findFirst({
        where: eq(schema.event.id, input.eventId),
      });

      if (!targetEvent) {
        throw new Error("Event not found");
      }

      if (targetEvent.userId !== input.userId) {
        throw new Error("Not authorized to cancel this event");
      }

      await ctx.db
        .delete(schema.event)
        .where(eq(schema.event.id, input.eventId));
      return { success: true };
    }),
} satisfies TRPCRouterRecord;
