import { Router, Request, Response } from "express";
import { getDB } from "../storage";
import { humanAIGames, aiTrainingMetrics, users } from "@shared/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import crypto from 'crypto';

const router = Router();

// Extend Express Request to include session
interface AuthRequest extends Request {
  session: any;
}

// Log a human-AI game for training
router.post("/log-game", async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const {
      playerId,
      playerColor,
      aiDifficulty,
      moves,
      boardStates,
      outcome,
      playerElo,
      gameTime,
      moveCount,
      wizardMovesUsed,
      blunders,
      mistakes,
      accuracyScore,
      openingType,
      endgameType
    } = req.body;

    // Generate session ID for anonymous players
    const sessionId = req.session?.userId ? 
      `user-${req.session.userId}` : 
      `anon-${crypto.randomUUID()}`;

    const [gameLog] = await db.insert(humanAIGames).values({
      playerId: playerId || null,
      sessionId,
      playerColor,
      aiDifficulty,
      moves,
      boardStates,
      outcome,
      playerElo: playerElo || null,
      gameTime,
      moveCount,
      wizardMovesUsed,
      blunders: blunders || null,
      mistakes: mistakes || null,
      accuracyScore: accuracyScore || null,
      openingType: openingType || null,
      endgameType: endgameType || null,
      completedAt: new Date()
    }).returning();

    // Update AI training metrics after each game
    await updateTrainingMetrics(aiDifficulty);

    res.json({ 
      success: true, 
      gameId: gameLog.id,
      message: "Game logged successfully for AI training"
    });
  } catch (error) {
    console.error("Failed to log game:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to log game for training" 
    });
  }
});

// Get human games for training
router.get("/training-games", async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { 
      limit = 100, 
      offset = 0,
      minElo,
      maxElo,
      outcome,
      difficulty 
    } = req.query;

    let query = db.select().from(humanAIGames);
    let conditions = [];

    if (minElo) {
      conditions.push(gte(humanAIGames.playerElo, Number(minElo)));
    }
    if (maxElo) {
      conditions.push(lte(humanAIGames.playerElo, Number(maxElo)));
    }
    if (outcome) {
      conditions.push(eq(humanAIGames.outcome, outcome as string));
    }
    if (difficulty) {
      conditions.push(eq(humanAIGames.aiDifficulty, difficulty as string));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const games = await query
      .orderBy(desc(humanAIGames.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({ 
      success: true, 
      games,
      count: games.length 
    });
  } catch (error) {
    console.error("Failed to fetch training games:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch training games" 
    });
  }
});

// Get segmented player data for curriculum training
router.get("/player-segments", async (req: Request, res: Response) => {
  try {
    const db = getDB();
    // Segment players by skill level based on win rate
    const segments = await db.select({
      skill_level: sql`
        CASE 
          WHEN player_elo < 1200 THEN 'amateur'
          WHEN player_elo BETWEEN 1200 AND 1800 THEN 'intermediate'
          ELSE 'expert'
        END
      `.as('skill_level'),
      count: sql`COUNT(*)`.as('count'),
      avg_accuracy: sql`AVG(accuracy_score)`.as('avg_accuracy'),
      avg_game_time: sql`AVG(game_time)`.as('avg_game_time'),
      win_rate: sql`
        SUM(CASE WHEN outcome = 'player_win' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
      `.as('win_rate')
    })
    .from(humanAIGames)
    .where(humanAIGames.playerElo !== null)
    .groupBy(sql`skill_level`);

    res.json({ 
      success: true, 
      segments 
    });
  } catch (error) {
    console.error("Failed to fetch player segments:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch player segments" 
    });
  }
});

// Get current AI training metrics
router.get("/metrics", async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const metrics = await db.select()
      .from(aiTrainingMetrics)
      .orderBy(desc(aiTrainingMetrics.createdAt))
      .limit(1);

    if (metrics.length === 0) {
      // Initialize metrics if none exist
      const [initialMetrics] = await db.insert(aiTrainingMetrics).values({
        modelVersion: "v2.0.0",
        trainingGames: 100000, // From previous AI vs AI training
        humanGames: 0,
        currentElo: 2550,
        winRate: 85,
        winRateVsAmateur: 95,
        winRateVsIntermediate: 85,
        winRateVsExpert: 75,
        avgMoveTime: 500,
        wizardMoveAccuracy: 88,
        modelWeights: {},
        trainingLoss: []
      }).returning();

      return res.json({ 
        success: true, 
        metrics: initialMetrics 
      });
    }

    res.json({ 
      success: true, 
      metrics: metrics[0] 
    });
  } catch (error) {
    console.error("Failed to fetch metrics:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch training metrics" 
    });
  }
});

// Update training metrics after a batch of games
router.post("/update-metrics", async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const {
      modelVersion,
      trainingGames,
      humanGames,
      currentElo,
      winRate,
      winRateVsAmateur,
      winRateVsIntermediate,
      winRateVsExpert,
      avgMoveTime,
      wizardMoveAccuracy,
      modelWeights,
      trainingLoss
    } = req.body;

    const [updatedMetrics] = await db.insert(aiTrainingMetrics).values({
      modelVersion,
      trainingGames,
      humanGames,
      currentElo,
      winRate,
      winRateVsAmateur,
      winRateVsIntermediate,
      winRateVsExpert,
      avgMoveTime,
      wizardMoveAccuracy,
      modelWeights,
      trainingLoss
    }).returning();

    res.json({ 
      success: true, 
      metrics: updatedMetrics 
    });
  } catch (error) {
    console.error("Failed to update metrics:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to update training metrics" 
    });
  }
});

// Helper function to update training metrics
async function updateTrainingMetrics(difficulty: string) {
  try {
    const db = getDB();
    // Get current metrics
    const [currentMetrics] = await db.select()
      .from(aiTrainingMetrics)
      .orderBy(desc(aiTrainingMetrics.createdAt))
      .limit(1);

    if (!currentMetrics) return;

    // Count total human games
    const humanGameCount = await db.select({
      count: sql`COUNT(*)`.as('count')
    }).from(humanAIGames);

    // Calculate win rates by player skill level
    const winRates = await db.select({
      skill_level: sql`
        CASE 
          WHEN player_elo < 1200 THEN 'amateur'
          WHEN player_elo BETWEEN 1200 AND 1800 THEN 'intermediate'
          ELSE 'expert'
        END
      `.as('skill_level'),
      win_rate: sql`
        SUM(CASE WHEN outcome = 'ai_win' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
      `.as('win_rate')
    })
    .from(humanAIGames)
    .where(humanAIGames.playerElo !== null)
    .groupBy(sql`skill_level`);

    // Update metrics with new data
    const winRateMap: any = {};
    winRates.forEach((wr: any) => {
      winRateMap[wr.skill_level] = Math.round(wr.win_rate);
    });

    await db.insert(aiTrainingMetrics).values({
      ...currentMetrics,
      humanGames: Number(humanGameCount[0].count),
      winRateVsAmateur: winRateMap.amateur || currentMetrics.winRateVsAmateur,
      winRateVsIntermediate: winRateMap.intermediate || currentMetrics.winRateVsIntermediate,
      winRateVsExpert: winRateMap.expert || currentMetrics.winRateVsExpert,
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Failed to update training metrics:", error);
  }
}

// Get game statistics for analysis
router.get("/statistics", async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const stats = await db.select({
      total_games: sql`COUNT(*)`.as('total_games'),
      avg_game_time: sql`AVG(game_time)`.as('avg_game_time'),
      avg_move_count: sql`AVG(move_count)`.as('avg_move_count'),
      avg_wizard_moves: sql`AVG(wizard_moves_used)`.as('avg_wizard_moves'),
      player_win_rate: sql`
        SUM(CASE WHEN outcome = 'player_win' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
      `.as('player_win_rate'),
      ai_win_rate: sql`
        SUM(CASE WHEN outcome = 'ai_win' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
      `.as('ai_win_rate'),
      draw_rate: sql`
        SUM(CASE WHEN outcome = 'draw' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
      `.as('draw_rate')
    }).from(humanAIGames);

    res.json({ 
      success: true, 
      statistics: stats[0] 
    });
  } catch (error) {
    console.error("Failed to fetch statistics:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch game statistics" 
    });
  }
});

export default router;