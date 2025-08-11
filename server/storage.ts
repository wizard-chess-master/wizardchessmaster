import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, and, gt, count } from 'drizzle-orm';
import { users, userSaveData, passwordResetTokens, type User, type InsertUser, type UserSaveData, type InsertUserSaveData, type PasswordResetToken } from "@shared/schema";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Database connection (optional for development)
let db: any = null;

if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql);
} else {
  console.log('⚠️ No DATABASE_URL found - online multiplayer features will be disabled');
}

// Export database instance for multiplayer
export function getDB() {
  if (!db) {
    throw new Error('Database not available - please set DATABASE_URL environment variable');
  }
  return db;
}

// modify the interface with any CRUD methods
// you might need

export interface LeaderboardEntry {
  id: number;
  playerName: string;
  displayName: string;
  score: number;
  gamesWon: number;
  gamesPlayed: number;
  averageGameTime: number;
  highestLevel?: number;
  isPremium: boolean;
  lastPlayed: Date;
  rank?: number;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  verifyPassword(username: string, password: string): Promise<User | null>;
  updateUserPremiumStatus(userId: number, isPremium: boolean, subscriptionId?: string, subscriptionStatus?: string): Promise<void>;
  getUserSaveData(userId: number): Promise<UserSaveData | undefined>;
  createOrUpdateSaveData(userId: number, saveData: Omit<InsertUserSaveData, 'userId'>): Promise<UserSaveData>;
  
  // Password recovery methods
  createPasswordResetToken(userId: number): Promise<string>;
  validatePasswordResetToken(token: string): Promise<User | null>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  
  // Founder program methods
  getTotalUserCount(): Promise<number>;
  checkFounderEligibility(): Promise<{ eligible: boolean; founderNumber?: number }>;
  
  // Leaderboard methods
  updatePlayerStats(userId: number, stats: {
    gamesWon?: number;
    gamesPlayed?: number;
    totalGameTime?: number;
    highestLevel?: number;
  }): Promise<void>;
  getCampaignLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getPvPLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getPlayerRank(userId: number, type: 'campaign' | 'pvp'): Promise<number | null>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private saveData: Map<number, UserSaveData>;
  private playerStats: Map<number, any>;
  private resetTokens: Map<string, { userId: number; expiresAt: Date; used: boolean; createdAt: Date }>;
  currentId: number;
  currentSaveId: number;

  constructor() {
    this.users = new Map();
    this.saveData = new Map();
    this.playerStats = new Map();
    this.resetTokens = new Map();
    this.currentId = 1;
    this.currentSaveId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = this.currentId++;
    
    // Check founder eligibility
    const currentUserCount = this.users.size;
    const isFounder = currentUserCount < 1000;
    
    const user: User = { 
      ...insertUser, 
      id,
      password: hashedPassword,
      isPremium: isFounder, // First 1000 users get premium automatically
      isFounderMember: isFounder,
      founderNumber: isFounder ? currentUserCount + 1 : null,
      subscriptionId: null,
      subscriptionStatus: isFounder ? 'founder' : null,
      subscriptionEndsAt: null, // Founder premium never expires
      createdAt: new Date(),
      lastSeen: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    // Update last seen
    user.lastSeen = new Date();
    this.users.set(user.id, user);
    
    return user;
  }

  async createPasswordResetToken(userId: number): Promise<string> {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    this.resetTokens.set(token, {
      userId,
      expiresAt,
      used: false,
      createdAt: new Date()
    });
    
    return token;
  }

  async validatePasswordResetToken(token: string): Promise<User | null> {
    const tokenData = this.resetTokens.get(token);
    
    if (!tokenData || tokenData.used || tokenData.expiresAt < new Date()) {
      return null;
    }
    
    const user = await this.getUser(tokenData.userId);
    return user || null;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const tokenData = this.resetTokens.get(token);
    
    if (!tokenData || tokenData.used || tokenData.expiresAt < new Date()) {
      return false;
    }
    
    const user = this.users.get(tokenData.userId);
    if (!user) return false;
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password
    user.password = hashedPassword;
    this.users.set(user.id, user);
    
    // Mark token as used
    tokenData.used = true;
    this.resetTokens.set(token, tokenData);
    
    return true;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPremiumStatus(userId: number, isPremium: boolean, subscriptionId?: string, subscriptionStatus?: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    
    user.isPremium = isPremium;
    user.subscriptionId = subscriptionId || null;
    user.subscriptionStatus = subscriptionStatus || null;
    user.subscriptionEndsAt = isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null; // 30 days from now
    
    this.users.set(userId, user);
  }

  async getUserSaveData(userId: number): Promise<UserSaveData | undefined> {
    return this.saveData.get(userId);
  }

  async createOrUpdateSaveData(userId: number, saveDataInput: Omit<InsertUserSaveData, 'userId'>): Promise<UserSaveData> {
    const existing = this.saveData.get(userId);
    
    if (existing) {
      const updated: UserSaveData = {
        ...existing,
        ...saveDataInput,
        userId,
        lastSyncedAt: new Date()
      };
      this.saveData.set(userId, updated);
      return updated;
    } else {
      const newSaveData: UserSaveData = {
        id: this.currentSaveId++,
        userId,
        ...saveDataInput,
        lastSyncedAt: new Date(),
        createdAt: new Date()
      };
      this.saveData.set(userId, newSaveData);
      return newSaveData;
    }
  }

  async updatePlayerStats(userId: number, stats: {
    gamesWon?: number;
    gamesPlayed?: number;
    totalGameTime?: number;
    highestLevel?: number;
  }): Promise<void> {
    const existing = this.playerStats.get(userId) || {
      gamesWon: 0,
      gamesPlayed: 0,
      totalGameTime: 0,
      highestLevel: 0
    };

    this.playerStats.set(userId, {
      ...existing,
      gamesWon: stats.gamesWon !== undefined ? existing.gamesWon + stats.gamesWon : existing.gamesWon,
      gamesPlayed: stats.gamesPlayed !== undefined ? existing.gamesPlayed + stats.gamesPlayed : existing.gamesPlayed,
      totalGameTime: stats.totalGameTime !== undefined ? existing.totalGameTime + stats.totalGameTime : existing.totalGameTime,
      highestLevel: stats.highestLevel !== undefined ? Math.max(existing.highestLevel, stats.highestLevel) : existing.highestLevel
    });
  }

  async getCampaignLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    const entries: LeaderboardEntry[] = [];

    for (const [userId, user] of Array.from(this.users)) {
      const stats = this.playerStats.get(userId);
      if (stats && stats.highestLevel > 0) {
        const score = (stats.highestLevel * 1000) + (stats.gamesWon * 100) - (stats.gamesPlayed * 10);
        entries.push({
          id: userId,
          playerName: user.username,
          displayName: user.displayName,
          score: Math.max(0, score),
          gamesWon: stats.gamesWon,
          gamesPlayed: stats.gamesPlayed,
          averageGameTime: stats.gamesPlayed > 0 ? stats.totalGameTime / stats.gamesPlayed : 0,
          highestLevel: stats.highestLevel,
          isPremium: user.isPremium || false,
          lastPlayed: user.lastSeen || new Date()
        });
      }
    }

    return entries
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  async getPvPLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    const entries: LeaderboardEntry[] = [];

    for (const [userId, user] of Array.from(this.users)) {
      const stats = this.playerStats.get(userId);
      if (stats && stats.gamesPlayed > 0) {
        const winRate = stats.gamesWon / stats.gamesPlayed;
        const score = (stats.gamesWon * 100) + (winRate * 1000) - (stats.averageGameTime || 0);
        entries.push({
          id: userId,
          playerName: user.username,
          displayName: user.displayName,
          score: Math.max(0, score),
          gamesWon: stats.gamesWon,
          gamesPlayed: stats.gamesPlayed,
          averageGameTime: stats.gamesPlayed > 0 ? stats.totalGameTime / stats.gamesPlayed : 0,
          isPremium: user.isPremium || false,
          lastPlayed: user.lastSeen || new Date()
        });
      }
    }

    return entries
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  async getPlayerRank(userId: number, type: 'campaign' | 'pvp'): Promise<number | null> {
    const leaderboard = type === 'campaign' 
      ? await this.getCampaignLeaderboard(1000)
      : await this.getPvPLeaderboard(1000);
    
    const entry = leaderboard.find(e => e.id === userId);
    return entry ? entry.rank || null : null;
  }

  async getTotalUserCount(): Promise<number> {
    return this.users.size;
  }

  async checkFounderEligibility(): Promise<{ eligible: boolean; founderNumber?: number }> {
    const currentCount = this.users.size;
    return {
      eligible: currentCount < 1000,
      founderNumber: currentCount < 1000 ? currentCount + 1 : undefined
    };
  }
}

// Database-powered storage for production
export class DatabaseStorage implements IStorage {
  private db: any;

  constructor() {
    this.db = getDB();
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    // Check founder eligibility
    const eligibility = await this.checkFounderEligibility();
    
    const result = await this.db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
      isPremium: eligibility.eligible, // First 1000 users get premium automatically
      isFounderMember: eligibility.eligible,
      founderNumber: eligibility.founderNumber,
      subscriptionStatus: eligibility.eligible ? 'founder' : null
    }).returning();
    return result[0];
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await this.db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    // Update last seen
    await this.db.update(users)
      .set({ lastSeen: new Date() })
      .where(eq(users.id, user.id));
    
    return { ...user, lastSeen: new Date() };
  }

  async createPasswordResetToken(userId: number): Promise<string> {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    await this.db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt
    });
    
    return token;
  }

  async validatePasswordResetToken(token: string): Promise<User | null> {
    const result = await this.db.select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date())
      ))
      .limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    const user = await this.getUser(result[0].userId);
    return user || null;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // First validate the token
    const tokenResult = await this.db.select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date())
      ))
      .limit(1);
    
    if (tokenResult.length === 0) {
      return false;
    }
    
    const tokenData = tokenResult[0];
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password
    await this.db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, tokenData.userId));
    
    // Mark token as used
    await this.db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenData.id));
    
    return true;
  }

  async updateUserPremiumStatus(userId: number, isPremium: boolean, subscriptionId?: string, subscriptionStatus?: string): Promise<void> {
    await this.db.update(users)
      .set({ 
        isPremium,
        subscriptionId: subscriptionId || null,
        subscriptionStatus: subscriptionStatus || null,
        subscriptionEndsAt: isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
      })
      .where(eq(users.id, userId));
  }

  async getUserSaveData(userId: number): Promise<UserSaveData | undefined> {
    const result = await this.db.select().from(userSaveData).where(eq(userSaveData.userId, userId)).limit(1);
    return result[0];
  }

  async createOrUpdateSaveData(userId: number, saveDataInput: Omit<InsertUserSaveData, 'userId'>): Promise<UserSaveData> {
    const existing = await this.getUserSaveData(userId);
    
    if (existing) {
      const result = await this.db.update(userSaveData)
        .set({
          ...saveDataInput,
          lastSyncedAt: new Date()
        })
        .where(eq(userSaveData.userId, userId))
        .returning();
      return result[0];
    } else {
      const result = await this.db.insert(userSaveData)
        .values({
          userId,
          ...saveDataInput
        })
        .returning();
      return result[0];
    }
  }

  async updatePlayerStats(userId: number, stats: {
    gamesWon?: number;
    gamesPlayed?: number;
    totalGameTime?: number;
    highestLevel?: number;
  }): Promise<void> {
    // For now, store stats in user save data as a JSON field
    // In production, you'd create a separate player_stats table
    const saveData = await this.getUserSaveData(userId);
    const existingStats = (saveData?.playerStats as any)?.playerStats || {
      gamesWon: 0,
      gamesPlayed: 0,
      totalGameTime: 0,
      highestLevel: 0
    };

    const updatedStats = {
      gamesWon: stats.gamesWon !== undefined ? existingStats.gamesWon + stats.gamesWon : existingStats.gamesWon,
      gamesPlayed: stats.gamesPlayed !== undefined ? existingStats.gamesPlayed + stats.gamesPlayed : existingStats.gamesPlayed,
      totalGameTime: stats.totalGameTime !== undefined ? existingStats.totalGameTime + stats.totalGameTime : existingStats.totalGameTime,
      highestLevel: stats.highestLevel !== undefined ? Math.max(existingStats.highestLevel, stats.highestLevel) : existingStats.highestLevel
    };

    await this.createOrUpdateSaveData(userId, {
      campaignProgress: saveData?.campaignProgress || {},
      achievements: saveData?.achievements || {},
      playerStats: {
        ...(saveData?.playerStats as any) || {},
        playerStats: updatedStats
      },
      gameSettings: saveData?.gameSettings || {}
    });
  }

  async getCampaignLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    // Get all users with their save data
    const allUsers = await this.db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      isPremium: users.isPremium,
      lastSeen: users.lastSeen,
      playerStats: userSaveData.playerStats
    })
    .from(users)
    .leftJoin(userSaveData, eq(users.id, userSaveData.userId));

    const entries: LeaderboardEntry[] = [];

    for (const user of allUsers) {
      const stats = (user.playerStats as any)?.playerStats;
      if (stats && stats.highestLevel > 0) {
        const score = (stats.highestLevel * 1000) + (stats.gamesWon * 100) - (stats.gamesPlayed * 10);
        entries.push({
          id: user.id,
          playerName: user.username,
          displayName: user.displayName,
          score: Math.max(0, score),
          gamesWon: stats.gamesWon,
          gamesPlayed: stats.gamesPlayed,
          averageGameTime: stats.gamesPlayed > 0 ? stats.totalGameTime / stats.gamesPlayed : 0,
          highestLevel: stats.highestLevel,
          isPremium: user.isPremium || false,
          lastPlayed: user.lastSeen || new Date()
        });
      }
    }

    return entries
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  async getPvPLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    // Get all users with their save data
    const allUsers = await this.db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      isPremium: users.isPremium,
      lastSeen: users.lastSeen,
      playerStats: userSaveData.playerStats
    })
    .from(users)
    .leftJoin(userSaveData, eq(users.id, userSaveData.userId));

    const entries: LeaderboardEntry[] = [];

    for (const user of allUsers) {
      const stats = (user.playerStats as any)?.playerStats;
      if (stats && stats.gamesPlayed > 0) {
        const winRate = stats.gamesWon / stats.gamesPlayed;
        const score = (stats.gamesWon * 100) + (winRate * 1000) - (stats.averageGameTime || 0);
        entries.push({
          id: user.id,
          playerName: user.username,
          displayName: user.displayName,
          score: Math.max(0, score),
          gamesWon: stats.gamesWon,
          gamesPlayed: stats.gamesPlayed,
          averageGameTime: stats.gamesPlayed > 0 ? stats.totalGameTime / stats.gamesPlayed : 0,
          isPremium: user.isPremium || false,
          lastPlayed: user.lastSeen || new Date()
        });
      }
    }

    return entries
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  async getPlayerRank(userId: number, type: 'campaign' | 'pvp'): Promise<number | null> {
    const leaderboard = type === 'campaign' 
      ? await this.getCampaignLeaderboard(1000)
      : await this.getPvPLeaderboard(1000);
    
    const entry = leaderboard.find(e => e.id === userId);
    return entry ? entry.rank || null : null;
  }

  async getTotalUserCount(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(users);
    return result[0].count;
  }

  async checkFounderEligibility(): Promise<{ eligible: boolean; founderNumber?: number }> {
    const currentCount = await this.getTotalUserCount();
    return {
      eligible: currentCount < 1000,
      founderNumber: currentCount < 1000 ? currentCount + 1 : undefined
    };
  }
}

// Use database storage if available, otherwise fall back to memory
export const storage: IStorage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
