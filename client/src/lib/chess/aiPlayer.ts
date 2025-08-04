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
  
  // PRIORITY 3: Try to use learned patterns (for medium and hard difficulty)
  if (gameState.aiDifficulty !== 'easy') {
    const learnedMove = aiLearning.getBestLearnedMove(gameState, aiColor);
    if (learnedMove) {
      // Validate the learned move is still legal
      const isLearnedMoveLegal = allMoves.some(move => 
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
  
  // PRIORITY 4: Fall back to original strategy
  switch (gameState.aiDifficulty) {
    case 'easy':
      return getRandomMove(gameState, aiColor);
    case 'medium':
      return getBasicStrategyMove(gameState, aiColor);
    case 'hard':
      return getAdvancedStrategyMove(gameState, aiColor);
    default:
      return getRandomMove(gameState, aiColor);
  }
}

// Filter out moves that would create immediate repetition
function filterRepetitiveMoves(gameState: GameState, moves: ChessMove[]): ChessMove[] {
  if (gameState.moveHistory.length < 3) return moves;
  
  const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
  const secondLastMove = gameState.moveHistory[gameState.moveHistory.length - 2];
  
  return moves.filter(move => {
    // Don't immediately reverse the last move with the same piece
    if (lastMove && 
        move.from.row === lastMove.to.row && 
        move.from.col === lastMove.to.col &&
        move.to.row === lastMove.from.row && 
        move.to.col === lastMove.from.col &&
        move.piece.type === lastMove.piece.type) {
      return false;
    }
    
    // Don't repeat the exact same move as 2 moves ago
    if (secondLastMove &&
        move.from.row === secondLastMove.from.row && 
        move.from.col === secondLastMove.from.col &&
        move.to.row === secondLastMove.to.row && 
        move.to.col === secondLastMove.to.col &&
        move.piece.type === secondLastMove.piece.type) {
      return false;
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

function getRandomMove(gameState: GameState, color: PieceColor): ChessMove | null {
  const allMoves = getAllPossibleMoves(gameState, color);
  if (allMoves.length === 0) return null;
  
  // Filter out repetitive moves to prevent endless loops
  const nonRepetitiveMoves = filterRepetitiveMoves(gameState, allMoves);
  const movesToConsider = nonRepetitiveMoves.length > 0 ? nonRepetitiveMoves : allMoves;
  
  return movesToConsider[Math.floor(Math.random() * movesToConsider.length)];
}

function getBasicStrategyMove(gameState: GameState, color: PieceColor): ChessMove | null {
  const allMoves = getAllPossibleMoves(gameState, color);
  if (allMoves.length === 0) return null;
  
  // Filter out repetitive moves to prevent endless loops
  const nonRepetitiveMoves = filterRepetitiveMoves(gameState, allMoves);
  const movesToConsider = nonRepetitiveMoves.length > 0 ? nonRepetitiveMoves : allMoves;
  
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

function getAdvancedStrategyMove(gameState: GameState, color: PieceColor): ChessMove | null {
  const allMoves = getAllPossibleMoves(gameState, color);
  if (allMoves.length === 0) return null;
  
  // Filter out repetitive moves to prevent endless loops
  const nonRepetitiveMoves = filterRepetitiveMoves(gameState, allMoves);
  const movesToConsider = nonRepetitiveMoves.length > 0 ? nonRepetitiveMoves : allMoves;
  
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
