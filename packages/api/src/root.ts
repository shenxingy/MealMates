import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { userRouter } from "./router/user";
import { eventRouter } from "./router/event"; // 导入 eventRouter
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  user: userRouter,
  event: eventRouter, // 注册
});

// export type definition of API
export type AppRouter = typeof appRouter;
