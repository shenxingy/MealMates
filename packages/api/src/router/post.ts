import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { desc, eq, and } from "@mealmates/db";
import { post, comment, commentLike, postLike, user } from "@mealmates/db/schema";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  image: z.url().min(1)
});

export const postRouter = {
  // all: publicProcedure.query(({ ctx }) => {
  //   return ctx.db.query.post.findMany({
  //     orderBy: desc(post.createdAt),
  //     // limit
  //   });
  // }),

  all: publicProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        id: post.id,
        title: post.title,
        content: post.content,
        image: post.image,
        createdAt: post.createdAt,
        user: user.name
      })
      .from(post)
      .leftJoin(user, eq(post.userId, user.id))
      .orderBy(desc(post.createdAt));
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
          userId: ctx.session.user.id,
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
});

export const postLikeRouter = {
  count: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const likes = await ctx.db.query.postLike.findMany({
        where: eq(postLike.postId, input.postId),
      });
      return likes.length;
    }),
  
  liked: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const like = await ctx.db.query.postLike.findMany({
        where: and(
          eq(postLike.postId, input.postId),
          eq(postLike.userId, ctx.session.user.id)
        )
      });
      return like.length > 0;
    }),

  create: protectedProcedure
    .input(CreatePostLikeSchema)
    .mutation(async ({ ctx, input }) => {
      const newPostLike = await ctx.db
        .insert(postLike)
        .values({
          postId: input.postId,
          userId: ctx.session.user.id,
        })
        .returning();

      return newPostLike[0];
    }),
  
  delete: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .delete(postLike)
        .where(and(
          eq(postLike.postId, input.postId),
          eq(postLike.userId, ctx.session.user.id)
        ));
        return { success: true };
    }),
} satisfies TRPCRouterRecord;

export const CreateCommentLikeSchema = z.object({
  commentId: z.string(),
});

export const commentLikeRouter = {
  count: publicProcedure
    .input(z.object({ commentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const likes = await ctx.db.query.commentLike.findMany({
        where: eq(commentLike.commentId, input.commentId),
      });
      return likes.length;
    }),
  
  liked: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const like = await ctx.db.query.commentLike.findMany({
        where: and(
          eq(commentLike.commentId, input.commentId),
          eq(commentLike.userId, ctx.session.user.id)
        )
      });
      return like.length > 0;
    }),

  create: protectedProcedure
    .input(CreateCommentLikeSchema)
    .mutation(async ({ ctx, input }) => {
      const newCommentLike = await ctx.db
        .insert(commentLike)
        .values({
          commentId: input.commentId,
          userId: ctx.session.user.id,
        })
        .returning();

      return newCommentLike[0];
    }),

  delete: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .delete(commentLike)
        .where(and(
          eq(commentLike.commentId, input.commentId),
          eq(commentLike.userId, ctx.session.user.id)
        ));
        return { success: true };
    }),
} satisfies TRPCRouterRecord;