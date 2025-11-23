import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { searchRouter } from "./router/search";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  search: searchRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
