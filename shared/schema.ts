import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  decimal,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading sessions for backtesting
export const tradingSessions = pgTable("trading_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  pair: varchar("pair").notNull(),
  startingBalance: decimal("starting_balance", { precision: 12, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual trades within sessions
export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => tradingSessions.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  pair: varchar("pair").notNull(),
  type: varchar("type").notNull(), // 'buy' or 'sell'
  executionType: varchar("execution_type").notNull(), // 'limit', 'market', 'stop'
  entryPrice: decimal("entry_price", { precision: 12, scale: 5 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 12, scale: 5 }),
  quantity: decimal("quantity", { precision: 12, scale: 4 }).notNull(),
  stopLoss: decimal("stop_loss", { precision: 12, scale: 5 }),
  takeProfit: decimal("take_profit", { precision: 12, scale: 5 }),
  profitLoss: decimal("profit_loss", { precision: 12, scale: 2 }),
  status: varchar("status").notNull().default('open'), // 'open', 'closed', 'cancelled'
  entryTime: timestamp("entry_time").notNull(),
  exitTime: timestamp("exit_time"),
  notes: text("notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal entries for trades
export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradeId: varchar("trade_id").notNull().references(() => trades.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  emotions: text("emotions").array(),
  lessons: text("lessons").array(),
  screenshots: text("screenshots").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tradingSessions: many(tradingSessions),
  trades: many(trades),
  journalEntries: many(journalEntries),
}));

export const tradingSessionsRelations = relations(tradingSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [tradingSessions.userId],
    references: [users.id],
  }),
  trades: many(trades),
}));

export const tradesRelations = relations(trades, ({ one, many }) => ({
  session: one(tradingSessions, {
    fields: [trades.sessionId],
    references: [tradingSessions.id],
  }),
  user: one(users, {
    fields: [trades.userId],
    references: [users.id],
  }),
  journalEntries: many(journalEntries),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  trade: one(trades, {
    fields: [journalEntries.tradeId],
    references: [trades.id],
  }),
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertTradingSessionSchema = createInsertSchema(tradingSessions).pick({
  name: true,
  pair: true,
  startingBalance: true,
  startDate: true,
  description: true,
}).extend({
  startingBalance: z.coerce.number(),
  startDate: z.coerce.date(),
});

export const insertTradeSchema = createInsertSchema(trades).pick({
  sessionId: true,
  pair: true,
  type: true,
  executionType: true,
  entryPrice: true,
  exitPrice: true,
  quantity: true,
  stopLoss: true,
  takeProfit: true,
  profitLoss: true,
  status: true,
  entryTime: true,
  exitTime: true,
  notes: true,
  tags: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  tradeId: true,
  title: true,
  content: true,
  emotions: true,
  lessons: true,
  screenshots: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertTradingSession = z.infer<typeof insertTradingSessionSchema>;
export type TradingSession = typeof tradingSessions.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
