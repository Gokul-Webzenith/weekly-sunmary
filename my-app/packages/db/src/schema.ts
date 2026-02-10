import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  text: varchar("text").notNull(),
  description: text("description").notNull(),
  status: varchar("status").notNull(),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
});
