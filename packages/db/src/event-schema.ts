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

export const eventParticipant = pgTable("event_participant", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventId: integer("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const eventRelations = relations(event, ({ one, many }) => ({
  user: one(user, {
    fields: [event.userId],
    references: [user.id],
  }),
  participants: many(eventParticipant),
}));

export const eventParticipantRelations = relations(
  eventParticipant,
  ({ one }) => ({
    event: one(event, {
      fields: [eventParticipant.eventId],
      references: [event.id],
    }),
    user: one(user, {
      fields: [eventParticipant.userId],
      references: [user.id],
    }),
  }),
);