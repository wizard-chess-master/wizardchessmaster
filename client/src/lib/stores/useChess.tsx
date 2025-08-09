import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameState, ChessMove, Position, GameMode, AIDifficulty, PieceColor } from "../chess/types";
import { createInitialBoard, makeMove, getValidMovesForPosition } from "../chess/gameEngine";
import { getAIMove } from "../chess/aiPlayer";
import { useAudio } from "./useAudio";
// Audio managed by ChessAudioController component
import { aiLearning } from "../chess/aiLearning";
import { gameEventTracker } from "../achievements/gameEventTracker";
import { useCampaign } from "./useCampaign";
import { useLeaderboard } from "./useLeaderboard";
import { useAIDifficultyProgression } from "./useAIDifficultyProgression";
import { useWizardAssistant } from "./useWizardAssistant";

interface ChessStore extends GameState {
  // Campaign tracking
  gameStartTime: number;
  
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
    gameStartTime: Date.now(),

    startGame: (mode: GameMode, aiDifficulty: AIDifficulty = 'medium') => {
      const newBoard = createInitialBoard();
      console.log('🎮 Starting new game:', { mode, aiDifficulty });
      console.log('📋 Initial board created:', newBoard);
      console.log('🔍 White pawn positions (row 8):', newBoard[8]);
      console.log('🔍 White back pieces (row 9):', newBoard[9]);
      console.log('🔍 Black pawns (row 1):', newBoard[1]);
      console.log('🔍 Test piece at row 8, col 4:', newBoard[8][4]);
      console.log('🔍 Test piece at row 7, col 4:', newBoard[7][4]);
      console.log('🔍 Test piece at row 6, col 4:', newBoard[6][4]);
      
      set({
        board: newBoard,
        currentPlayer: 'white',
        selectedPosition: null,
        validMoves: [],
        gamePhase: 'playing',
        gameMode: mode,
        aiDifficulty: aiDifficulty,
        moveHistory: [],
        isInCheck: false,
        isCheckmate: false,
        isStalemate: false,
        winner: null,
        gameStartTime: Date.now()
      });
      
      // ELIMINATE old music and FORCE Theme-music1.mp3 playback
      // Clear all music variables pre-init
      if ((window as any).gameAudioManager) {
        (window as any).gameAudioManager = null;
      }
      
      // Enhanced cleanup function
      function cleanAudio() {
        if (typeof AudioContext !== 'undefined') { 
          new AudioContext().close(); 
        } 
        document.querySelectorAll('audio').forEach(a => { 
          a.pause(); 
          a.currentTime = 0; 
          a.src = ''; 
          a.remove(); 
        }); 
        console.log('Audio reset count:', document.querySelectorAll('audio').length);
      }
      
      // Call cleanup function first
      cleanAudio();
      
      // DISABLED - Theme music now controlled by MainMenu button only
      console.log('🚫 DISABLED - Theme music now controlled by MainMenu button only');
      // No audio creation here to prevent conflicts
      
      // Verify board state after setting
      setTimeout(() => {
        const { board } = get();
        console.log('✅ Board state verified after set:');
        console.log('🔍 Row 9 (WHITE HOME ROW - should have pieces):', board[9]);
        console.log('🔍 Row 8 (white pawns):', board[8]);
        console.log('🔍 Row 7 (empty):', board[7]);
        console.log('🔍 Row 2 (empty):', board[2]);
        console.log('🔍 Row 1 (black pawns):', board[1]);
        console.log('🔍 Row 0 (black pieces):', board[0]);
        console.log('🔍 Piece at 9,4 (should be white queen):', board[9][4]);
        console.log('🔍 Piece at 9,5 (should be white king):', board[9][5]);
        console.log('🔍 Piece at 8,4 (should be white pawn):', board[8][4]);
        
        // Count pieces for verification
        let whitePieces = 0, blackPieces = 0;
        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 10; col++) {
            const piece = board[row][col];
            if (piece) {
              if (piece.color === 'white') whitePieces++;
              if (piece.color === 'black') blackPieces++;
            }
          }
        }
        console.log('🔢 Total pieces count:', { whitePieces, blackPieces, expected: 20 });
      }, 100);

      // Start AI vs AI gameplay immediately
      if (mode === 'ai-vs-ai') {
        setTimeout(() => {
          get().makeAIVsAIMove();
        }, 1000); // Start after 1 second
      }
    },

    selectSquare: (position: Position | null) => {
      const state = get();
      console.log('🎯 selectSquare called:', { position, gamePhase: state.gamePhase, gameMode: state.gameMode, currentPlayer: state.currentPlayer });
      
      if (state.gamePhase !== 'playing') {
        console.log('❌ Game not in playing phase:', state.gamePhase);
        return;
      }
      
      // Disable player interaction in AI vs AI mode
      if (state.gameMode === 'ai-vs-ai') {
        console.log('❌ AI vs AI mode - player interaction disabled');
        return;
      }

      // Handle explicit clearing
      if (!position) {
        set({
          selectedPosition: null,
          validMoves: []
        });
        return;
      }

      const piece = state.board[position.row][position.col];
      console.log('🔍 Clicked position:', position, 'Piece found:', piece, 'Current player:', state.currentPlayer);
      
      // If clicking on own piece, select it
      if (piece && piece.color === state.currentPlayer) {
        console.log('✅ Selecting piece:', piece, 'at', position);
        const validMoves = getValidMovesForPosition(state, position);
        console.log('📋 Valid moves found:', validMoves.length, validMoves);
        
        // Debug current board state for castling
        if (piece.type === 'king') {
          const homeRow = piece.color === 'white' ? 9 : 0;
          const leftRook = state.board[homeRow][0];
          const rightRook = state.board[homeRow][9];
          console.log('🏰 Castling debug:', {
            kingHasMoved: piece.hasMoved,
            leftRook: leftRook ? {type: leftRook.type, hasMoved: leftRook.hasMoved} : null,
            rightRook: rightRook ? {type: rightRook.type, hasMoved: rightRook.hasMoved} : null,
            pathClear: 'checking...'
          });
        }
        set({
          selectedPosition: position,
          validMoves: validMoves
        });
        return;
      }
      
      console.log('❌ Cannot select:', { pieceExists: !!piece, pieceColor: piece?.color, currentPlayer: state.currentPlayer });

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
      const isCastling = piece.type === 'king' && from.col === 5 && (to.col === 2 || to.col === 6);
      let rookMove: { from: Position; to: Position } | undefined = undefined;
      
      if (isCastling) {
        const homeRow = piece.color === 'white' ? 9 : 0;
        if (to.col === 2) { // Queenside castling (king to c1/c10)
          rookMove = { 
            from: { row: homeRow, col: 0 }, 
            to: { row: homeRow, col: 3 } 
          };
          console.log('🏰 Queenside castling detected:', { kingMove: `${from.col}→${to.col}`, rookMove: `0→3` });
        } else if (to.col === 6) { // Kingside castling (king to g1/g10)  
          rookMove = { 
            from: { row: homeRow, col: 9 }, 
            to: { row: homeRow, col: 5 } 
          };
          console.log('🏰 Kingside castling detected:', { kingMove: `${from.col}→${to.col}`, rookMove: `9→5` });
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

      // Play audio based on move type
      console.log('🎵 Playing audio for:', { piece: piece.type, captured: !!captured, isWizardAttack, isWizardTeleport, isCastling, promotion });
      
      // Audio managed by ChessAudioController component

      const newState = makeMove(state, move);
      set(newState);
      
      // Audio managed by ChessAudioController component

      // Record PvP stats for local multiplayer games
      if (state.gameMode === 'local' && newState.gamePhase === 'ended') {
        const { recordPvPGame } = useLeaderboard.getState();
        const gameLength = Date.now() - state.gameStartTime;
        const result = newState.winner ? 'win' : 'draw'; // For local games, we'll consider both as wins
        recordPvPGame(result, gameLength);
      }

      // Analyze completed games for AI learning
      if (newState.gamePhase === 'ended' && state.gameMode === 'ai') {
        const aiColor: PieceColor = 'black'; // AI is always black in human vs AI mode
        aiLearning.analyzeGame(newState, aiColor, 'human');
        
        // Update campaign progress if in campaign mode
        const { isInCampaign, currentLevelId, completeCampaignGame } = useCampaign.getState();
        if (isInCampaign && currentLevelId) {
          const playerWon = newState.winner === 'white';
          const gameTime = Date.now() - state.gameStartTime;
          const moveCount = newState.moveHistory.length;
          completeCampaignGame(currentLevelId, playerWon, moveCount, gameTime);
          
          // Record campaign stats for leaderboard
          const { recordCampaignGame } = useLeaderboard.getState();
          const levelNumber = parseInt(currentLevelId.replace('level_', ''));
          recordCampaignGame(playerWon, gameTime, levelNumber);
        }
        
        // Record AI difficulty progression data and wizard assistant data
        if (state.gameMode === 'ai' && newState.gamePhase === 'ended') {
          const { recordGameResult } = useAIDifficultyProgression.getState();
          const { recordGamePerformance, generateHint, isActive } = useWizardAssistant.getState();
          const gameTime = Date.now() - state.gameStartTime;
          const moveAccuracy = Math.random() * 30 + 60; // Simulated accuracy 60-90%
          const outcome = newState.winner === 'white' ? 'win' : newState.winner === 'black' ? 'loss' : 'draw';
          const playerWon = newState.winner === 'white';
          
          // Record for difficulty progression
          recordGameResult(outcome, gameTime, moveAccuracy);
          
          // Record for wizard assistant
          recordGamePerformance(playerWon, newState.moveHistory.length, gameTime);
          
          // Generate post-game hint from wizard
          if (isActive) {
            const hintContext = playerWon 
              ? "Excellent victory! Your strategic mind grows stronger with each triumph."
              : "A valuable learning experience. Every master has faced such challenges - analyze and adapt.";
            setTimeout(() => generateHint(newState, hintContext), 1000);
          }
        }
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
        // Audio managed by ChessAudioController component
        // Audio managed by ChessAudioController component

        // Skip repetition detection in AI vs AI mode to allow competitive evaluation
        const newState = makeMove(state, aiMove, true);
        set(newState);
        
        // Analyze completed AI vs AI games for learning
        if (newState.gamePhase === 'ended') {
          const aiColor: PieceColor = Math.random() > 0.5 ? 'white' : 'black'; // Randomly pick which AI to learn from
          aiLearning.analyzeGame(newState, aiColor, 'ai');
        }
        
        // Continue AI vs AI game automatically if game is still playing
        if (newState.gamePhase === 'playing') {
          setTimeout(() => {
            get().makeAIVsAIMove();
          }, 1000); // 1 second delay between moves for visibility
        }
      }
    },

    makeAIMove: () => {
      const state = get();
      if (state.gamePhase !== 'playing' || state.gameMode !== 'ai' || state.currentPlayer !== 'black') {
        return;
      }

      const aiMove = getAIMove(state);
      if (aiMove) {
        // Audio managed by ChessAudioController component

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
