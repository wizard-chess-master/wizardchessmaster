import React, { useRef, useEffect } from 'react';
import { useChess } from '../../lib/stores/useChess';
import { ChessPiece } from './ChessPiece';
import { Position } from '../../lib/chess/types';

export function ChessBoard() {
  const { board, selectedPosition, validMoves, selectSquare } = useChess();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  const SQUARE_SIZE = 60;
  const BOARD_SIZE = SQUARE_SIZE * 10;

  // Load sprite images using the requested pattern
  useEffect(() => {
    const pieceTypes = ['King', 'Queen', 'Castle', 'Bishop', 'Knight', 'Pawn', 'Wizard'];
    const colors = ['W', 'B']; // White, Black
    
    pieceTypes.forEach(piece => {
      colors.forEach(color => {
        const key = `${piece}-${color}`;
        const img = new Image(); // Use requested new Image() pattern
        img.src = `/assets/sprites/${piece}-${color}.png`; // Load from assets/sprites
        img.onload = () => {
          imagesRef.current[key] = img;
          drawBoard(); // Redraw when image loads
        };
      });
    });
  }, []);

  // Draw the chess board and pieces on canvas
  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    // Draw squares
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const x = col * SQUARE_SIZE;
        const y = row * SQUARE_SIZE;
        
        // Alternate square colors
        const isLight = (row + col) % 2 === 0;
        ctx.fillStyle = isLight ? '#f0d9b5' : '#b58863';
        
        // Highlight selected square
        if (selectedPosition?.row === row && selectedPosition?.col === col) {
          ctx.fillStyle = '#7dd3fc'; // Light blue for selected
        }
        
        // Highlight valid move squares
        if (validMoves.some(move => move.row === row && move.col === col)) {
          ctx.fillStyle = isLight ? '#90ee90' : '#68c968'; // Light green for valid moves
        }
        
        ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
        
        // Draw border
        ctx.strokeStyle = '#999';
        ctx.strokeRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
        
        // Draw piece if present
        const piece = board[row][col];
        if (piece && imagesRef.current) {
          const spriteKey = getSpriteKey(piece.type, piece.color);
          const img = imagesRef.current[spriteKey];
          
          if (img) {
            // Use ctx.drawImage as requested
            ctx.drawImage(img, x + 5, y + 5, SQUARE_SIZE - 10, SQUARE_SIZE - 10);
          }
        }
        
        // Draw move indicators
        if (validMoves.some(move => move.row === row && move.col === col)) {
          ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
          ctx.beginPath();
          ctx.arc(x + SQUARE_SIZE / 2, y + SQUARE_SIZE / 2, 8, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  };

  // Map piece types to sprite file names
  const getSpriteKey = (pieceType: string, color: string): string => {
    const spriteMap: { [key: string]: string } = {
      'king': 'King',
      'queen': 'Queen', 
      'rook': 'Castle', // Rook sprites are named "Castle"
      'bishop': 'Bishop',
      'knight': 'Knight',
      'pawn': 'Pawn',
      'wizard': 'Wizard'
    };
    
    const colorCode = color === 'white' ? 'W' : 'B';
    return `${spriteMap[pieceType]}-${colorCode}`;
  };

  // Handle canvas clicks
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const col = Math.floor(x / SQUARE_SIZE);
    const row = Math.floor(y / SQUARE_SIZE);
    
    if (row >= 0 && row < 10 && col >= 0 && col < 10) {
      selectSquare({ row, col });
    }
  };

  // Redraw board when game state changes
  useEffect(() => {
    drawBoard();
  }, [board, selectedPosition, validMoves]);

  const handleSquareClick = (row: number, col: number) => {
    selectSquare({ row, col });
  };

  return (
    <div className="chess-board">
      <div className="board-coordinates">
        {/* Column labels */}
        <div className="coord-row">
          <div className="coord-corner"></div>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="coord-label">
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        
        {/* Canvas board with row labels */}
        <div className="canvas-container">
          <div className="row-labels">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="coord-label row-label" style={{ height: SQUARE_SIZE }}>
                {10 - i}
              </div>
            ))}
          </div>
          <canvas
            ref={canvasRef}
            width={BOARD_SIZE}
            height={BOARD_SIZE}
            onClick={handleCanvasClick}
            className="chess-canvas"
            style={{ 
              border: '2px solid #333',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>
    </div>
  );
}
