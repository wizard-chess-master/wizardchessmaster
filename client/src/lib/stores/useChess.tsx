import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameState, ChessMove, Position, GameMode, AIDifficulty, PieceColor } from "../chess/types";
import { createInitialBoard, makeMove, getValidMovesForPosition } from "../chess/gameEngine";
import { getAIMove } from "../chess/aiPlayer";
import { useAudio } from "./useAudio";
import { aiLearning } from "../chess/aiLearning";

interface ChessStore extends GameState {
  // Actions
  startGame: (mode: GameMode, aiDifficulty?: AIDifficulty) => void;
  selectSquare: (position: Position | null) => void;
  makePlayerMove: (from: Position, to: Position) => void;
  makeAIMove: () => void;
  makeAIVsAIMove: () => void;
  resetGame: () => void;
  undoMove: () => void;
}

const initialState: GameState = {
  board: createInitialBoard(),
  currentPlayer: 'white',
  selectedPosition: null,
  validMoves: [],
  gamePhase: 'menu',
  gameMode: 'local',
  aiDifficulty: 'medium',
  moveHistory: [],
  isInCheck: false,
  isCheckmate: false,
  isStalemate: false,
  winner: null
};

export const useChess = create<ChessStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    startGame: (mode: GameMode, aiDifficulty: AIDifficulty = 'medium') => {
      set({
        ...initialState,
        board: createInitialBoard(),
        gamePhase: 'playing',
        gameMode: mode,
        aiDifficulty: aiDifficulty
      });

      // Start AI vs AI gameplay immediately
      if (mode === 'ai-vs-ai') {
        setTimeout(() => {
          get().makeAIVsAIMove();
        }, 1000); // Start after 1 second
      }
    },

    selectSquare: (position: Position | null) => {
      const state = get();
      if (state.gamePhase !== 'playing') return;
      
      // Disable player interaction in AI vs AI mode
      if (state.gameMode === 'ai-vs-ai') return;

      // Handle explicit clearing
      if (!position) {
        set({
          selectedPosition: null,
          validMoves: []
        });
        return;
      }

      const piece = state.board[position.row][position.col];
      
      // If clicking on own piece, select it
      if (piece && piece.color === state.currentPlayer) {
        const validMoves = getValidMovesForPosition(state, position);
        set({
          selectedPosition: position,
          validMoves: validMoves
        });
        return;
      }

      // If a piece is selected and clicking on valid move, make the move
      if (state.selectedPosition) {
        const isValidMove = state.validMoves.some(
          move => move.row === position.row && move.col === position.col
        );
        
        if (isValidMove) {
          get().makePlayerMove(state.selectedPosition, position);
        } else {
          // Clear selection if clicking invalid square
          set({
            selectedPosition: null,
            validMoves: []
          });
        }
      }
    },

    makePlayerMove: (from: Position, to: Position) => {
      const state = get();
      const piece = state.board[from.row][from.col];
      const captured = state.board[to.row][to.col] || undefined;
      
      if (!piece) return;

      // Wizard movement logic: 
      // - Teleport: move to empty square within 2 squares (wizard moves to new position)
      // - Attack: destroy enemy within 2 squares but wizard STAYS in original position
      const isWizardMove = piece.type === 'wizard';
      const isWizardTeleport = isWizardMove && !captured;
      const isWizardAttack = isWizardMove && !!captured && captured.color !== piece.color;
      
      // Check for castling
      const isCastling = piece.type === 'king' && Math.abs(to.col - from.col) === 3;
      let rookMove: { from: Position; to: Position } | undefined = undefined;
      
      if (isCastling) {
        const homeRow = piece.color === 'white' ? 9 : 0;
        if (to.col === 2) { // Queenside castling (king to c1/c10)
          rookMove = { 
            from: { row: homeRow, col: 0 }, 
            to: { row: homeRow, col: 3 } 
          };
        } else if (to.col === 6) { // Kingside castling (king to g1/g10)  
          rookMove = { 
            from: { row: homeRow, col: 9 }, 
            to: { row: homeRow, col: 5 } 
          };
        }
      }
      
      // Check if pawn promotion is needed
      const promotion = piece.type === 'pawn' && 
        ((piece.color === 'white' && to.row === 0) || (piece.color === 'black' && to.row === 9)) 
        ? 'queen' // Auto-promote to queen for now
        : undefined;

      const move: ChessMove = {
        from,
        to,
        piece,
        captured,
        isWizardTeleport,
        isWizardAttack,
        promotion,
        isCastling,
        rookMove
      };

      // Play move sound
      const { playHit } = useAudio.getState();
      if (captured || isWizardAttack) {
        playHit();
      }

      const newState = makeMove(state, move);
      set(newState);

      // Analyze completed games for AI learning
      if (newState.gamePhase === 'ended' && state.gameMode === 'ai') {
        const aiColor: PieceColor = 'black'; // AI is always black in human vs AI mode
        aiLearning.analyzeGame(newState, aiColor, 'human');
      }

      // If playing against AI and it's AI's turn, make AI move after a delay
      if (newState.gameMode === 'ai' && newState.currentPlayer === 'black' && newState.gamePhase === 'playing') {
        setTimeout(() => {
          get().makeAIMove();
        }, 500);
      }
    },

    makeAIVsAIMove: () => {
      const state = get();
      if (state.gamePhase !== 'playing' || state.gameMode !== 'ai-vs-ai') {
        return;
      }

      const aiMove = getAIMove(state);
      if (aiMove) {
        // Play move sound
        const { playHit } = useAudio.getState();
        if (aiMove.captured || aiMove.isWizardAttack) {
          playHit();
        }

        // Skip repetition detection in AI vs AI mode to allow competitive evaluation
        const newState = makeMove(state, aiMove, true);
        set(newState);
        
        // Analyze completed AI vs AI games for learning
        if (newState.gamePhase === 'ended') {
          const aiColor: PieceColor = Math.random() > 0.5 ? 'white' : 'black'; // Randomly pick which AI to learn from
          aiLearning.analyzeGame(newState, aiColor, 'ai');
        }
        
        // Don't auto-continue AI moves - let the TrainingViewer control the timing
        // This prevents conflicts with the training viewer's speed control
      }
    },

    makeAIMove: () => {
      const state = get();
      if (state.gamePhase !== 'playing' || state.gameMode !== 'ai' || state.currentPlayer !== 'black') {
        return;
      }

      const aiMove = getAIMove(state);
      if (aiMove) {
        // Play move sound
        const { playHit } = useAudio.getState();
        if (aiMove.captured || aiMove.isWizardAttack) {
          playHit();
        }

        const newState = makeMove(state, aiMove);
        set(newState);

        // Analyze completed games for AI learning
        if (newState.gamePhase === 'ended' && state.gameMode === 'ai') {
          const aiColor: PieceColor = 'black'; // AI is always black in human vs AI mode
          aiLearning.analyzeGame(newState, aiColor, 'human');
        }
      }
    },

    resetGame: () => {
      set({
        ...initialState,
        gamePhase: 'menu'
      });
    },

    undoMove: () => {
      const state = get();
      if (state.moveHistory.length === 0) return;

      // For simplicity, just reset to initial state and replay all moves except the last one
      const movesToReplay = state.moveHistory.slice(0, -1);
      let newState: GameState = {
        ...initialState,
        board: createInitialBoard(),
        gamePhase: 'playing',
        gameMode: state.gameMode,
        aiDifficulty: state.aiDifficulty
      };

      for (const move of movesToReplay) {
        newState = makeMove(newState, move);
      }

      set(newState);
    }
  }))
);
