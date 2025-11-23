import { integer, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const event = pgTable("event", {
  // 改用 integer().primaryKey().generatedAlwaysAsIdentity()
  // 这样生成的 SQL 就是 "id integer generated always as identity primary key"
  // 而不是 "id serial primary key"
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  scheduleTime: text("schedule_time").notNull(),
  mood: text("mood"),
  meetPoint: text("meet_point").notNull(),
  restaurantName: text("restaurant_name").notNull(),
  message: text("message"),
  meetPointCoordinates: json("meet_point_coordinates")
    .$type<{ latitude: number; longitude: number }>()
    .notNull(),
  restaurantCoordinates: json("restaurant_coordinates").$type<{
    latitude: number;
    longitude: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
