import { GameState, ChessMove, Position, AIDifficulty, PieceColor, ChessPiece } from './types';
import { getPossibleMoves } from './pieceMovement';
import { isKingInCheck, makeMove } from './gameEngine';
import { aiLearning } from './aiLearning';

export function getAIMove(gameState: GameState): ChessMove | null {
  const aiColor = gameState.currentPlayer;
  
  // First, try to use learned patterns (for medium and hard difficulty)
  if (gameState.aiDifficulty !== 'easy') {
    const learnedMove = aiLearning.getBestLearnedMove(gameState, aiColor);
    if (learnedMove) {
      // Validate the learned move is still legal
      const allMoves = getAllPossibleMoves(gameState, aiColor);
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
  
  // Fall back to original strategy
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

function getRandomMove(gameState: GameState, color: PieceColor): ChessMove | null {
  const allMoves = getAllPossibleMoves(gameState, color);
  if (allMoves.length === 0) return null;
  
  return allMoves[Math.floor(Math.random() * allMoves.length)];
}

function getBasicStrategyMove(gameState: GameState, color: PieceColor): ChessMove | null {
  const allMoves = getAllPossibleMoves(gameState, color);
  if (allMoves.length === 0) return null;
  
  // Prioritize captures
  const captures = allMoves.filter(move => move.captured);
  if (captures.length > 0) {
    return captures[Math.floor(Math.random() * captures.length)];
  }
  
  // Prioritize center control
  const centerMoves = allMoves.filter(move => {
    const row = move.to.row;
    const col = move.to.col;
    return row >= 3 && row <= 6 && col >= 3 && col <= 6;
  });
  
  if (centerMoves.length > 0) {
    return centerMoves[Math.floor(Math.random() * centerMoves.length)];
  }
  
  return allMoves[Math.floor(Math.random() * allMoves.length)];
}

function getAdvancedStrategyMove(gameState: GameState, color: PieceColor): ChessMove | null {
  const allMoves = getAllPossibleMoves(gameState, color);
  if (allMoves.length === 0) return null;
  
  let bestMove = allMoves[0];
  let bestScore = -Infinity;
  
  for (const move of allMoves) {
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
  
  // Piece values
  const pieceValues: Record<string, number> = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    wizard: 4,
    king: 0
  };
  
  // Capture value
  if (move.captured) {
    score += pieceValues[move.captured.type] * 10;
  }
  
  // Center control
  const centerBonus = getCenterControlBonus(move.to);
  score += centerBonus;
  
  // Piece development
  if (!move.piece.hasMoved && move.piece.type !== 'pawn') {
    score += 2;
  }
  
  // Special wizard moves
  if (move.piece.type === 'wizard') {
    if (move.isWizardTeleport) score += 1;
    if (move.isWizardAttack) score += 3;
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
