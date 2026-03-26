import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { and, asc, desc, eq, or, schema, sql } from "@mealmates/db";
import { EVENT_STATUS } from "@mealmates/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

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

const OPEN_EVENT_STATUSES = [
  EVENT_STATUS.WAITING,
  EVENT_STATUS.JOINED,
] as const;

const CreateEventSchema = z.object({
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
        ...OPEN_EVENT_STATUSES.map((status) => eq(schema.event.status, status)),
      ),
      orderBy: desc(schema.event.createdAt),
      limit: 20,
      with: {
        user: true,
      },
    });

    return events.map(({ user, ...eventData }) => ({
      ...eventData,
      status: eventData.status,
      emoji: eventData.emoji,
      username: user.name,
      avatarUrl: user.image,
      avatarColor: user.avatarColor,
    }));
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

      const sessionUserId = ctx.session?.user.id;

      const events = await ctx.db.query.event.findMany({
        where: or(
          ...OPEN_EVENT_STATUSES.map((status) =>
            eq(schema.event.status, status),
          ),
        ),
        orderBy: sessionUserId
          ? [
              sql`CASE WHEN ${schema.event.userId} = ${sessionUserId} THEN 0 ELSE 1 END`,
              desc(schema.event.createdAt),
            ]
          : desc(schema.event.createdAt),
        limit: pageSize,
        offset: offset,
        with: {
          user: true,
        },
      });

      return events.map(({ user, ...eventData }) => ({
        ...eventData,
        status: eventData.status,
        emoji: eventData.emoji,
        username: user.name,
        avatarUrl: user.image,
        avatarColor: user.avatarColor,
      }));
    }),

  create: protectedProcedure
    .input(CreateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const emojiIndex = Math.floor(Math.random() * EVENT_EMOJI_CHOICES.length);
      const selectedEmoji = EVENT_EMOJI_CHOICES[emojiIndex] ?? "🍽️";

      const [newEvent] = await ctx.db
        .insert(schema.event)
        .values({
          ...input,
          userId: ctx.session.user.id,
          emoji: selectedEmoji,
          status: EVENT_STATUS.WAITING,
          hostSuccessConfirmed: false,
          participantSuccessConfirmed: false,
        })
        .returning();
      return newEvent;
    }),

  confirmSuccess: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const targetEvent = await ctx.db.query.event.findFirst({
        where: eq(schema.event.id, input.eventId),
        with: {
          participants: true,
        },
      });

      if (!targetEvent) {
        throw new Error("Event not found");
      }

      const isHost = targetEvent.userId === userId;

      // If participant, ensure they actually joined
      const participant = targetEvent.participants.find(
        (p) => p.userId === userId,
      );
      if (!isHost && !participant) {
        throw new Error("You must join the event before confirming success.");
      }

      const toggledParticipants = targetEvent.participants.map((p) => {
        if (p.userId !== userId) return p;
        return { ...p, successConfirmed: !p.successConfirmed };
      });

      if (!isHost && participant) {
        await ctx.db
          .update(schema.eventParticipant)
          .set({ successConfirmed: !participant.successConfirmed })
          .where(eq(schema.eventParticipant.id, participant.id));
      }

      const nextHostConfirmed = isHost
        ? !targetEvent.hostSuccessConfirmed
        : targetEvent.hostSuccessConfirmed;

      const allParticipantsConfirmed =
        toggledParticipants.length > 0 &&
        toggledParticipants.every((p) => p.successConfirmed);

      const shouldMarkSuccess =
        nextHostConfirmed &&
        allParticipantsConfirmed &&
        toggledParticipants.length > 0 &&
        targetEvent.status !== EVENT_STATUS.DELETED;

      const nextStatus = shouldMarkSuccess
        ? EVENT_STATUS.SUCCESS
        : toggledParticipants.length > 0
          ? EVENT_STATUS.JOINED
          : EVENT_STATUS.WAITING;

      const [updated] = await ctx.db
        .update(schema.event)
        .set({
          hostSuccessConfirmed: nextHostConfirmed,
          participantSuccessConfirmed: allParticipantsConfirmed,
          status: nextStatus,
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

  checkJoined: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const existingRows = await ctx.db
        .select()
        .from(schema.eventParticipant)
        .where(
          and(
            eq(schema.eventParticipant.eventId, input.eventId),
            eq(schema.eventParticipant.userId, userId),
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
        name: participant.user.name,
        avatarUrl: participant.user.image,
        avatarColor: participant.user.avatarColor,
        successConfirmed: participant.successConfirmed,
        joinedAt: participant.joinedAt.toISOString(),
      }));
    }),

  join: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const existingRows = await ctx.db
        .select()
        .from(schema.eventParticipant)
        .where(
          and(
            eq(schema.eventParticipant.eventId, input.eventId),
            eq(schema.eventParticipant.userId, userId),
          ),
        )
        .limit(1);

      if (existingRows.length > 0) {
        return { success: true, alreadyJoined: true };
      }

      await ctx.db
        .insert(schema.eventParticipant)
        .values({ eventId: input.eventId, userId });

      await ctx.db
        .update(schema.event)
        .set({
          status: EVENT_STATUS.JOINED,
          hostSuccessConfirmed: false,
          participantSuccessConfirmed: false,
        })
        .where(
          and(
            eq(schema.event.id, input.eventId),
            or(
              eq(schema.event.status, EVENT_STATUS.WAITING),
              eq(schema.event.status, EVENT_STATUS.JOINED),
            ),
          ),
        );

      return { success: true, alreadyJoined: false };
    }),

  leave: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.db
        .delete(schema.eventParticipant)
        .where(
          and(
            eq(schema.eventParticipant.eventId, input.eventId),
            eq(schema.eventParticipant.userId, userId),
          ),
        );

      const remaining = await ctx.db.query.eventParticipant.findMany({
        where: eq(schema.eventParticipant.eventId, input.eventId),
        limit: 1,
      });

      await ctx.db
        .update(schema.event)
        .set({
          status:
            remaining.length > 0 ? EVENT_STATUS.JOINED : EVENT_STATUS.WAITING,
          hostSuccessConfirmed: false,
          participantSuccessConfirmed: false,
          updatedAt: new Date(),
        })
        .where(eq(schema.event.id, input.eventId));

      return { success: true };
    }),

  cancel: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const targetEvent = await ctx.db.query.event.findFirst({
        where: eq(schema.event.id, input.eventId),
      });

      if (!targetEvent) {
        throw new Error("Event not found");
      }

      if (targetEvent.userId !== userId) {
        throw new Error("Not authorized to cancel this event");
      }

      await ctx.db
        .update(schema.event)
        .set({
          status: EVENT_STATUS.DELETED,
          updatedAt: new Date(),
        })
        .where(eq(schema.event.id, input.eventId));
      return { success: true };
    }),
} satisfies TRPCRouterRecord;
