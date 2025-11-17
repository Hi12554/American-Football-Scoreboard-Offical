import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Football Scoreboard Schema
export interface Team {
  name: string;
  score: number;
  record: string; // e.g., "3-3"
  logo: string; // emoji, text icon, or image URL
  primaryColor: string;
  timeouts: number;
  flags: number;
}

export interface GameState {
  homeTeam: Team;
  awayTeam: Team;
  quarter: 1 | 2 | 3 | 4 | "OT";
  timeRemaining: number; // in seconds (15:00 = 900 seconds)
  isClockRunning: boolean;
  possession: "home" | "away" | null;
  down: 1 | 2 | 3 | 4;
  yardsToGo: number;
  fieldPosition: number; // 0-100 (yard line)
  ballOn: "home" | "away"; // which side of field (for 50 yard line = "away")
  activeFlag: {
    team: "home" | "away";
    type: string;
  } | null;
  isFinal: boolean;
}

export const gameStateSchema = z.object({
  homeTeam: z.object({
    name: z.string(),
    score: z.number().min(0),
    record: z.string(),
    logo: z.string(),
    primaryColor: z.string(),
    timeouts: z.number().min(0).max(3),
    flags: z.number().min(0),
  }),
  awayTeam: z.object({
    name: z.string(),
    score: z.number().min(0),
    record: z.string(),
    logo: z.string(),
    primaryColor: z.string(),
    timeouts: z.number().min(0).max(3),
    flags: z.number().min(0),
  }),
  quarter: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal("OT")]),
  timeRemaining: z.number().min(0),
  isClockRunning: z.boolean(),
  possession: z.union([z.literal("home"), z.literal("away"), z.null()]),
  down: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  yardsToGo: z.number().min(0).max(99),
  fieldPosition: z.number().min(0).max(100),
  ballOn: z.union([z.literal("home"), z.literal("away")]),
  activeFlag: z.union([
    z.object({
      team: z.union([z.literal("home"), z.literal("away")]),
      type: z.string(),
    }),
    z.null()
  ]),
  isFinal: z.boolean(),
});

export type UpdateGameState = Partial<GameState>;
