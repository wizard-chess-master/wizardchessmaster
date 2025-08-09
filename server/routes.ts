import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import paymentRoutes from "./routes/payments";
import webhookRoutes from "./routes/webhooks";
// MULTIPLAYER DISABLED: import { MultiplayerManager } from "./multiplayer";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Register payment and webhook routes
  app.use('/api/payments', paymentRoutes);
  app.use('/api/webhooks', webhookRoutes);

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
