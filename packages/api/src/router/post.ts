import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { desc, eq } from "@mealmates/db";
import { post, comment, commentLike, postLike } from "@mealmates/db/schema";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const CreatePostSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  image: z.url().min(1)
});

export const postRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.post.findMany({
      orderBy: desc(post.createdAt),
      // limit
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
          userId: input.userId,
          title: input.title,
          content: input.content,
          image: input.image,
          createdAt: new Date()
        })
        .returning();

      return newPost[0];
    }),

  // delete: protectedProcedure
  //   .input(z.string())
  //   .mutation(({ ctx, input }) => {
  //     return ctx.db.delete(post).where(eq(post.id, input));
  //   }),
} satisfies TRPCRouterRecord;

export const CreateCommentSchema = z.object({
  postId: z.string(),
  userId: z.string(),
  content: z.string().optional(),
  image: z.url().optional(),
});

export const commentRouter = {
  byPost: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.comment.findMany({
        where: eq(comment.postId, input.postId),
        orderBy: desc(comment.createdAt),
      });
    }),

  create: protectedProcedure
    .input(CreateCommentSchema)
    .mutation(async ({ ctx, input }) => {
      const newComment = await ctx.db
        .insert(comment)
        .values({
          id: crypto.randomUUID(),
          userId: input.userId,
          postId: input.postId,
          content: input.content,
          image: input.image,
          createdAt: new Date()
        })
        .returning();

      return newComment[0];
    }),
} satisfies TRPCRouterRecord;

export const CreatePostLikeSchema = z.object({
  postId: z.string(),
  userId: z.string(),
});

export const postLikeRouter = {
  count: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.comment.findMany({
      orderBy: desc(comment.createdAt),
      // limit
    });
  }),

  create: protectedProcedure
    .input(CreatePostLikeSchema)
    .mutation(async ({ ctx, input }) => {
      const newPostLike = await ctx.db
        .insert(postLike)
        .values({
          postId: input.postId,
          userId: input.userId,
        })
        .returning();

      return newPostLike[0];
    }),
} satisfies TRPCRouterRecord;

export const CreateCommentLikeSchema = z.object({
  commentId: z.string(),
  userId: z.string(),
});

export const commentLikeRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.comment.findMany({
      orderBy: desc(comment.createdAt),
      // limit
    });
  }),

  create: protectedProcedure
    .input(CreateCommentLikeSchema)
    .mutation(async ({ ctx, input }) => {
      const newCommentLike = await ctx.db
        .insert(commentLike)
        .values({
          commentId: input.commentId,
          userId: input.userId,
        })
        .returning();

      return newCommentLike[0];
    }),
} satisfies TRPCRouterRecord;