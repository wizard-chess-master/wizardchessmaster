import { ChessPiece, Position } from './types';
import { isValidPosition } from './gameEngine';

export function getPossibleMoves(
  board: (ChessPiece | null)[][],
  position: Position,
  piece: ChessPiece
): Position[] {
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, position, piece);
    case 'rook':
      return getRookMoves(board, position, piece);
    case 'knight':
      return getKnightMoves(board, position, piece);
    case 'bishop':
      return getBishopMoves(board, position, piece);
    case 'queen':
      return getQueenMoves(board, position, piece);
    case 'king':
      return getKingMoves(board, position, piece);
    case 'wizard':
      return getWizardMoves(board, position, piece);
    default:
      return [];
  }
}

function getPawnMoves(board: (ChessPiece | null)[][], pos: Position, piece: ChessPiece): Position[] {
  const moves: Position[] = [];
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 8 : 1;
  
  // Move forward one square
  const oneForward = { row: pos.row + direction, col: pos.col };
  if (isValidPosition(oneForward) && !board[oneForward.row][oneForward.col]) {
    moves.push(oneForward);
    
    // Move forward two squares from starting position
    if (pos.row === startRow) {
      const twoForward = { row: pos.row + 2 * direction, col: pos.col };
      if (isValidPosition(twoForward) && !board[twoForward.row][twoForward.col]) {
        moves.push(twoForward);
      }
    }
  }
  
  // Diagonal captures
  for (const colOffset of [-1, 1]) {
    const capturePos = { row: pos.row + direction, col: pos.col + colOffset };
    if (isValidPosition(capturePos)) {
      const target = board[capturePos.row][capturePos.col];
      if (target && target.color !== piece.color) {
        moves.push(capturePos);
      }
    }
  }
  
  return moves;
}

function getRookMoves(board: (ChessPiece | null)[][], pos: Position, piece: ChessPiece): Position[] {
  const moves: Position[] = [];
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  
  for (const [dr, dc] of directions) {
    for (let i = 1; i < 10; i++) {
      const newPos = { row: pos.row + dr * i, col: pos.col + dc * i };
      
      if (!isValidPosition(newPos)) break;
      
      const target = board[newPos.row][newPos.col];
      if (!target) {
        moves.push(newPos);
      } else {
        if (target.color !== piece.color) {
          moves.push(newPos);
        }
        break;
      }
    }
  }
  
  return moves;
}

function getKnightMoves(board: (ChessPiece | null)[][], pos: Position, piece: ChessPiece): Position[] {
  const moves: Position[] = [];
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  
  for (const [dr, dc] of knightMoves) {
    const newPos = { row: pos.row + dr, col: pos.col + dc };
    
    if (isValidPosition(newPos)) {
      const target = board[newPos.row][newPos.col];
      if (!target || target.color !== piece.color) {
        moves.push(newPos);
      }
    }
  }
  
  return moves;
}

function getBishopMoves(board: (ChessPiece | null)[][], pos: Position, piece: ChessPiece): Position[] {
  const moves: Position[] = [];
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  
  for (const [dr, dc] of directions) {
    for (let i = 1; i < 10; i++) {
      const newPos = { row: pos.row + dr * i, col: pos.col + dc * i };
      
      if (!isValidPosition(newPos)) break;
      
      const target = board[newPos.row][newPos.col];
      if (!target) {
        moves.push(newPos);
      } else {
        if (target.color !== piece.color) {
          moves.push(newPos);
        }
        break;
      }
    }
  }
  
  return moves;
}

function getQueenMoves(board: (ChessPiece | null)[][], pos: Position, piece: ChessPiece): Position[] {
  return [...getRookMoves(board, pos, piece), ...getBishopMoves(board, pos, piece)];
}

function getKingMoves(board: (ChessPiece | null)[][], pos: Position, piece: ChessPiece): Position[] {
  const moves: Position[] = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  // Get castling moves first
  const castlingMoves = getCastlingMoves(board, pos, piece);
  
  for (const [dr, dc] of directions) {
    const newPos = { row: pos.row + dr, col: pos.col + dc };
    
    if (isValidPosition(newPos)) {
      const target = board[newPos.row][newPos.col];
      if (!target || target.color !== piece.color) {
        // Don't add regular moves that conflict with castling columns to prevent rendering conflicts
        const conflictsWithCastling = castlingMoves.length > 0 && (newPos.col === 2 || newPos.col === 7);
        if (!conflictsWithCastling) {
          moves.push(newPos);
        }
      }
    }
  }
  
  // Add castling moves
  moves.push(...castlingMoves);
  
  return moves;
}

function getCastlingMoves(board: (ChessPiece | null)[][], pos: Position, king: ChessPiece): Position[] {
  const moves: Position[] = [];
  
  // Can't castle if king has moved
  if (king.hasMoved) return moves;
  
  // Can't castle if king is in check (simple check without importing circular dependency)
  if (isKingUnderAttack(board, pos, king.color)) return moves;
  
  const homeRow = king.color === 'white' ? 9 : 0;
  
  // Only allow castling if king is on home row in starting position (column 5)
  if (pos.row !== homeRow || pos.col !== 5) return moves;
  
  // Check castling queenside (king to c1/c10, rook a1/a10 to d1/d10)
  const queensideRook = board[homeRow][0];
  if (queensideRook && 
      queensideRook.type === 'rook' && 
      queensideRook.color === king.color && 
      !queensideRook.hasMoved) {
    
    // Check if path is clear (b1, c1, d1 for white)
    let pathClear = true;
    for (let col = 1; col <= 4; col++) {
      if (board[homeRow][col] && col !== 5) { // Skip king position
        pathClear = false;
        break;
      }
    }
    
    if (pathClear) {
      // Check if king would pass through or end up in check
      // King moves through columns 4, 3, 2 (from 5 to 2)
      let canCastle = true;
      for (let col = 2; col <= 5; col++) { // Check columns 2, 3, 4, 5 (destination and all squares king passes through)
        if (isKingUnderAttack(board, { row: homeRow, col }, king.color)) {
          canCastle = false;
          break;
        }
      }
      
      if (canCastle) {
        // King moves to c1/c10 (column 2)
        moves.push({ row: homeRow, col: 2 });
        console.log('🏰 Queenside castling move available:', { row: homeRow, col: 2 });
      }
    }
  }
  
  // Check castling kingside (king to g1/g10, rook j1/j10 to f1/f10)
  const kingsideRook = board[homeRow][9];
  if (kingsideRook && 
      kingsideRook.type === 'rook' && 
      kingsideRook.color === king.color && 
      !kingsideRook.hasMoved) {
    
    // Check if path is clear (f1, g1, h1, i1 for white)
    let pathClear = true;
    for (let col = 6; col <= 8; col++) {
      if (board[homeRow][col]) {
        pathClear = false;
        break;
      }
    }
    
    if (pathClear) {
      // Check if king would pass through or end up in check
      // King moves through columns 6, 7 (from 5 to 7)
      let canCastle = true;
      for (let col = 5; col <= 7; col++) { // Check columns 5, 6, 7 (current position and all squares king passes through)
        if (isKingUnderAttack(board, { row: homeRow, col }, king.color)) {
          canCastle = false;
          break;
        }
      }
      
      if (canCastle) {
        // King moves to g1/g10 (column 7) - corrected: should be column 7, not 6
        moves.push({ row: homeRow, col: 7 });
        console.log('🏰 Kingside castling move available:', { row: homeRow, col: 7 });
      }
    }
  }
  
  return moves;
}

// Simple check function to avoid circular dependency - does NOT include castling moves
function isKingUnderAttack(board: (ChessPiece | null)[][], kingPos: Position, kingColor: string): boolean {
  // Check if any opponent piece can attack the king position
  const opponentColor = kingColor === 'white' ? 'black' : 'white';
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        // Use simplified moves that DON'T include castling to prevent recursion
        const moves = getSimpleAttackMoves(board, { row, col }, piece);
        if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Simplified move generation for attack checking - NEVER includes castling moves
function getSimpleAttackMoves(
  board: (ChessPiece | null)[][],
  position: Position,
  piece: ChessPiece
): Position[] {
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, position, piece);
    case 'rook':
      return getRookMoves(board, position, piece);
    case 'knight':
      return getKnightMoves(board, position, piece);
    case 'bishop':
      return getBishopMoves(board, position, piece);
    case 'queen':
      return getQueenMoves(board, position, piece);
    case 'king':
      return getSimpleKingMoves(board, position, piece); // NO castling moves
    case 'wizard':
      return getWizardMoves(board, position, piece);
    default:
      return [];
  }
}

// King moves WITHOUT castling - prevents infinite recursion
function getSimpleKingMoves(board: (ChessPiece | null)[][], pos: Position, piece: ChessPiece): Position[] {
  const moves: Position[] = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  for (const [dr, dc] of directions) {
    const newPos = { row: pos.row + dr, col: pos.col + dc };
    
    if (isValidPosition(newPos)) {
      const target = board[newPos.row][newPos.col];
      if (!target || target.color !== piece.color) {
        moves.push(newPos);
      }
    }
  }
  
  // NO castling moves here to prevent recursion
  return moves;
}

function getWizardMoves(board: (ChessPiece | null)[][], pos: Position, piece: ChessPiece): Position[] {
  const moves: Position[] = [];
  
  // Wizard can teleport to any unoccupied square within 2 squares in straight line directions
  // and can attack any enemy piece within 2 squares, even through occupied squares
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],  // up-left, up, up-right
    [0, -1],           [0, 1],   // left, right
    [1, -1],  [1, 0],  [1, 1]    // down-left, down, down-right
  ];
  
  for (const [dr, dc] of directions) {
    // Check squares at distance 1 and 2 in this direction
    for (let distance = 1; distance <= 2; distance++) {
      const newPos = { row: pos.row + dr * distance, col: pos.col + dc * distance };
      
      if (isValidPosition(newPos)) {
        const target = board[newPos.row][newPos.col];
        
        // Can teleport to any empty square within range (regardless of pieces in between)
        if (!target) {
          moves.push(newPos);
        }
        // Can attack any enemy piece within range (even through occupied squares)
        else if (target.color !== piece.color) {
          moves.push(newPos);
          // Continue checking further squares - wizards can attack over pieces
        } else {
          // Own piece - can't attack it, but continue to check if we can teleport beyond it
          // (wizards can teleport over their own pieces to empty squares)
          continue;
        }
      }
    }
  }
  
  return moves;
}

export function getAllValidMoves(board: (ChessPiece | null)[][], color: string): Position[] {
  const moves: Position[] = [];
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const from = { row, col };
        const pieceMoves = getPossibleMoves(board, from, piece);
        
        // Filter out moves that would put own king in check
        const validMoves = pieceMoves.filter(to => {
          const testBoard = board.map(r => [...r]);
          
          // Special handling for castling moves
          if (piece.type === 'king' && from.col === 5 && (to.col === 2 || to.col === 6)) {
            const homeRow = piece.color === 'white' ? 9 : 0;
            
            // For castling, check that king doesn't pass through check
            if (to.col === 2) { // Queenside castling
              // Check that squares king passes through (f1->d1->c1) are not under attack
              for (let col = 5; col >= 2; col--) {
                const testPos = { row: homeRow, col };
                if (isKingUnderAttack(board, testPos, color)) {
                  return false;
                }
              }
            } else if (to.col === 6) { // Kingside castling
              // Check that squares king passes through (f1->g1) are not under attack
              for (let col = 5; col <= 6; col++) {
                const testPos = { row: homeRow, col };
                if (isKingUnderAttack(board, testPos, color)) {
                  return false;
                }
              }
            }
            return true; // Castling is valid if king doesn't pass through check
          }
          
          // Make the test move
          if (piece.type === 'wizard' && board[to.row][to.col] && board[to.row][to.col]!.color !== piece.color) {
            // Wizard attack: remove target but keep wizard in place
            testBoard[to.row][to.col] = null;
          } else {
            // Normal move: move piece to destination
            testBoard[to.row][to.col] = piece;
            testBoard[from.row][from.col] = null;
          }
          
          // Find king position and check if under attack
          let kingPos: Position | null = null;
          for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
              const p = testBoard[r][c];
              if (p && p.type === 'king' && p.color === color) {
                kingPos = { row: r, col: c };
                break;
              }
            }
            if (kingPos) break;
          }
          
          if (!kingPos) return false;
          return !isKingUnderAttack(testBoard, kingPos, color);
        });
        
        moves.push(...validMoves);
      }
    }
  }
  
  return moves;
}

export function isValidMove(
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position
): boolean {
  const piece = board[from.row][from.col];
  if (!piece) return false;
  
  const possibleMoves = getPossibleMoves(board, from, piece);
  return possibleMoves.some(move => move.row === to.row && move.col === to.col);
}
