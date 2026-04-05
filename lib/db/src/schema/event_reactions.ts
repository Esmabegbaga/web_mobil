import { pgTable, text, serial, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventReactionsTable = pgTable("event_reactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventId: integer("event_id").notNull(),
  type: text("type", { enum: ["going", "interested"] }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique().on(t.userId, t.eventId)]);

export const insertEventReactionSchema = createInsertSchema(eventReactionsTable).omit({ id: true, createdAt: true });
export type InsertEventReaction = z.infer<typeof insertEventReactionSchema>;
export type EventReaction = typeof eventReactionsTable.$inferSelect;
