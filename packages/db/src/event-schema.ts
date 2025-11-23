import { json, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const event = pgTable("event", {
  id: serial("id").primaryKey(),
  
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),

  scheduleTime: text("schedule_time").notNull(),

  mood: text("mood"),

  meetPoint: text("meet_point").notNull(),
  restaurantName: text("restaurant_name").notNull(),

  message: text("message"),

  meetPointCoordinates: json("meet_point_coordinates")
    .$type<{ latitude: number; longitude: number }>()
    .notNull(),
    
  restaurantCoordinates: json("restaurant_coordinates")
    .$type<{ latitude: number; longitude: number }>(), // Mock 中有些详细数据有，有些简单数据没有，设为可选

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
