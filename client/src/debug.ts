// Debug utilities for chess game
export const debugGame = () => {
  console.log('🔍 Debug: Checking game state...');
  
  // Check if we can access the chess store
  try {
    const { useChess } = require('./lib/stores/useChess');
    const state = useChess.getState();
    console.log('✅ Chess store accessible:', {
      gamePhase: state.gamePhase,
      currentPlayer: state.currentPlayer,
      boardDefined: !!state.board,
      boardSize: state.board?.length,
      whitePawns: state.board?.[8]?.filter((p: any) => p?.type === 'pawn' && p?.color === 'white').length,
      blackPawns: state.board?.[1]?.filter((p: any) => p?.type === 'pawn' && p?.color === 'black').length
    });
  } catch (error) {
    console.error('❌ Chess store error:', error);
  }
  
  // Check if canvas is rendered
  const canvas = document.getElementById('chess-canvas');
  console.log('🎨 Canvas status:', {
    found: !!canvas,
    width: canvas?.clientWidth,
    height: canvas?.clientHeight
  });
  
  // Check for React errors
  const errorElements = document.querySelectorAll('[data-reactroot] *').length;
  console.log('⚛️ React elements rendered:', errorElements);
};

export const testGamePlayability = () => {
  console.log('🎮 Testing game playability...');
  
  try {
    const { useChess } = require('./lib/stores/useChess');
    const { startGame, selectSquare } = useChess.getState();
    
    // Test starting a game
    console.log('🎯 Starting test game...');
    startGame('local');
    
    const state = useChess.getState();
    console.log('📋 Game started:', {
      phase: state.gamePhase,
      player: state.currentPlayer,
      boardValid: !!state.board && state.board.length === 10
    });
    
    // Test selecting a piece
    console.log('🎯 Testing piece selection...');
    selectSquare({ row: 8, col: 4 }); // White pawn
    
    const updatedState = useChess.getState();
    console.log('🎯 Selection result:', {
      selected: !!updatedState.selectedPosition,
      validMoves: updatedState.validMoves.length,
      position: updatedState.selectedPosition
    });
    
    return true;
  } catch (error) {
    console.error('❌ Playability test failed:', error);
    return false;
  }
};

// Add to window for easy access
if (typeof window !== 'undefined') {
  (window as any).debugGame = debugGame;
  (window as any).testGamePlayability = testGamePlayability;
}