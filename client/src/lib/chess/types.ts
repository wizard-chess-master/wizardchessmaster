export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'wizard';
export type PieceColor = 'white' | 'black';
export type GamePhase = 'menu' | 'playing' | 'ended';
export type GameMode = 'local' | 'ai' | 'ai-vs-ai';
export type AIDifficulty = 'easy' | 'medium' | 'hard';

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
