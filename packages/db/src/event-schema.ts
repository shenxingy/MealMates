import { integer, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const event = pgTable("event", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  avatarColor: text("avatar_color").default("#F5F7FB").notNull(),

  scheduleTime: text("schedule_time").notNull(),

  mood: text("mood"),

  meetPoint: text("meet_point").notNull(),
  restaurantName: text("restaurant_name").notNull(),

  message: text("message"),

  meetPointCoordinates: json("meet_point_coordinates")
    .$type<{ latitude: number; longitude: number }>()
    .notNull(),
    
  restaurantCoordinates: json("restaurant_coordinates")
    .$type<{ latitude: number; longitude: number }>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
