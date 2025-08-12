import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameState, ChessMove, Position, GameMode, AIDifficulty, PieceColor } from "../chess/types";
import { createInitialBoard, makeMove, getValidMovesForPosition } from "../chess/gameEngine";
import { getAIMove } from "../chess/aiPlayer";
import { useAudio } from "./useAudio";
import { wizardChessAudio } from "../audio/audioManager";
import { useMultiplayer } from "./useMultiplayer";
// Audio managed by ChessAudioController component
import { aiLearning } from "../chess/aiLearning";
import { gameEventTracker } from "../achievements/gameEventTracker";
import { useCampaign } from "./useCampaign";
import { useLeaderboard } from "./useLeaderboard";
import { useAIDifficultyProgression } from "./useAIDifficultyProgression";
import { useWizardAssistant } from "./useWizardAssistant";
import { useDynamicAIMentor } from "./useDynamicAIMentor";

interface ChessStore extends GameState {
  // Campaign tracking
  gameStartTime: number;
  
  // Settings
  hintsEnabled: boolean;
  
  // AI Loading State
  aiThinking: boolean;
  aiThinkingMessage: string;
  
  // Actions
  startGame: (mode: GameMode, aiDifficulty?: AIDifficulty) => void;
  selectSquare: (position: Position | null) => void;
  makePlayerMove: (from: Position, to: Position) => void;
  makeAIMove: () => void;
  makeAIVsAIMove: () => void;
  resetGame: () => void;
  undoMove: () => void;
  toggleHints: () => void;
  setAIThinking: (thinking: boolean, message?: string) => void;
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
    hintsEnabled: true,
    aiThinking: false,
    aiThinkingMessage: '',

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
      
      // Auto-start theme music when entering game area
      console.log('🎵 Game start - Theme-music1.mp3 handled by user controls only');
      // Music will auto-start if not muted
      const { isMuted } = useAudio.getState();
      if (!isMuted) {
        setTimeout(() => {
          wizardChessAudio.playThemeMusic();
        }, 500); // Small delay to ensure cleanup is complete
      }
      
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
      
      // In multiplayer mode, check if player can move this color
      let canSelectPiece = false;
      if (state.gameMode === 'multiplayer') {
        // Get the player's assigned color from multiplayer store
        const multiplayerState = (window as any).multiplayerStore?.getState?.();
        const yourColor = multiplayerState?.currentGame?.yourColor;
        canSelectPiece = !!(piece && piece.color === yourColor);
        console.log('🎮 Multiplayer piece selection:', {
          yourColor,
          pieceColor: piece?.color,
          canSelect: canSelectPiece
        });
      } else {
        // In other modes, use current player
        canSelectPiece = !!(piece && piece.color === state.currentPlayer);
      }
      
      console.log('🎮 Piece selection check:', {
        gameMode: state.gameMode,
        pieceColor: piece?.color,
        currentPlayer: state.currentPlayer,
        pieceExists: !!piece,
        canSelect: canSelectPiece
      });
      
      // If clicking on player's piece, select it
      if (canSelectPiece && piece) {
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
      
      // Trigger animation with synchronized sound effects
      const chessBoard = document.querySelector('canvas');
      if (chessBoard) {
        // Dispatch custom event to trigger animation
        const animationEvent = new CustomEvent('chessAnimation', {
          detail: {
            piece,
            fromRow: from.row,
            fromCol: from.col,
            toRow: to.row,
            toCol: to.col,
            type: isWizardTeleport ? 'wizard-teleport' : isWizardAttack ? 'attack' : isCastling ? 'castling' : 'normal',
            isOpponentMove: false,
            captured
          }
        });
        chessBoard.dispatchEvent(animationEvent);
      }

      const newState = makeMove(state, move);
      set(newState);
      
      // 🎮 CRITICAL: Send move to multiplayer server if in multiplayer mode
      if (state.gameMode === 'multiplayer') {
        try {
          const { currentGame, makeMove: sendMoveToServer } = useMultiplayer.getState();
          
          if (currentGame && sendMoveToServer) {
            console.log('🔄 Sending move to multiplayer server:', {
              gameId: currentGame.gameId,
              move: move,
              isWizardMove: piece.type === 'wizard',
              isWizardTeleport,
              isWizardAttack
            });
            sendMoveToServer(currentGame.gameId, move);
          } else {
            console.error('❌ Multiplayer game not available for move synchronization:', { currentGame: !!currentGame });
          }
        } catch (error) {
          console.error('❌ Failed to send move to multiplayer server:', error);
        }
      }
      
      // Trigger Dynamic AI Mentor analysis (non-blocking)
      setTimeout(() => {
        try {
          const mentorState = useDynamicAIMentor.getState();
          console.log('🧙‍♂️ Checking mentor state:', { 
            isActive: mentorState.isActive,
            currentFeedback: mentorState.currentFeedback.length,
            sessionStartTime: mentorState.sessionStartTime
          });
          if (mentorState.isActive) {
            console.log('🧙‍♂️ Triggering mentor analysis for move:', {
              from: move.from,
              to: move.to,
              piece: move.piece.type,
              color: move.piece.color
            });
            mentorState.analyzeCurrentMove(newState, move);
          } else {
            console.log('🧙‍♂️ Mentor not active, skipping analysis');
          }
        } catch (error) {
          console.log('🧙‍♂️ Mentor system error:', error);
        }
      }, 100); // Small delay to ensure state is updated

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
          
          // Update player stats for adaptive difficulty
          const playerStats = JSON.parse(localStorage.getItem('playerStats') || '{}');
          const gamesPlayed = (playerStats.gamesPlayed || 0) + 1;
          const wins = (playerStats.wins || 0) + (playerWon ? 1 : 0);
          const losses = (playerStats.losses || 0) + (!playerWon && newState.winner === 'black' ? 1 : 0);
          const draws = (playerStats.draws || 0) + (!newState.winner ? 1 : 0);
          const winRate = gamesPlayed > 0 ? wins / gamesPlayed : 0;
          
          const updatedStats = {
            gamesPlayed,
            wins,
            losses,
            draws,
            winRate,
            lastDifficulty: state.aiDifficulty,
            lastGameDate: new Date().toISOString()
          };
          
          localStorage.setItem('playerStats', JSON.stringify(updatedStats));
          console.log('📊 Player stats updated:', updatedStats);
          
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

    makeAIVsAIMove: async () => {
      const state = get();
      if (state.gamePhase !== 'playing' || state.gameMode !== 'ai-vs-ai') {
        return;
      }

      const aiMove = await getAIMove(state);
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

    makeAIMove: async () => {
      const state = get();
      if (state.gamePhase !== 'playing' || state.gameMode !== 'ai' || state.currentPlayer !== 'black') {
        return;
      }

      // Set AI thinking state
      const { setAIThinking } = get();
      setAIThinking(true, `Calculating ${state.aiDifficulty} difficulty move...`);

      // Add realistic thinking delay based on difficulty
      const thinkingDelay = state.aiDifficulty === 'easy' ? 800 : 
                           state.aiDifficulty === 'medium' ? 1500 : 2500;

      try {
        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, thinkingDelay));

        const aiMove = await getAIMove(state);
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
      } catch (error) {
        console.error('AI move calculation failed:', error);
      } finally {
        // Clear AI thinking state
        setAIThinking(false);
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
    },

    toggleHints: () => {
      set(state => ({ hintsEnabled: !state.hintsEnabled }));
    },

    setAIThinking: (thinking: boolean, message: string = '') => {
      set({ aiThinking: thinking, aiThinkingMessage: message });
    }
  }))
);
