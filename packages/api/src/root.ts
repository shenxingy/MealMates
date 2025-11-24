import { authRouter } from "./router/auth";
import { commentRouter, postRouter } from "./router/post";
import { userRouter } from "./router/user";
import { eventRouter } from "./router/event"; 
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  comment: commentRouter,
  user: userRouter,
  event: eventRouter, 
});

// export type definition of API
export type AppRouter = typeof appRouter;
