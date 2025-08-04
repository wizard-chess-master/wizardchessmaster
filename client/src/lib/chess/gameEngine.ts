import { ChessPiece, Position, ChessMove, GameState, PieceColor, PieceType } from './types';
import { isValidMove, getAllValidMoves, getPossibleMoves } from './pieceMovement';

export function createInitialBoard(): (ChessPiece | null)[][] {
  const board: (ChessPiece | null)[][] = Array(10).fill(null).map(() => Array(10).fill(null));
  
  // Place white pieces (bottom, row 9) - centered like traditional chess
  board[9][1] = createPiece('rook', 'white', 'w-rook-1');
  board[9][2] = createPiece('knight', 'white', 'w-knight-2');
  board[9][3] = createPiece('bishop', 'white', 'w-bishop-3');
  board[9][4] = createPiece('queen', 'white', 'w-queen-4');
  board[9][5] = createPiece('king', 'white', 'w-king-5');
  board[9][6] = createPiece('bishop', 'white', 'w-bishop-6');
  board[9][7] = createPiece('knight', 'white', 'w-knight-7');
  board[9][8] = createPiece('rook', 'white', 'w-rook-8');
  
  // White pawns (row 8) - all 10 columns
  for (let col = 0; col < 10; col++) {
    board[8][col] = createPiece('pawn', 'white', `w-pawn-${col}`);
  }
  
  // White wizards in corners
  board[9][0] = createPiece('wizard', 'white', 'w-wizard-0'); // a1
  board[9][9] = createPiece('wizard', 'white', 'w-wizard-9'); // j1
  
  // Place black pieces (top, row 0) - centered like traditional chess
  board[0][1] = createPiece('rook', 'black', 'b-rook-1');
  board[0][2] = createPiece('knight', 'black', 'b-knight-2');
  board[0][3] = createPiece('bishop', 'black', 'b-bishop-3');
  board[0][4] = createPiece('queen', 'black', 'b-queen-4');
  board[0][5] = createPiece('king', 'black', 'b-king-5');
  board[0][6] = createPiece('bishop', 'black', 'b-bishop-6');
  board[0][7] = createPiece('knight', 'black', 'b-knight-7');
  board[0][8] = createPiece('rook', 'black', 'b-rook-8');
  
  // Black pawns (row 1) - all 10 columns
  for (let col = 0; col < 10; col++) {
    board[1][col] = createPiece('pawn', 'black', `b-pawn-${col}`);
  }
  
  // Black wizards in corners
  board[0][0] = createPiece('wizard', 'black', 'b-wizard-0'); // a10
  board[0][9] = createPiece('wizard', 'black', 'b-wizard-9'); // j10
  
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
  if (move.isWizardAttack) {
    // Wizard attacks: remove target piece but wizard stays in place
    newBoard[move.to.row][move.to.col] = null;
    newBoard[move.from.row][move.from.col] = { ...move.piece, hasMoved: true };
  } else {
    // Normal move or wizard teleport: move piece to new position
    let pieceToPlace = { ...move.piece, hasMoved: true };
    
    // Handle pawn promotion
    if (move.piece.type === 'pawn' && move.promotion) {
      const promotionRow = move.piece.color === 'white' ? 0 : 9;
      if (move.to.row === promotionRow) {
        pieceToPlace = {
          ...pieceToPlace,
          type: move.promotion,
          id: `${move.piece.color}-${move.promotion}-promoted-${move.to.row}-${move.to.col}`
        };
      }
    }
    
    newBoard[move.to.row][move.to.col] = pieceToPlace;
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

export function requiresPromotion(piece: ChessPiece, toPosition: Position): boolean {
  if (piece.type !== 'pawn') return false;
  
  const promotionRow = piece.color === 'white' ? 0 : 9;
  return toPosition.row === promotionRow;
}

export function getDefaultPromotion(piece: ChessPiece): PieceType {
  // Default promotion to queen
  return 'queen';
}
