import { Router } from 'express';
import { getDB } from '../storage';
import { onlineGames, matchmakingQueue, pvpLeaderboard } from '../../shared/schema';
import { eq, desc, and, or } from 'drizzle-orm';

export const multiplayerRouter = Router();

// Get server statistics
multiplayerRouter.get('/stats', async (req, res) => {
  try {
    const db = getDB();
    
    // Get active games count
    const activeGames = await db
      .select()
      .from(onlineGames)
      .where(eq(onlineGames.status, 'active'));
    
    // Get matchmaking queue count
    const queueCount = await db
      .select()
      .from(matchmakingQueue)
      .where(eq(matchmakingQueue.status, 'waiting'));
    
    res.json({
      success: true,
      data: {
        onlinePlayers: queueCount.length * 2 + activeGames.length * 2, // Approximate
        activeGames: activeGames.length,
        playersInQueue: queueCount.length,
        serverTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching multiplayer stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch server statistics'
    });
  }
});

// Get game history for a user
multiplayerRouter.get('/games/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const db = getDB();
    
    const games = await db
      .select()
      .from(onlineGames)
      .where(
        and(
          or(
            eq(onlineGames.player1Id, userId),
            eq(onlineGames.player2Id, userId)
          ),
          eq(onlineGames.status, 'completed')
        )
      )
      .orderBy(desc(onlineGames.completedAt))
      .limit(20);
    
    const formattedGames = games.map((game: any) => ({
      gameId: game.gameId,
      opponent: game.player1Id === userId ? game.player2Name : game.player1Name,
      yourColor: game.player1Id === userId ? 'white' : 'black',
      result: game.winner === 'draw' ? 'draw' : 
              (game.winner === 'white' && game.player1Id === userId) ||
              (game.winner === 'black' && game.player2Id === userId) ? 'win' : 'loss',
      duration: game.completedAt && game.startedAt ? 
        Math.floor((new Date(game.completedAt).getTime() - new Date(game.startedAt).getTime()) / 1000) : null,
      completedAt: game.completedAt
    }));
    
    res.json({
      success: true,
      data: formattedGames
    });
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game history'
    });
  }
});

// Get PvP leaderboard
multiplayerRouter.get('/leaderboard', async (req, res) => {
  try {
    const db = getDB();
    const limit = parseInt(req.query.limit as string) || 50;
    
    const leaderboard = await db
      .select()
      .from(pvpLeaderboard)
      .orderBy(desc(pvpLeaderboard.rating))
      .limit(limit);
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching PvP leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

// Get active game for a user
multiplayerRouter.get('/active-game/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const db = getDB();
    
    const activeGame = await db
      .select()
      .from(onlineGames)
      .where(
        and(
          or(
            eq(onlineGames.player1Id, userId),
            eq(onlineGames.player2Id, userId)
          ),
          eq(onlineGames.status, 'active')
        )
      )
      .limit(1);
    
    if (activeGame.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }
    
    const game = activeGame[0];
    const userColor = game.player1Id === userId ? 'white' : 'black';
    const opponent = game.player1Id === userId ? 
      { name: game.player2Name, id: game.player2Id } :
      { name: game.player1Name, id: game.player1Id };
    
    res.json({
      success: true,
      data: {
        gameId: game.gameId,
        opponent,
        yourColor: userColor,
        gameState: game.gameState,
        currentTurn: game.currentTurn,
        timeControl: game.timeControl,
        yourTime: userColor === 'white' ? game.player1Time : game.player2Time,
        opponentTime: userColor === 'white' ? game.player2Time : game.player1Time,
        moveHistory: game.moveHistory
      }
    });
  } catch (error) {
    console.error('Error fetching active game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active game'
    });
  }
});

// Update player rating (called after game completion)
multiplayerRouter.post('/update-rating', async (req, res) => {
  try {
    const { userId, newRating, gameResult } = req.body;
    const db = getDB();
    
    // Update or insert player rating
    const existingEntry = await db
      .select()
      .from(pvpLeaderboard)
      .where(eq(pvpLeaderboard.userId, userId))
      .limit(1);
    
    if (existingEntry.length > 0) {
      // Update existing entry
      const current = existingEntry[0];
      const newStats = {
        rating: newRating,
        totalWins: gameResult === 'win' ? current.totalWins + 1 : current.totalWins,
        totalLosses: gameResult === 'loss' ? current.totalLosses + 1 : current.totalLosses,
        totalDraws: gameResult === 'draw' ? current.totalDraws + 1 : current.totalDraws,
        currentStreak: gameResult === 'win' ? current.currentStreak + 1 : 0,
        bestStreak: gameResult === 'win' ? Math.max(current.bestStreak, current.currentStreak + 1) : current.bestStreak,
        winRate: 0, // Will be calculated below
        lastUpdated: new Date()
      };
      
      // Calculate win rate
      const totalGames = newStats.totalWins + newStats.totalLosses + newStats.totalDraws;
      newStats.winRate = totalGames > 0 ? Math.round((newStats.totalWins / totalGames) * 10000) : 0; // * 100 for percentage, * 100 for storage
      
      await db.update(pvpLeaderboard)
        .set(newStats)
        .where(eq(pvpLeaderboard.userId, userId));
    } else {
      // Create new entry
      const newEntry = {
        userId,
        username: req.body.username || 'Unknown',
        displayName: req.body.displayName || 'Unknown',
        rating: newRating,
        totalWins: gameResult === 'win' ? 1 : 0,
        totalLosses: gameResult === 'loss' ? 1 : 0,
        totalDraws: gameResult === 'draw' ? 1 : 0,
        winRate: gameResult === 'win' ? 10000 : 0, // 100% * 100
        currentStreak: gameResult === 'win' ? 1 : 0,
        bestStreak: gameResult === 'win' ? 1 : 0,
        fastestWin: null
      };
      
      await db.insert(pvpLeaderboard).values(newEntry);
    }
    
    res.json({
      success: true,
      data: { rating: newRating }
    });
  } catch (error) {
    console.error('Error updating player rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rating'
    });
  }
});