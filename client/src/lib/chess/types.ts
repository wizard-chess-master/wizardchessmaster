export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'wizard';
export type PieceColor = 'white' | 'black';
export type GamePhase = 'menu' | 'playing' | 'ended';
export type GameMode = 'local' | 'ai' | 'ai-vs-ai' | 'multiplayer';
// 20 difficulty levels for 20 campaign levels
export type AIDifficulty = 
  | 'level1' | 'level2' | 'level3' | 'level4' | 'level5'
  | 'level6' | 'level7' | 'level8' | 'level9' | 'level10'
  | 'level11' | 'level12' | 'level13' | 'level14' | 'level15'
  | 'level16' | 'level17' | 'level18' | 'level19' | 'level20'
  // Legacy difficulty names for backward compatibility
  | 'easy' | 'medium' | 'hard' | 'advanced' | 'expert' | 'master';

export interface Position {
  row: number;
  col: number;
}

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  id: string;
  hasMoved?: boolean;
}

export interface ChessMove {
  from: Position;
  to: Position;
  piece: ChessPiece;
  captured?: ChessPiece;
  isWizardTeleport?: boolean;
  isWizardAttack?: boolean;
  promotion?: PieceType; // For pawn promotion
  isCastling?: boolean;
  rookMove?: { from: Position; to: Position }; // For castling, track rook movement
  notation?: string; // Move notation (e.g., "e2e4", "Nf3")
  move?: string; // Alternative move representation
}

export interface GameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  selectedPosition: Position | null;
  validMoves: Position[];
  gamePhase: GamePhase;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  moveHistory: ChessMove[];
  isInCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  winner: PieceColor | null;
}

export interface AIMove {
  move: ChessMove;
  score: number;
}
