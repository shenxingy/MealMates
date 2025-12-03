import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { and, eq, sql } from "@mealmates/db";
import {
  account,
  event,
  eventParticipant,
  post,
  user,
  EVENT_STATUS,
} from "@mealmates/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

// Schema for syncing Duke OAuth user data
const DukeUserSyncSchema = z.object({
  sub: z.string(), // Duke NetID (e.g., "xs90@duke.edu")
  email: z.string().email(),
  name: z.string(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  email_verified: z.boolean().optional(),
  dukeNetID: z.string().optional(),
  dukeUniqueID: z.string().optional(),
  dukePrimaryAffiliation: z.string().optional(),
  // OAuth tokens - for server-side operations and multi-device support
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(), // seconds until access token expires
});

export const userRouter = {
  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const userData = await ctx.db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    return userData;
  }),

  // Sync Duke OAuth user data to database
  syncDukeUser: publicProcedure
    .input(DukeUserSyncSchema)
    .mutation(async ({ ctx, input }) => {
      // Extract NetID from sub (e.g., "xs90@duke.edu" -> "xs90")
      const netId = input.dukeNetID ?? input.sub.split("@")[0];

      if (!netId) {
        throw new Error("Could not extract NetID from user data");
      }

      // Use NetID as the user ID for consistency
      const userId: string = netId;

      // Check if user already exists
      const existingUser = await ctx.db.query.user.findFirst({
        where: eq(user.id, userId),
      });

      if (existingUser) {
        // Preserve custom display names that users set inside the app.
        const trimmedExistingName = existingUser.name
          ? existingUser.name.trim()
          : undefined;
        const trimmedIncomingName = input.name.trim();
        const shouldPreserveCustomName =
          !!trimmedExistingName &&
          trimmedExistingName.length > 0 &&
          trimmedExistingName !== trimmedIncomingName;
        const displayName =
          shouldPreserveCustomName && trimmedExistingName
            ? existingUser.name
            : input.name;

        // Update existing user
        await ctx.db
          .update(user)
          .set({
            name: displayName,
            email: input.email,
            emailVerified: input.email_verified ?? false,
            givenName: input.given_name,
            familyName: input.family_name,
            dukeNetID: netId,
            dukeUniqueID: input.dukeUniqueID,
            dukePrimaryAffiliation: input.dukePrimaryAffiliation,
            updatedAt: new Date(),
          })
          .where(eq(user.id, userId));

        // Calculate token expiry times
        const now = new Date();
        const accessTokenExpiresAt = input.expiresIn
          ? new Date(now.getTime() + input.expiresIn * 1000)
          : null;
        // Refresh tokens typically expire in 90 days, but Duke doesn't specify
        const refreshTokenExpiresAt = input.refreshToken
          ? new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days
          : null;

        // Check if account exists
        const existingAccount = await ctx.db.query.account.findFirst({
          where: eq(account.userId, userId),
        });

        if (!existingAccount) {
          // Create account record to track the Duke OAuth provider
          await ctx.db.insert(account).values({
            id: `duke_${netId}_${Date.now()}`,
            accountId: input.sub, // Duke email (xs90@duke.edu)
            providerId: "duke",
            userId: userId,
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
            scope: "openid email profile offline_access",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log(`[USER] Created account record for Duke user: ${netId}`);
        } else {
          // Update tokens in existing account
          await ctx.db
            .update(account)
            .set({
              accessToken: input.accessToken,
              refreshToken: input.refreshToken ?? existingAccount.refreshToken, // Keep old refresh token if not provided
              accessTokenExpiresAt,
              refreshTokenExpiresAt:
                refreshTokenExpiresAt ?? existingAccount.refreshTokenExpiresAt,
              updatedAt: new Date(),
            })
            .where(eq(account.id, existingAccount.id));
          console.log(`[USER] Updated tokens for Duke user: ${netId}`);
        }

        console.log(`[USER] Updated existing Duke user: ${netId}`);

        const updatedUser = {
          ...existingUser,
          name: displayName,
          email: input.email,
          emailVerified: input.email_verified ?? false,
          givenName: input.given_name,
          familyName: input.family_name,
          dukeNetID: netId,
          dukeUniqueID: input.dukeUniqueID,
          dukePrimaryAffiliation: input.dukePrimaryAffiliation,
        };

        return {
          success: true,
          isNewUser: false,
          user: updatedUser,
        };
      } else {
        // Create new user
        const newUserData = {
          id: userId,
          name: input.name,
          email: input.email,
          emailVerified: input.email_verified ?? false,
          givenName: input.given_name,
          familyName: input.family_name,
          dukeNetID: netId,
          dukeUniqueID: input.dukeUniqueID,
          dukePrimaryAffiliation: input.dukePrimaryAffiliation,
        };

        await ctx.db.insert(user).values(newUserData);

        // Calculate token expiry times
        const now = new Date();
        const accessTokenExpiresAt = input.expiresIn
          ? new Date(now.getTime() + input.expiresIn * 1000)
          : null;
        // Refresh tokens typically expire in 90 days, but Duke doesn't specify
        const refreshTokenExpiresAt = input.refreshToken
          ? new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days
          : null;

        // Create account record to track the Duke OAuth provider
        await ctx.db.insert(account).values({
          id: `duke_${netId}_${Date.now()}`,
          accountId: input.sub, // Duke email (xs90@duke.edu)
          providerId: "duke",
          userId: userId,
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          scope: "openid email profile offline_access",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`[USER] Created new Duke user: ${netId}`);
        console.log(`[USER] Created account record for Duke user: ${netId}`);

        return {
          success: true,
          isNewUser: true,
          user: newUserData,
        };
      }
    }),

  // Get user by ID (useful for profile pages)
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.user.findFirst({
        where: eq(user.id, input.id),
      });
    }),

  profileStats: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [{ count: invitationsRaw }] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(event)
        .where(
          and(
            eq(event.userId, input.userId),
            eq(event.status, EVENT_STATUS.SUCCESS),
          ),
        );

      const [{ count: acceptancesRaw }] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(eventParticipant)
        .innerJoin(event, eq(eventParticipant.eventId, event.id))
        .where(
          and(
            eq(eventParticipant.userId, input.userId),
            eq(event.status, EVENT_STATUS.SUCCESS),
          ),
        );

      const [{ count: postsRaw }] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(post)
        .where(eq(post.userId, input.userId));

      return {
        invitations: Number(invitationsRaw) || 0,
        acceptances: Number(acceptancesRaw) || 0,
        posts: Number(postsRaw) || 0,
      };
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        image: z.string().optional(),
        avatarColor: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .update(user)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      return { success: true };
    }),

  updateProfileById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        image: z.string().optional(),
        avatarColor: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, image, avatarColor } = input;
      const updates: {
        name?: string;
        image?: string | null;
        avatarColor?: string;
        updatedAt?: Date;
      } = {};

      if (typeof name === "string") {
        updates.name = name;
      }

      if (typeof image === "string") {
        updates.image = image.length > 0 ? image : null;
      }

      if (typeof avatarColor === "string") {
        updates.avatarColor = avatarColor;
      }

      if (Object.keys(updates).length === 0) {
        return { success: false, user: null };
      }

      updates.updatedAt = new Date();

      const [updatedUser] = await ctx.db
        .update(user)
        .set(updates)
        .where(eq(user.id, id))
        .returning();

      return {
        success: !!updatedUser,
        user: updatedUser ?? null,
      };
    }),
} satisfies TRPCRouterRecord;
