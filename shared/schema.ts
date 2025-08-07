import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
});

// Online leaderboard entries
export const campaignLeaderboard = pgTable("campaign_leaderboard", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  currentLevel: integer("current_level").notNull(),
  totalWins: integer("total_wins").notNull(),
  totalGames: integer("total_games").notNull(),
  winRate: integer("win_rate").notNull(), // stored as percentage * 100
  highestLevel: integer("highest_level").notNull(),
  averageGameTime: integer("average_game_time").notNull(),
  campaignScore: integer("campaign_score").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const pvpLeaderboard = pgTable("pvp_leaderboard", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  rating: integer("rating").notNull(),
  totalWins: integer("total_wins").notNull(),
  totalLosses: integer("total_losses").notNull(),
  totalDraws: integer("total_draws").notNull(),
  winRate: integer("win_rate").notNull(),
  currentStreak: integer("current_streak").notNull(),
  bestStreak: integer("best_streak").notNull(),
  fastestWin: integer("fastest_win"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Online multiplayer games
export const onlineGames = pgTable("online_games", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull().unique(),
  player1Id: integer("player1_id").references(() => users.id).notNull(),
  player2Id: integer("player2_id").references(() => users.id).notNull(),
  player1Name: text("player1_name").notNull(),
  player2Name: text("player2_name").notNull(),
  gameState: jsonb("game_state").notNull(),
  currentTurn: text("current_turn").notNull(), // 'white' or 'black'
  status: text("status").notNull(), // 'waiting', 'active', 'completed'
  winner: text("winner"), // 'white', 'black', 'draw', null
  moveHistory: jsonb("move_history").notNull(),
  timeControl: integer("time_control"), // in seconds
  player1Time: integer("player1_time"),
  player2Time: integer("player2_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

// Matchmaking queue
export const matchmakingQueue = pgTable("matchmaking_queue", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  rating: integer("rating").notNull(),
  timeControl: integer("time_control"), // in seconds
  status: text("status").notNull(), // 'waiting', 'matched', 'cancelled'
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

export const insertCampaignLeaderboardSchema = createInsertSchema(campaignLeaderboard);
export const insertPvpLeaderboardSchema = createInsertSchema(pvpLeaderboard);
export const insertOnlineGameSchema = createInsertSchema(onlineGames);
export const insertMatchmakingSchema = createInsertSchema(matchmakingQueue);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CampaignLeaderboardEntry = typeof campaignLeaderboard.$inferSelect;
export type PvpLeaderboardEntry = typeof pvpLeaderboard.$inferSelect;
export type OnlineGame = typeof onlineGames.$inferSelect;
export type MatchmakingEntry = typeof matchmakingQueue.$inferSelect;
