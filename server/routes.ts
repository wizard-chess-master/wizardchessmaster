import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import paymentRoutes from "./routes/payments";
import webhookRoutes from "./routes/webhooks";
import authRoutes from "./routes/auth";
import saveDataRoutes from "./routes/savedata";
import leaderboardRoutes from "./routes/leaderboard";
import campaignRoutes from "./routes/campaign";
import usersRoutes from "./routes/users";
import { multiplayerRouter } from "./routes/multiplayer";
import chessRoutes from "./routes/chess";
import founderRoutes from "./routes/founder";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Register authentication routes
  app.use('/api/auth', authRoutes);
  
  // Register cloud save routes  
  app.use('/api/savedata', saveDataRoutes);

  // Register leaderboard routes (both singular and plural for compatibility)
  app.use('/api/leaderboards', leaderboardRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  
  // Register campaign routes
  app.use('/api/campaign', campaignRoutes);
  
  // Register user routes
  app.use('/api/users', usersRoutes);

  // Register payment and webhook routes
  app.use('/api/payments', paymentRoutes);
  app.use('/api/webhooks', webhookRoutes);
  
  // Register multiplayer routes
  app.use('/api/multiplayer', multiplayerRouter);
  
  // Register chess routes
  app.use('/api/chess', chessRoutes);
  
  // Register founder routes
  app.use('/api/founder', founderRoutes);
  
  // Register AI training routes
  const { default: aiTrainingRoutes } = await import('./routes/aiTraining');
  app.use('/api/ai-training', aiTrainingRoutes);
  
  // Register human data training routes
  const { default: trainingRoutes } = await import('./routes/training');
  app.use('/api/training', trainingRoutes);
  
  // Register error logging routes
  const { default: errorLogRoutes } = await import('./routes/errorLogRoutes');
  app.use(errorLogRoutes);

  const httpServer = createServer(app);
  
  // MULTIPLAYER DISABLED - Manager and routes commented out
  // const multiplayerManager = new MultiplayerManager(httpServer);

  // MULTIPLAYER ROUTES DISABLED
  /*
  app.get("/api/leaderboards", async (req, res) => {
    try {
      const leaderboards = await multiplayerManager.getOnlineLeaderboards();
      res.json(leaderboards);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboards' });
    }
  });

  app.get("/api/server-stats", (req, res) => {
    res.json({
      onlinePlayers: multiplayerManager.getOnlinePlayersCount(),
      activeGames: multiplayerManager.getActiveGamesCount(),
      serverTime: new Date().toISOString()
    });
  });
  */

  return httpServer;
}
