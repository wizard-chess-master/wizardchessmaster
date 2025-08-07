import { ChessPiece, Position, ChessMove, GameState, PieceColor, PieceType } from './types';
import { isValidMove, getAllValidMoves, getPossibleMoves } from './pieceMovement';

export function createInitialBoard(): (ChessPiece | null)[][] {
  const board: (ChessPiece | null)[][] = Array(10).fill(null).map(() => Array(10).fill(null));
  
  // White pieces (bottom row 9): rook, knight, bishop, wizard, queen, king, wizard, bishop, knight, rook
  board[9][0] = createPiece('rook', 'white', 'w-rook-0');     // a1
  board[9][1] = createPiece('knight', 'white', 'w-knight-1');  // b1
  board[9][2] = createPiece('bishop', 'white', 'w-bishop-2');  // c1
  board[9][3] = createPiece('wizard', 'white', 'w-wizard-3');  // d1
  board[9][4] = createPiece('queen', 'white', 'w-queen-4');    // e1
  board[9][5] = createPiece('king', 'white', 'w-king-5');      // f1
  board[9][6] = createPiece('wizard', 'white', 'w-wizard-6');  // g1
  board[9][7] = createPiece('bishop', 'white', 'w-bishop-7');  // h1
  board[9][8] = createPiece('knight', 'white', 'w-knight-8');  // i1
  board[9][9] = createPiece('rook', 'white', 'w-rook-9');      // j1
  
  // White pawns (row 8) - all 10 columns
  for (let col = 0; col < 10; col++) {
    board[8][col] = createPiece('pawn', 'white', `w-pawn-${col}`);
  }
  
  // Black pieces (top row 0): rook, knight, bishop, wizard, queen, king, wizard, bishop, knight, rook
  board[0][0] = createPiece('rook', 'black', 'b-rook-0');     // a10
  board[0][1] = createPiece('knight', 'black', 'b-knight-1');  // b10
  board[0][2] = createPiece('bishop', 'black', 'b-bishop-2');  // c10
  board[0][3] = createPiece('wizard', 'black', 'b-wizard-3');  // d10
  board[0][4] = createPiece('queen', 'black', 'b-queen-4');    // e10
  board[0][5] = createPiece('king', 'black', 'b-king-5');      // f10
  board[0][6] = createPiece('wizard', 'black', 'b-wizard-6');  // g10
  board[0][7] = createPiece('bishop', 'black', 'b-bishop-7');  // h10
  board[0][8] = createPiece('knight', 'black', 'b-knight-8');  // i10
  board[0][9] = createPiece('rook', 'black', 'b-rook-9');      // j10
  
  // Black pawns (row 1) - all 10 columns
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

// More lenient cycle detection - only for very long repeating patterns
function detectMoveCycles(moveHistory: ChessMove[], cycleLength: number = 20): boolean {
  if (moveHistory.length < cycleLength * 3) return false; // Require 3 full cycles before detecting
  
  const recentMoves = moveHistory.slice(-cycleLength * 3);
  const firstCycle = recentMoves.slice(0, cycleLength);
  const secondCycle = recentMoves.slice(cycleLength, cycleLength * 2);
  const thirdCycle = recentMoves.slice(cycleLength * 2);
  
  // Check if all three cycles are identical
  for (let i = 0; i < cycleLength; i++) {
    const move1 = firstCycle[i];
    const move2 = secondCycle[i];
    const move3 = thirdCycle[i];
    
    if (move1.from.row !== move2.from.row || move1.from.row !== move3.from.row ||
        move1.from.col !== move2.from.col || move1.from.col !== move3.from.col ||
        move1.to.row !== move2.to.row || move1.to.row !== move3.to.row ||
        move1.to.col !== move2.to.col || move1.to.col !== move3.to.col ||
        move1.piece.type !== move2.piece.type || move1.piece.type !== move3.piece.type ||
        move1.piece.color !== move2.piece.color || move1.piece.color !== move3.piece.color) {
      return false;
    }
  }
  
  console.log(`🔄 Detected ${cycleLength}-move cycle repeated 3 times (${moveHistory.length} total moves), declaring draw to prevent infinite loop`);
  return true;
}

// Much more lenient 2-move repetition detection - only for very long games
function detectSimpleRepetition(moveHistory: ChessMove[]): boolean {
  if (moveHistory.length < 24) return false; // Require at least 24 moves (12 per player)
  
  // Look for 6 consecutive repetitions of the same 2-move pattern
  const last12 = moveHistory.slice(-12);
  
  // Check if last 12 moves show A-B-A-B-A-B-A-B-A-B-A-B pattern (6 repetitions)
  for (let i = 0; i < 10; i += 2) {
    const moveA1 = last12[i];
    const moveB1 = last12[i + 1];
    const moveA2 = last12[i + 2];
    const moveB2 = last12[i + 3];
    
    if (!(moveA1.from.row === moveA2.from.row && moveA1.from.col === moveA2.from.col &&
          moveA1.to.row === moveA2.to.row && moveA1.to.col === moveA2.to.col &&
          moveB1.from.row === moveB2.from.row && moveB1.from.col === moveB2.from.col &&
          moveB1.to.row === moveB2.to.row && moveB1.to.col === moveB2.to.col &&
          moveA1.piece.type === moveA2.piece.type && moveB1.piece.type === moveB2.piece.type)) {
      return false; // Pattern broken
    }
  }
  
  console.log('🔄 DETECTED excessive 2-move repetition (6+ cycles), declaring stalemate after', moveHistory.length, 'moves');
  return true;
}

// More aggressive repetition detection - shorter cycles
function detectQuickRepetition(moveHistory: ChessMove[], skipRepetitionCheck: boolean = false): boolean {
  // Skip repetition detection during competitive training to allow proper evaluation
  if (skipRepetitionCheck) {
    return false;
  }
  
  if (moveHistory.length < 8) return false; // Increased threshold for more gameplay
  
  const last8 = moveHistory.slice(-8);
  
  // More strict repetition detection - require longer patterns
  let repetitionCount = 0;
  for (let i = 0; i < 6; i++) {
    for (let j = i + 2; j < 8; j++) {
      const moveA = last8[i];
      const moveB = last8[j];
      
      if (moveA.from.row === moveB.from.row && 
          moveA.from.col === moveB.from.col &&
          moveA.to.row === moveB.to.row && 
          moveA.to.col === moveB.to.col &&
          moveA.piece.type === moveB.piece.type) {
        repetitionCount++;
      }
    }
  }
  
  // Only declare stalemate if multiple repetitions detected
  if (repetitionCount >= 3) {
    console.log('🔄 DETECTED multiple repeated move patterns, declaring stalemate!');
    return true;
  }
  
  return false;
}

export function makeMove(gameState: GameState, move: ChessMove, skipRepetitionCheck?: boolean): GameState {
  const newBoard = gameState.board.map(row => [...row]);
  const newMoveHistory = [...gameState.moveHistory, move];
  
  // Handle the move
  if (move.isWizardAttack) {
    // Wizard attacks: remove target piece but wizard stays in place
    newBoard[move.to.row][move.to.col] = null;
    newBoard[move.from.row][move.from.col] = { ...move.piece, hasMoved: true };
  } else if (move.isCastling && move.rookMove) {
    // Castling: move king and rook
    newBoard[move.to.row][move.to.col] = { ...move.piece, hasMoved: true };
    newBoard[move.from.row][move.from.col] = null;
    
    // Move the rook
    const rook = newBoard[move.rookMove.from.row][move.rookMove.from.col];
    if (rook) {
      newBoard[move.rookMove.to.row][move.rookMove.to.col] = { ...rook, hasMoved: true };
      newBoard[move.rookMove.from.row][move.rookMove.from.col] = null;
    }
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
  
  // More lenient repetition detection for AI training
  const hasCycles = skipRepetitionCheck ? false : (
    detectMoveCycles(newMoveHistory, 20) || // Much higher threshold - 20-move cycles
    (newMoveHistory.length > 150 && detectSimpleRepetition(newMoveHistory)) // Only check simple repetition after 150+ moves
  );
  
  // Check for check, checkmate, stalemate
  const isInCheck = isKingInCheck(newBoard, nextPlayer);
  const allMoves = getAllValidMoves(newBoard, nextPlayer);
  const isCheckmate = isInCheck && allMoves.length === 0;
  const isStalemate = !isInCheck && allMoves.length === 0;
  
  // Game ends if checkmate, natural stalemate, or move cycles
  const gameEnded = isCheckmate || isStalemate || hasCycles;
  
  return {
    ...gameState,
    board: newBoard,
    currentPlayer: nextPlayer,
    selectedPosition: null,
    validMoves: [],
    moveHistory: newMoveHistory,
    isInCheck,
    isCheckmate,
    isStalemate: isStalemate || hasCycles,
    gamePhase: gameEnded ? 'ended' : 'playing',
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
