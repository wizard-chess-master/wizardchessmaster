import { GameState, ChessMove, Position, AIDifficulty, PieceColor, ChessPiece } from './types';
import { getPossibleMoves } from './pieceMovement';
import { isKingInCheck, makeMove } from './gameEngine';
import { aiLearning } from './aiLearning';

export function getAIMove(gameState: GameState): ChessMove | null {
  const aiColor = gameState.currentPlayer;
  const allMoves = getAllPossibleMoves(gameState, aiColor);
  
  if (allMoves.length === 0) {
    return null;
  }
  
  // PRIORITY 1: Look for immediate checkmate moves
  const checkmateMove = findCheckmateMove(gameState, allMoves, aiColor);
  if (checkmateMove) {
    console.log('♔ AI found checkmate move!');
    return checkmateMove;
  }
  
  // PRIORITY 2: Block opponent's checkmate threats
  const blockingMove = findBlockingMove(gameState, allMoves, aiColor);
  if (blockingMove) {
    console.log('🛡️ AI blocking opponent checkmate threat');
    return blockingMove;
  }
  
  // PRIORITY 2.5: Filter out repetitive moves early (before other considerations)
  const nonRepetitiveMoves = filterRepetitiveMoves(gameState, allMoves);
  const movesToConsider = nonRepetitiveMoves.length > 0 ? nonRepetitiveMoves : allMoves;
  
  // PRIORITY 3: Try to use learned patterns (for medium and hard difficulty)
  if (gameState.aiDifficulty !== 'easy') {
    const learnedMove = aiLearning.getBestLearnedMove(gameState, aiColor);
    if (learnedMove) {
      // Validate the learned move is still legal AND not repetitive
      const isLearnedMoveLegal = movesToConsider.some(move => 
        move.from.row === learnedMove.from.row && 
        move.from.col === learnedMove.from.col &&
        move.to.row === learnedMove.to.row && 
        move.to.col === learnedMove.to.col
      );
      
      if (isLearnedMoveLegal) {
        console.log(`🧠 AI using learned move: ${learnedMove.piece.type} ${String.fromCharCode(97 + learnedMove.from.col)}${10 - learnedMove.from.row} to ${String.fromCharCode(97 + learnedMove.to.col)}${10 - learnedMove.to.row}`);
        return learnedMove;
      }
    }
  }
  
  // PRIORITY 4: Fall back to original strategy (using filtered moves)
  switch (gameState.aiDifficulty) {
    case 'easy':
      return getRandomMove(gameState, aiColor, movesToConsider);
    case 'medium':
      return getBasicStrategyMove(gameState, aiColor, movesToConsider);
    case 'hard':
      return getAdvancedStrategyMove(gameState, aiColor, movesToConsider);
    default:
      return getRandomMove(gameState, aiColor, movesToConsider);
  }
}

// Advanced repetition detection to prevent AI from making the same move 3+ times
function filterRepetitiveMoves(gameState: GameState, moves: ChessMove[]): ChessMove[] {
  if (gameState.moveHistory.length < 6) return moves; // Need at least 6 moves to detect 3-fold repetition
  
  const moveHistory = gameState.moveHistory;
  
  return moves.filter(move => {
    // Count how many times this exact move has been made recently
    let moveCount = 0;
    let opponentSameMoveCount = 0;
    
    // Look at last 12 moves (6 moves for each player)
    const recentMoves = moveHistory.slice(-12);
    
    for (let i = 0; i < recentMoves.length; i += 2) {
      const aiMove = recentMoves[i];
      const opponentMove = recentMoves[i + 1];
      
      // Check if AI made this same move before
      if (aiMove && 
          move.from.row === aiMove.from.row && 
          move.from.col === aiMove.from.col &&
          move.to.row === aiMove.to.row && 
          move.to.col === aiMove.to.col &&
          move.piece.type === aiMove.piece.type) {
        moveCount++;
      }
      
      // Check if opponent made similar repetitive moves
      if (opponentMove && i > 0) {
        const prevOpponentMove = recentMoves[i - 1];
        if (prevOpponentMove &&
            opponentMove.from.row === prevOpponentMove.from.row && 
            opponentMove.from.col === prevOpponentMove.from.col &&
            opponentMove.to.row === prevOpponentMove.to.row && 
            opponentMove.to.col === prevOpponentMove.to.col &&
            opponentMove.piece.type === prevOpponentMove.piece.type) {
          opponentSameMoveCount++;
        }
      }
    }
    
    // Don't make the same move 3+ times unless opponent is also repeating AND we have no choice
    if (moveCount >= 2) {
      // Allow repetition only if:
      // 1. Opponent is also repeating moves (mutual repetition)
      // 2. OR this is the only legal move available
      const allowRepetition = opponentSameMoveCount >= 2 || moves.length === 1;
      
      if (!allowRepetition) {
        console.log(`🚫 AI avoiding repetitive move: ${move.piece.type} ${String.fromCharCode(97 + move.from.col)}${10 - move.from.row} to ${String.fromCharCode(97 + move.to.col)}${10 - move.to.row} (used ${moveCount} times)`);
        return false;
      }
    }
    
    // Additional immediate repetition prevention (back-and-forth moves)
    const lastMove = moveHistory[moveHistory.length - 1];
    if (lastMove && 
        move.from.row === lastMove.to.row && 
        move.from.col === lastMove.to.col &&
        move.to.row === lastMove.from.row && 
        move.to.col === lastMove.from.col &&
        move.piece.type === lastMove.piece.type) {
      // Only allow if no other moves available
      if (moves.length > 1) {
        console.log(`🚫 AI avoiding immediate back-and-forth move`);
        return false;
      }
    }
    
    return true;
  });
}

// Find moves that lead to immediate checkmate
function findCheckmateMove(gameState: GameState, moves: ChessMove[], aiColor: PieceColor): ChessMove | null {
  const opponentColor = aiColor === 'white' ? 'black' : 'white';
  
  for (const move of moves) {
    // Simulate the move
    const newGameState = makeMove(gameState, move, true); // Skip repetition check for simulation
    
    // Check if this puts opponent in checkmate
    if (newGameState.gamePhase === 'ended' && newGameState.winner === aiColor) {
      return move;
    }
  }
  return null;
}

// Find moves that block opponent's checkmate threats
function findBlockingMove(gameState: GameState, moves: ChessMove[], aiColor: PieceColor): ChessMove | null {
  const opponentColor = aiColor === 'white' ? 'black' : 'white';
  
  // Check if opponent has a checkmate threat next turn
  const opponentMoves = getAllPossibleMoves(gameState, opponentColor);
  let hasCheckmateThreats = false;
  
  for (const opponentMove of opponentMoves) {
    const testState = makeMove(gameState, opponentMove, true);
    if (testState.gamePhase === 'ended' && testState.winner === opponentColor) {
      hasCheckmateThreats = true;
      break;
    }
  }
  
  if (!hasCheckmateThreats) return null;
  
  // Try each of our moves to see if any blocks the checkmate
  for (const move of moves) {
    const newGameState = makeMove(gameState, move, true);
    const futureOpponentMoves = getAllPossibleMoves(newGameState, opponentColor);
    
    let stillHasCheckmate = false;
    for (const futureOpponentMove of futureOpponentMoves) {
      const finalState = makeMove(newGameState, futureOpponentMove, true);
      if (finalState.gamePhase === 'ended' && finalState.winner === opponentColor) {
        stillHasCheckmate = true;
        break;
      }
    }
    
    if (!stillHasCheckmate) {
      return move; // This move blocks the checkmate threat
    }
  }
  
  return null;
}

function getRandomMove(gameState: GameState, color: PieceColor, preFilteredMoves?: ChessMove[]): ChessMove | null {
  const movesToConsider = preFilteredMoves || getAllPossibleMoves(gameState, color);
  if (movesToConsider.length === 0) return null;
  
  return movesToConsider[Math.floor(Math.random() * movesToConsider.length)];
}

function getBasicStrategyMove(gameState: GameState, color: PieceColor, preFilteredMoves?: ChessMove[]): ChessMove | null {
  const movesToConsider = preFilteredMoves || getAllPossibleMoves(gameState, color);
  if (movesToConsider.length === 0) return null;
  
  // Prioritize captures
  const captures = movesToConsider.filter(move => move.captured);
  if (captures.length > 0) {
    return captures[Math.floor(Math.random() * captures.length)];
  }
  
  // Prioritize center control
  const centerMoves = movesToConsider.filter(move => {
    const row = move.to.row;
    const col = move.to.col;
    return row >= 3 && row <= 6 && col >= 3 && col <= 6;
  });
  
  if (centerMoves.length > 0) {
    return centerMoves[Math.floor(Math.random() * centerMoves.length)];
  }
  
  return movesToConsider[Math.floor(Math.random() * movesToConsider.length)];
}

function getAdvancedStrategyMove(gameState: GameState, color: PieceColor, preFilteredMoves?: ChessMove[]): ChessMove | null {
  const movesToConsider = preFilteredMoves || getAllPossibleMoves(gameState, color);
  if (movesToConsider.length === 0) return null;
  
  // Evaluate each move with advanced scoring (use filtered moves)
  let bestMove = movesToConsider[0];
  let bestScore = -Infinity;
  
  for (const move of movesToConsider) {
    const score = evaluateMove(gameState, move);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  console.log(`🎯 AI selected best move with score ${bestScore}: ${bestMove.piece.type} ${String.fromCharCode(97 + bestMove.from.col)}${10 - bestMove.from.row} to ${String.fromCharCode(97 + bestMove.to.col)}${10 - bestMove.to.row}`);
  return bestMove;
}

function evaluateMove(gameState: GameState, move: ChessMove): number {
  let score = 0;
  
  // Piece values (enhanced for more aggressive play)
  const pieceValues: Record<string, number> = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    wizard: 4,
    king: 0
  };
  
  // Capture bonus (much higher priority)
  if (move.captured) {
    score += pieceValues[move.captured.type] * 15; // Increased from 10
  }
  
  // Check bonus (putting opponent in check is valuable)
  const simulatedState = makeMove(gameState, move, true);
  const opponentColor = gameState.currentPlayer === 'white' ? 'black' : 'white';
  if (isKingInCheck(simulatedState.board, opponentColor)) {
    score += 20; // High bonus for check moves
  }
  
  // Checkmate bonus (highest priority)
  if (simulatedState.gamePhase === 'ended' && simulatedState.winner === gameState.currentPlayer) {
    score += 1000; // Massive bonus for checkmate
  }
  
  // Center control
  const centerBonus = getCenterControlBonus(move.to);
  score += centerBonus;
  
  // Attack towards enemy king (aggressive positioning)
  const enemyKingPos = findKingPosition(simulatedState.board, opponentColor);
  if (enemyKingPos) {
    const distance = Math.abs(move.to.row - enemyKingPos.row) + Math.abs(move.to.col - enemyKingPos.col);
    score += Math.max(0, 8 - distance); // Closer to enemy king = better
  }
  
  // Piece development
  if (!move.piece.hasMoved && move.piece.type !== 'pawn') {
    score += 2;
  }
  
  // Special wizard moves
  if (move.piece.type === 'wizard') {
    if (move.isWizardTeleport) score += 1;
    if (move.isWizardAttack) score += 3;
  }
  
  // King safety (reduced penalty, sometimes king moves are necessary)
  if (move.piece.type === 'king') {
    score -= 3;
  }
  
  return score;
}

function getCenterControlBonus(position: Position): number {
  const { row, col } = position;
  
  // Center squares (4,4), (4,5), (5,4), (5,5)
  if ((row === 4 || row === 5) && (col === 4 || col === 5)) {
    return 3;
  }
  
  // Extended center
  if (row >= 3 && row <= 6 && col >= 3 && col <= 6) {
    return 1;
  }
  
  return 0;
}

// Helper function to find king position
function findKingPosition(board: (ChessPiece | null)[][], color: PieceColor): Position | null {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

function getAllPossibleMoves(gameState: GameState, color: PieceColor): ChessMove[] {
  const moves: ChessMove[] = [];
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === color) {
        const from = { row, col };
        const possibleMoves = getPossibleMoves(gameState.board, from, piece);
        
        for (const to of possibleMoves) {
          const captured = gameState.board[to.row][to.col] || undefined;
          const isWizardTeleport = piece.type === 'wizard' && !captured;
          const isWizardAttack = piece.type === 'wizard' && !!captured;
          
          // Check if pawn promotion is needed
          const promotion = piece.type === 'pawn' && 
            ((piece.color === 'white' && to.row === 0) || (piece.color === 'black' && to.row === 9)) 
            ? 'queen' // Auto-promote to queen
            : undefined;
          
          // Validate move doesn't put own king in check
          const testBoard = gameState.board.map(r => [...r]);
          let pieceToPlace = piece;
          if (promotion) {
            pieceToPlace = { ...piece, type: promotion };
          }
          testBoard[to.row][to.col] = pieceToPlace;
          if (!isWizardAttack) {
            testBoard[from.row][from.col] = null;
          }
          
          if (!isKingInCheck(testBoard, color)) {
            moves.push({
              from,
              to,
              piece,
              captured,
              isWizardTeleport,
              isWizardAttack,
              promotion
            });
          }
        }
      }
    }
  }
  
  return moves;
}
