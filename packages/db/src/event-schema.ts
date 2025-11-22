import { integer, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const event = pgTable("event", {
  id: serial("id").primaryKey(),
  hostId: text("host_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  // Restaurant details
  restaurantName: text("restaurant_name").notNull(),
  restaurantLat: real("restaurant_lat"),
  restaurantLong: real("restaurant_long"),
  // Meeting point details
  meetPoint: text("meet_point").notNull(),
  meetPointLat: real("meet_point_lat"),
  meetPointLong: real("meet_point_long"),
  scheduleTime: text("schedule_time").notNull(),
  maxParticipants: integer("max_participants").default(4).notNull(),
  description: text("description"),
  message: text("message"),
  mood: text("mood"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
