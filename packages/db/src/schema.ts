<<<<<<< HEAD
export * from "./auth-schema";
export * from "./event-schema";
export * from "./post-schema";
=======
import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const Post = pgTable("post", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  image: t.text(),
  createdAt: t.timestamp().defaultNow().notNull(),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
});

export * from "./auth-schema";
export * from "./event-schema";
>>>>>>> dev
