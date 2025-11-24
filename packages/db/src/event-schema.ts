import { relations } from "drizzle-orm";
import { integer, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const event = pgTable("event", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  restaurantName: text("restaurant_name").notNull(),
  scheduleTime: text("schedule_time").notNull(),
  mood: text("mood"),
  message: text("message"),

  restaurantCoordinates: json("restaurant_coordinates")
    .$type<{ latitude: number; longitude: number }>()
    .notNull(),

  meetPointCoordinates: json("meet_point_coordinates")
    .$type<{ latitude: number; longitude: number }>()
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const eventRelations = relations(event, ({ one }) => ({
  user: one(user, {
    fields: [event.userId],
    references: [user.id],
  }),
}));