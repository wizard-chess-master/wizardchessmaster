import { ChessPiece, Position, ChessMove, GameState, PieceColor, PieceType } from './types';
import { isValidMove, getAllValidMoves, getPossibleMoves } from './pieceMovement';

export function createInitialBoard(): (ChessPiece | null)[][] {
  const board: (ChessPiece | null)[][] = Array(10).fill(null).map(() => Array(10).fill(null));
  
  // Place white pieces
  const whiteBackRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'wizard', 'bishop', 'knight', 'rook'];
  whiteBackRow.forEach((type, col) => {
    if (col < 9) {
      board[9][col] = createPiece(type, 'white', `w-${type}-${col}`);
    }
  });
  board[9][9] = createPiece('rook', 'white', 'w-rook-9');
  
  // White pawns
  for (let col = 0; col < 10; col++) {
    board[8][col] = createPiece('pawn', 'white', `w-pawn-${col}`);
  }
  
  // Place black pieces
  const blackBackRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'wizard', 'bishop', 'knight', 'rook'];
  blackBackRow.forEach((type, col) => {
    if (col < 9) {
      board[0][col] = createPiece(type, 'black', `b-${type}-${col}`);
    }
  });
  board[0][9] = createPiece('rook', 'black', 'b-rook-9');
  
  // Black pawns
  for (let col = 0; col < 10; col++) {
    board[1][col] = createPiece('pawn', 'black', `b-pawn-${col}`);
  }
  
  return board;
}

function createPiece(type: PieceType, color: PieceColor, id: string): ChessPiece {
  return { type, color, id, hasMoved: false };
}

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 10 && pos.col >= 0 && pos.col < 10;
}

export function makeMove(gameState: GameState, move: ChessMove): GameState {
  const newBoard = gameState.board.map(row => [...row]);
  const newMoveHistory = [...gameState.moveHistory, move];
  
  // Handle the move
  newBoard[move.to.row][move.to.col] = { ...move.piece, hasMoved: true };
  
  if (!move.isWizardAttack) {
    newBoard[move.from.row][move.from.col] = null;
  }
  
  // Switch players
  const nextPlayer: PieceColor = gameState.currentPlayer === 'white' ? 'black' : 'white';
  
  // Check for check, checkmate, stalemate
  const isInCheck = isKingInCheck(newBoard, nextPlayer);
  const allMoves = getAllValidMoves(newBoard, nextPlayer);
  const isCheckmate = isInCheck && allMoves.length === 0;
  const isStalemate = !isInCheck && allMoves.length === 0;
  
  return {
    ...gameState,
    board: newBoard,
    currentPlayer: nextPlayer,
    selectedPosition: null,
    validMoves: [],
    moveHistory: newMoveHistory,
    isInCheck,
    isCheckmate,
    isStalemate,
    gamePhase: isCheckmate || isStalemate ? 'ended' : 'playing',
    winner: isCheckmate ? gameState.currentPlayer : null
  };
}

export function isKingInCheck(board: (ChessPiece | null)[][], color: PieceColor): boolean {
  // Find the king
  let kingPos: Position | null = null;
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        kingPos = { row, col };
        break;
      }
    }
    if (kingPos) break;
  }
  
  if (!kingPos) return false;
  
  // Check if any enemy piece can attack the king
  const enemyColor: PieceColor = color === 'white' ? 'black' : 'white';
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = board[row][col];
      if (piece && piece.color === enemyColor) {
        const moves = getPossibleMoves(board, { row, col }, piece);
        if (moves.some(move => move.row === kingPos!.row && move.col === kingPos!.col)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

export function getValidMovesForPosition(gameState: GameState, position: Position): Position[] {
  const piece = gameState.board[position.row][position.col];
  if (!piece || piece.color !== gameState.currentPlayer) {
    return [];
  }
  
  const possibleMoves = getPossibleMoves(gameState.board, position, piece);
  
  // Filter out moves that would put own king in check
  return possibleMoves.filter(movePos => {
    const testBoard = gameState.board.map(row => [...row]);
    const originalPiece = testBoard[movePos.row][movePos.col];
    
    // Make the test move
    testBoard[movePos.row][movePos.col] = piece;
    if (piece.type !== 'wizard' || !isWizardAttack(position, movePos, testBoard)) {
      testBoard[position.row][position.col] = null;
    }
    
    const wouldBeInCheck = isKingInCheck(testBoard, piece.color);
    
    // Restore the board
    testBoard[position.row][position.col] = piece;
    testBoard[movePos.row][movePos.col] = originalPiece;
    
    return !wouldBeInCheck;
  });
}

function isWizardAttack(from: Position, to: Position, board: (ChessPiece | null)[][]): boolean {
  const piece = board[from.row][from.col];
  const target = board[to.row][to.col];
  
  if (!piece || piece.type !== 'wizard' || !target) return false;
  
  const distance = Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col));
  return distance <= 2 && target.color !== piece.color;
}
