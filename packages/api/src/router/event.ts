import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { and, asc, desc, eq, or, schema, sql } from "@mealmates/db";
import { EVENT_STATUS } from "@mealmates/db/schema";

import { publicProcedure } from "../trpc";

const EVENT_EMOJI_CHOICES = [
  "🍣",
  "🍜",
  "🥡",
  "🍕",
  "🍝",
  "🥗",
  "🍔",
  "🌮",
  "🥪",
  "🍩",
  "🍪",
  "🍰",
  "🍦",
  "🍫",
  "☕",
  "🧋",
  "🍹",
];

const OPEN_EVENT_STATUSES = [EVENT_STATUS.WAITING, EVENT_STATUS.JOINED] as const;

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
      where: or(
        ...OPEN_EVENT_STATUSES.map((status) =>
          eq(schema.event.status, status),
        ),
      ),
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
        status: eventData.status ?? EVENT_STATUS.WAITING,
        emoji: eventData.emoji ?? "🍽️",
        username: user.name,
        avatarUrl: user.image,
        avatarColor: user.avatarColor,
      };
    });
  }),

  list: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const pageSize = 20;
      const offset = (input.page - 1) * pageSize;

      const events = await ctx.db.query.event.findMany({
        where: or(
          ...OPEN_EVENT_STATUSES.map((status) =>
            eq(schema.event.status, status),
          ),
        ),
        orderBy: ctx.session && ctx.session.user?.id
          ? [
              sql`CASE WHEN ${schema.event.userId} = ${ctx.session.user.id} THEN 0 ELSE 1 END`,
              desc(schema.event.createdAt),
            ]
          : desc(schema.event.createdAt),
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
          status: eventData.status ?? EVENT_STATUS.WAITING,
          emoji: eventData.emoji ?? "🍽️",
          username: user.name,
          avatarUrl: user.image,
          avatarColor: user.avatarColor,
        };
      });
    }),

  create: publicProcedure
    .input(CreateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const emojiIndex = Math.floor(Math.random() * EVENT_EMOJI_CHOICES.length);
      const selectedEmoji =
        EVENT_EMOJI_CHOICES[emojiIndex] ?? "🍽️";

      const [newEvent] = await ctx.db
        .insert(schema.event)
        .values({
          ...input,
          emoji: selectedEmoji,
          status: EVENT_STATUS.WAITING,
          hostSuccessConfirmed: false,
          participantSuccessConfirmed: false,
        })
        .returning();
      return newEvent;
    }),

  confirmSuccess: publicProcedure
    .input(z.object({ eventId: z.number(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const targetEvent = await ctx.db.query.event.findFirst({
        where: eq(schema.event.id, input.eventId),
      });

      if (!targetEvent) {
        throw new Error("Event not found");
      }

      const isHost = targetEvent.userId === input.userId;

      // If participant, ensure they actually joined
      if (!isHost) {
        const participant = await ctx.db.query.eventParticipant.findFirst({
          where: and(
            eq(schema.eventParticipant.eventId, input.eventId),
            eq(schema.eventParticipant.userId, input.userId),
          ),
        });
        if (!participant) {
          throw new Error("You must join the event before confirming success.");
        }
      }

      const nextHostConfirmed =
        targetEvent.hostSuccessConfirmed || isHost ? true : false;
      const nextParticipantConfirmed =
        targetEvent.participantSuccessConfirmed || !isHost ? true : false;

      const shouldMarkSuccess =
        nextHostConfirmed &&
        nextParticipantConfirmed &&
        targetEvent.status !== EVENT_STATUS.DELETED;

      const [updated] = await ctx.db
        .update(schema.event)
        .set({
          hostSuccessConfirmed: nextHostConfirmed,
          participantSuccessConfirmed: nextParticipantConfirmed,
          status: shouldMarkSuccess ? EVENT_STATUS.SUCCESS : targetEvent.status,
          updatedAt: new Date(),
        })
        .where(eq(schema.event.id, input.eventId))
        .returning();

      if (!updated) {
        throw new Error("Failed to update event status");
      }

      return {
        success: true,
        status: updated.status,
        hostSuccessConfirmed: updated.hostSuccessConfirmed,
        participantSuccessConfirmed: updated.participantSuccessConfirmed,
      };
    }),

  checkJoined: publicProcedure
    .input(z.object({ eventId: z.number(), userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const existingRows = await ctx.db
        .select()
        .from(schema.eventParticipant)
        .where(
          and(
            eq(schema.eventParticipant.eventId, input.eventId),
            eq(schema.eventParticipant.userId, input.userId),
          ),
        )
        .limit(1);

      return { joined: existingRows.length > 0 };
    }),

  participants: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      const participants = await ctx.db.query.eventParticipant.findMany({
        where: eq(schema.eventParticipant.eventId, input.eventId),
        with: {
          user: true,
        },
        orderBy: asc(schema.eventParticipant.joinedAt),
      });

      return participants.map((participant) => ({
        id: participant.id,
        userId: participant.userId,
        name: participant.user?.name ?? "Unknown",
        avatarUrl: participant.user?.image ?? null,
        avatarColor: participant.user?.avatarColor ?? "#F5F7FB",
        joinedAt: participant.joinedAt?.toISOString() ?? null,
      }));
    }),

  join: publicProcedure
    .input(z.object({ eventId: z.number(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingRows = await ctx.db
        .select()
        .from(schema.eventParticipant)
        .where(
          and(
            eq(schema.eventParticipant.eventId, input.eventId),
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
      await ctx.db
        .delete(schema.eventParticipant)
        .where(
          and(
            eq(schema.eventParticipant.eventId, input.eventId),
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
