import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { desc, eq } from "@mealmates/db";
import { post } from "@mealmates/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  image: z.url(),
});

export const postRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.post.findMany({
      orderBy: desc(post.id),
      limit: 10,
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.post.findFirst({
        where: eq(post.id, input.id),
      });
    }),

  create: protectedProcedure
    .input(CreatePostSchema)
    .mutation(async ({ ctx, input }) => {
      const newPost = await ctx.db
        .insert(post)
        .values({
          id: crypto.randomUUID(),
          userId: ctx.session.user.id,
          title: input.title,
          content: input.content,
          image: input.image,
        })
        .returning();

      return newPost[0];
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(post).where(eq(post.id, input));
  }),
} satisfies TRPCRouterRecord;
