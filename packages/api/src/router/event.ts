import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { desc } from "@mealmates/db";
import { event } from "@mealmates/db/schema";

// 1. 恢复导入 publicProcedure
import { publicProcedure } from "../trpc";

// 定义创建 Event 的 Schema，与前端传来的数据结构对应
const CreateEventSchema = z.object({
  username: z.string(),
  // avatarUrl 可以是 null, undefined, 或 string
  avatarUrl: z.string().nullable().optional(),
  restaurantName: z.string(),
  meetPoint: z.string(),
  scheduleTime: z.string(),
  mood: z.string().optional(),
  message: z.string().optional(),
  meetPointCoordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  restaurantCoordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export const eventRouter = {
  // 获取所有 Events (对应 mock 的 list)
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.event.findMany({
      orderBy: desc(event.createdAt),
      limit: 20,
    });
  }),

  // 创建 Event
  create: publicProcedure // 暂时用 publicProcedure 方便调试，实际上线建议用 protectedProcedure
    .input(CreateEventSchema)
    .mutation(async ({ ctx, input }) => {
      // 插入数据库
      const [newEvent] = await ctx.db.insert(event).values(input).returning();
      return newEvent;
    }),

} satisfies TRPCRouterRecord;
