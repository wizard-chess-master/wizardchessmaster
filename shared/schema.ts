import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  isPremium: boolean("is_premium").notNull().default(false),
  subscriptionId: text("subscription_id"),
  subscriptionStatus: text("subscription_status"), // active, canceled, past_due
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  isFounderMember: boolean("is_founder_member").notNull().default(false), // First 1000 users
  founderNumber: integer("founder_number"), // Their position in the first 1000
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User game progress and save data
export const userSaveData = pgTable("user_save_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  campaignProgress: jsonb("campaign_progress").notNull(), // levels, stars, unlocks
  achievements: jsonb("achievements").notNull(), // completed achievements
  playerStats: jsonb("player_stats").notNull(), // statistics
  gameSettings: jsonb("game_settings").notNull(), // audio, preferences
  lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// Human-AI training games for AI enhancement
export const humanAIGames = pgTable("human_ai_games", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => users.id),
  sessionId: text("session_id").notNull(), // For anonymous players
  playerColor: text("player_color").notNull(), // 'white' or 'black'
  aiDifficulty: text("ai_difficulty").notNull(), // 'easy', 'medium', 'hard', 'advanced'
  moves: jsonb("moves").notNull(), // Array of move objects with timestamps
  boardStates: jsonb("board_states").notNull(), // Board state at each move
  outcome: text("outcome").notNull(), // 'player_win', 'ai_win', 'draw', 'abandoned'
  playerElo: integer("player_elo"), // Estimated player strength
  gameTime: integer("game_time").notNull(), // Total game duration in seconds
  moveCount: integer("move_count").notNull(),
  wizardMovesUsed: integer("wizard_moves_used").notNull(), // Count of wizard special moves
  blunders: integer("blunders"), // Number of blunders detected
  mistakes: integer("mistakes"), // Number of mistakes detected  
  accuracyScore: integer("accuracy_score"), // Overall move accuracy (0-100)
  openingType: text("opening_type"), // Detected opening pattern
  endgameType: text("endgame_type"), // Type of endgame reached
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// AI training metrics table
export const aiTrainingMetrics = pgTable("ai_training_metrics", {
  id: serial("id").primaryKey(),
  modelVersion: text("model_version").notNull(),
  trainingGames: integer("training_games").notNull(),
  humanGames: integer("human_games").notNull(),
  currentElo: integer("current_elo").notNull(),
  winRate: integer("win_rate").notNull(), // Overall win rate as percentage
  winRateVsAmateur: integer("win_rate_vs_amateur"), // Win rate vs players < 1200 ELO
  winRateVsIntermediate: integer("win_rate_vs_intermediate"), // Win rate vs 1200-1800 ELO
  winRateVsExpert: integer("win_rate_vs_expert"), // Win rate vs > 1800 ELO
  avgMoveTime: integer("avg_move_time"), // Average thinking time in ms
  wizardMoveAccuracy: integer("wizard_move_accuracy"), // Accuracy of wizard piece usage
  modelWeights: jsonb("model_weights"), // Serialized neural network weights
  trainingLoss: jsonb("training_loss"), // Loss values over training epochs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  displayName: true,
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Password recovery schemas
export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertUserSaveDataSchema = createInsertSchema(userSaveData).omit({
  id: true,
  createdAt: true,
  lastSyncedAt: true,
});

export const insertCampaignLeaderboardSchema = createInsertSchema(campaignLeaderboard);
export const insertPvpLeaderboardSchema = createInsertSchema(pvpLeaderboard);
export const insertOnlineGameSchema = createInsertSchema(onlineGames);
export const insertMatchmakingSchema = createInsertSchema(matchmakingQueue);
export const insertHumanAIGameSchema = createInsertSchema(humanAIGames);
export const insertAITrainingMetricsSchema = createInsertSchema(aiTrainingMetrics);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type User = typeof users.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type UserSaveData = typeof userSaveData.$inferSelect;
export type InsertUserSaveData = z.infer<typeof insertUserSaveDataSchema>;
export type CampaignLeaderboardEntry = typeof campaignLeaderboard.$inferSelect;
export type PvpLeaderboardEntry = typeof pvpLeaderboard.$inferSelect;
export type OnlineGame = typeof onlineGames.$inferSelect;
export type MatchmakingEntry = typeof matchmakingQueue.$inferSelect;
export type HumanAIGame = typeof humanAIGames.$inferSelect;
export type AITrainingMetrics = typeof aiTrainingMetrics.$inferSelect;
export type InsertHumanAIGame = z.infer<typeof insertHumanAIGameSchema>;
export type InsertAITrainingMetrics = z.infer<typeof insertAITrainingMetricsSchema>;
