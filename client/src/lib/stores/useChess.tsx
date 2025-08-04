import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameState, ChessMove, Position, GameMode, AIDifficulty, PieceColor } from "../chess/types";
import { createInitialBoard, makeMove, getValidMovesForPosition } from "../chess/gameEngine";
import { getAIMove } from "../chess/aiPlayer";
import { useAudio } from "./useAudio";

interface ChessStore extends GameState {
  // Actions
  startGame: (mode: GameMode, aiDifficulty?: AIDifficulty) => void;
  selectSquare: (position: Position) => void;
  makePlayerMove: (from: Position, to: Position) => void;
  makeAIMove: () => void;
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
    },

    selectSquare: (position: Position) => {
      const state = get();
      if (state.gamePhase !== 'playing') return;

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

      const isWizardTeleport = piece.type === 'wizard' && !captured;
      const isWizardAttack = piece.type === 'wizard' && !!captured && captured.color !== piece.color;

      const move: ChessMove = {
        from,
        to,
        piece,
        captured,
        isWizardTeleport,
        isWizardAttack
      };

      // Play move sound
      const { playHit } = useAudio.getState();
      if (captured || isWizardAttack) {
        playHit();
      }

      const newState = makeMove(state, move);
      set(newState);

      // If playing against AI and it's AI's turn, make AI move after a delay
      if (newState.gameMode === 'ai' && newState.currentPlayer === 'black' && newState.gamePhase === 'playing') {
        setTimeout(() => {
          get().makeAIMove();
        }, 500);
      }
    },

    makeAIMove: () => {
      const state = get();
      if (state.gamePhase !== 'playing' || state.gameMode !== 'ai' || state.currentPlayer !== 'black') {
        return;
      }

      const aiMove = getAIMove(state);
      if (aiMove) {
        const newState = makeMove(state, aiMove);
        set(newState);
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
