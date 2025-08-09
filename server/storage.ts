import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { users, userSaveData, type User, type InsertUser, type UserSaveData, type InsertUserSaveData } from "@shared/schema";
import bcrypt from 'bcrypt';

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

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(username: string, password: string): Promise<User | null>;
  updateUserPremiumStatus(userId: number, isPremium: boolean, subscriptionId?: string, subscriptionStatus?: string): Promise<void>;
  getUserSaveData(userId: number): Promise<UserSaveData | undefined>;
  createOrUpdateSaveData(userId: number, saveData: Omit<InsertUserSaveData, 'userId'>): Promise<UserSaveData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private saveData: Map<number, UserSaveData>;
  currentId: number;
  currentSaveId: number;

  constructor() {
    this.users = new Map();
    this.saveData = new Map();
    this.currentId = 1;
    this.currentSaveId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
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
    const user: User = { 
      ...insertUser, 
      id,
      password: hashedPassword,
      isPremium: false,
      subscriptionId: null,
      subscriptionStatus: null,
      subscriptionEndsAt: null,
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
    const result = await this.db.insert(users).values({
      ...insertUser,
      password: hashedPassword
    }).returning();
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
}

// Use database storage if available, otherwise fall back to memory
export const storage: IStorage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
