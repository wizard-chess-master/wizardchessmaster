import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { MultiplayerManager } from "./multiplayer";
import path from "path";

const app = express();

// Configure session middleware for authentication
app.use(session({
  secret: process.env.SESSION_SECRET || 'wizard-chess-session-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Allow non-HTTPS for development
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax' // Allow cross-origin requests
  },
  name: 'wizard-chess-session' // Custom session name
}));

// Special middleware for Stripe webhooks - must handle raw body
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Standard JSON middleware for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Set NODE_ENV to production for deployment if not already set
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }

    console.log(`Starting server in ${process.env.NODE_ENV} mode`);

    const httpServer = createServer(app);
    const server = await registerRoutes(app);
    
    // Initialize Socket.IO with the HTTP server
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      path: "/socket.io/",
      transports: ['websocket', 'polling']
    });

    // Initialize multiplayer manager with Socket.IO instance
    const multiplayerManager = new MultiplayerManager(io);

    console.log('🔌 Socket.IO multiplayer system initialized');

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      console.error('Express error:', err);
      res.status(status).json({ message });
    });

    // Add noscript fallback route before setting up vite/static
    app.get('/noscript', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'server/public/noscript.html'));
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    
    httpServer.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`server started successfully on port ${port} with host 0.0.0.0`);
      log(`environment: ${process.env.NODE_ENV}`);
      log(`serving static files from dist in production mode`);
    }).on('error', (err) => {
      console.error('Server failed to start:', err);
      console.error('Error details:', {
        message: err.message,
        code: (err as any).code,
        port,
        host: "0.0.0.0",
        nodeEnv: process.env.NODE_ENV
      });
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
})();
