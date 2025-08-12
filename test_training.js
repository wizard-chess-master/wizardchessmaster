// Quick test to see if board initialization works
const { initializeBoard } = require('./client/src/lib/chess/pieceMovement.ts');
const { getPossibleMoves } = require('./client/src/lib/chess/pieceMovement.ts');

// Test board initialization
const board = initializeBoard();

console.log('Board initialized:', board ? '✓' : '✗');
console.log('Board has pieces:', board && board.some(row => row.some(cell => cell !== null)) ? '✓' : '✗');

// Count pieces
let whitePieces = 0;
let blackPieces = 0;

if (board) {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = board[row][col];
      if (piece) {
        if (piece.color === 'white') whitePieces++;
        else if (piece.color === 'black') blackPieces++;
      }
    }
  }
}

console.log(`White pieces: ${whitePieces}`);
console.log(`Black pieces: ${blackPieces}`);

// Test if white has any valid moves at start
if (board) {
  let validMoves = 0;
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = board[row][col];
      if (piece && piece.color === 'white') {
        const moves = getPossibleMoves(board, { row, col }, piece);
        validMoves += moves.length;
      }
    }
  }
  console.log(`White has ${validMoves} possible moves at start`);
}