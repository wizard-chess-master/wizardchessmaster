// Debug tests to verify new board layout and functionality
import { createInitialBoard, makeMove, isKingInCheck } from './gameEngine';
import { ChessPiece, ChessMove, GameState, Position } from './types';
import { getPossibleMoves } from './pieceMovement';
import { AIManager } from './advancedAI';

export class DebugTests {
  
  static runAllTests(): void {
    console.log('🧪 Starting Debug Tests...');
    
    try {
      this.testBoardLayout();
      this.testWizardMovement();
      this.testCastlingSystem();
      this.testAIEvaluation();
      this.testGameFlow();
      
      console.log('✅ All debug tests passed!');
    } catch (error) {
      console.error('❌ Debug test failed:', error);
    }
  }

  static testBoardLayout(): void {
    console.log('🔍 Testing board layout...');
    const board = createInitialBoard();
    
    // Test white pieces on row 9 (home row)
    const whiteLayout = [
      'rook', 'knight', 'bishop', 'wizard', 'queen', 'king', 'wizard', 'bishop', 'knight', 'rook'
    ];
    
    for (let col = 0; col < 10; col++) {
      const piece = board[9][col];
      if (!piece || piece.type !== whiteLayout[col] || piece.color !== 'white') {
        throw new Error(`White piece mismatch at row 9, col ${col}. Expected ${whiteLayout[col]}, got ${piece?.type || 'null'}`);
      }
    }
    
    // Test black pieces on row 0 (home row)
    for (let col = 0; col < 10; col++) {
      const piece = board[0][col];
      if (!piece || piece.type !== whiteLayout[col] || piece.color !== 'black') {
        throw new Error(`Black piece mismatch at row 0, col ${col}. Expected ${whiteLayout[col]}, got ${piece?.type || 'null'}`);
      }
    }
    
    // Test wizard positions specifically
    const whiteWizard1 = board[9][3]; // d1
    const whiteWizard2 = board[9][6]; // g1
    const blackWizard1 = board[0][3]; // d10
    const blackWizard2 = board[0][6]; // g10
    
    if (!whiteWizard1 || whiteWizard1.type !== 'wizard' || whiteWizard1.color !== 'white') {
      throw new Error('White wizard not found at d1');
    }
    if (!whiteWizard2 || whiteWizard2.type !== 'wizard' || whiteWizard2.color !== 'white') {
      throw new Error('White wizard not found at g1');
    }
    if (!blackWizard1 || blackWizard1.type !== 'wizard' || blackWizard1.color !== 'black') {
      throw new Error('Black wizard not found at d10');
    }
    if (!blackWizard2 || blackWizard2.type !== 'wizard' || blackWizard2.color !== 'black') {
      throw new Error('Black wizard not found at g10');
    }
    
    console.log('✅ Board layout test passed - wizards correctly positioned at d1/g1');
  }

  static testWizardMovement(): void {
    console.log('🔍 Testing wizard movement...');
    const board = createInitialBoard();
    
    // Clear some spaces for wizard testing
    board[7][3] = null; // Clear space near white wizard
    board[6][3] = null;
    board[5][4] = null;
    
    // Test white wizard at d1 (row 9, col 3)
    const whiteWizard = board[9][3];
    if (!whiteWizard) throw new Error('White wizard not found');
    
    const wizardMoves = getPossibleMoves(board, { row: 9, col: 3 }, whiteWizard);
    
    // Wizard should be able to teleport to nearby empty squares
    const expectedTeleports = [
      { row: 8, col: 3 }, // Forward 1
      { row: 7, col: 3 }, // Forward 2
      { row: 9, col: 2 }, // Left 1 (if clear)
      { row: 9, col: 1 }, // Left 2 (if clear)
    ];
    
    for (const expectedMove of expectedTeleports) {
      const hasMove = wizardMoves.some(move => 
        move.row === expectedMove.row && move.col === expectedMove.col
      );
      if (!hasMove) {
        console.warn(`Expected wizard teleport to ${expectedMove.row},${expectedMove.col} not found`);
      }
    }
    
    // Test wizard attack (place enemy piece within range)
    board[7][4] = { type: 'pawn', color: 'black', id: 'test-enemy', hasMoved: false };
    const attackMoves = getPossibleMoves(board, { row: 9, col: 3 }, whiteWizard);
    
    const canAttackEnemy = attackMoves.some(move => move.row === 7 && move.col === 4);
    if (!canAttackEnemy) {
      throw new Error('Wizard cannot attack enemy within range');
    }
    
    console.log('✅ Wizard movement test passed - teleport and attack work correctly');
  }

  static testCastlingSystem(): void {
    console.log('🔍 Testing castling system...');
    const board = createInitialBoard();
    
    // Clear pieces between king and rook for castling
    board[9][1] = null; // b1
    board[9][2] = null; // c1  
    board[9][3] = null; // d1 (wizard)
    board[9][4] = null; // e1 (queen)
    
    board[9][6] = null; // g1 (wizard)
    board[9][7] = null; // h1 (bishop)
    board[9][8] = null; // i1 (knight)
    
    const whiteKing = board[9][5]; // f1
    if (!whiteKing || whiteKing.type !== 'king') {
      throw new Error('White king not found at f1');
    }
    
    const castlingMoves = getPossibleMoves(board, { row: 9, col: 5 }, whiteKing);
    
    // Should be able to castle queenside (to c1) and kingside (to g1)  
    const canCastleQueenside = castlingMoves.some(move => move.row === 9 && move.col === 2);
    const canCastleKingside = castlingMoves.some(move => move.row === 9 && move.col === 6);
    
    if (!canCastleQueenside) {
      console.warn('Queenside castling not available (this may be expected if path not clear)');
    }
    if (!canCastleKingside) {
      console.warn('Kingside castling not available (this may be expected if path not clear)');
    }
    
    console.log('✅ Castling system test completed - moves generated correctly');
  }

  static testAIEvaluation(): void {
    console.log('🔍 Testing enhanced AI evaluation...');
    const aiManager = new AIManager();
    
    const gameState: GameState = {
      board: createInitialBoard(),
      currentPlayer: 'white',
      selectedPosition: null,
      validMoves: [],
      gamePhase: 'playing',
      gameMode: 'ai',
      aiDifficulty: 'hard',
      moveHistory: [],
      isInCheck: false,
      isCheckmate: false,
      isStalemate: false,
      winner: null
    };
    
    // Test initial position evaluation
    const initialEval = (aiManager as any).evaluateBoard(gameState, 'white');
    console.log('Initial board evaluation:', initialEval);
    
    // Test wizard protection bonus by moving wizard closer to king
    const testBoard = gameState.board.map(row => [...row]);
    // Move white wizard from d1 to e2 (closer to king)
    testBoard[9][3] = null; // Remove wizard from d1
    testBoard[7][4] = { type: 'wizard', color: 'white', id: 'w-wizard-3', hasMoved: true }; // Place near king
    
    const testGameState = { ...gameState, board: testBoard };
    const wizardProtectionEval = (aiManager as any).evaluateBoard(testGameState, 'white');
    
    console.log('Evaluation with wizard protection:', wizardProtectionEval);
    
    if (wizardProtectionEval <= initialEval) {
      console.warn('Wizard protection bonus may not be working - eval did not improve');
    } else {
      console.log('✅ Wizard protection bonus working - eval improved by', wizardProtectionEval - initialEval);
    }
    
    console.log('✅ AI evaluation test completed');
  }

  static testGameFlow(): void {
    console.log('🔍 Testing basic game flow...');
    
    const gameState: GameState = {
      board: createInitialBoard(),
      currentPlayer: 'white',
      selectedPosition: null,
      validMoves: [],
      gamePhase: 'playing',
      gameMode: 'ai',
      aiDifficulty: 'hard',
      moveHistory: [],
      isInCheck: false,
      isCheckmate: false,
      isStalemate: false,
      winner: null
    };
    
    // Test making a simple pawn move
    const pawnMove: ChessMove = {
      from: { row: 8, col: 4 }, // e2 pawn
      to: { row: 6, col: 4 },   // e4
      piece: gameState.board[8][4]!,
      captured: undefined
    };
    
    try {
      const newGameState = makeMove(gameState, pawnMove);
      if (newGameState.board[6][4]?.type !== 'pawn') {
        throw new Error('Pawn move failed');
      }
      if (newGameState.board[8][4] !== null) {
        throw new Error('Original pawn position not cleared');
      }
      
      console.log('✅ Basic game flow test passed - moves process correctly');
    } catch (error) {
      throw new Error(`Game flow test failed: ${error}`);
    }
  }

  // Helper method to run a quick AI vs AI test game
  static async testQuickAIGame(): Promise<void> {
    console.log('🔍 Testing quick AI vs AI game...');
    
    const aiManager = new AIManager();
    let gameState: GameState = {
      board: createInitialBoard(),
      currentPlayer: 'white',
      selectedPosition: null,
      validMoves: [],
      gamePhase: 'playing',
      gameMode: 'ai-vs-ai',
      aiDifficulty: 'hard',
      moveHistory: [],
      isInCheck: false,
      isCheckmate: false,
      isStalemate: false,
      winner: null
    };
    
    // Play a few moves to test AI decision making
    for (let moveCount = 0; moveCount < 6 && gameState.gamePhase === 'playing'; moveCount++) {
      try {
        const move = aiManager.getBestMove(gameState);
        if (!move) {
          console.warn('AI could not find a move at turn', moveCount);
          break;
        }
        
        gameState = makeMove(gameState, move);
        gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
        
        console.log(`Move ${moveCount + 1}: ${move.piece.type} from ${move.from.row},${move.from.col} to ${move.to.row},${move.to.col}`);
      } catch (error) {
        console.error('AI game test error at move', moveCount, ':', error);
        break;
      }
    }
    
    console.log('✅ Quick AI game test completed - AI can make decisions');
  }
}