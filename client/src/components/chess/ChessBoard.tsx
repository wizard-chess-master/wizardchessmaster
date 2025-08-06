import React, { useRef, useEffect, useState } from 'react';
import { useChess } from '../../lib/stores/useChess';
import { ChessPiece } from './ChessPiece';
import { Position } from '../../lib/chess/types';

export function ChessBoard() {
  const { board, selectedPosition, validMoves, selectSquare } = useChess();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingPiece, setAnimatingPiece] = useState<{piece: any, fromRow: number, fromCol: number, toRow: number, toCol: number} | null>(null);
  const [canvasSize, setCanvasSize] = useState(600);
  const [squareSize, setSquareSize] = useState(60);

  // Responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      const maxSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.7, 600);
      const newSquareSize = Math.floor(maxSize / 10);
      const newCanvasSize = newSquareSize * 10;
      
      setCanvasSize(newCanvasSize);
      setSquareSize(newSquareSize);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Load sprite images using the requested pattern
  useEffect(() => {
    console.log('🎮 Loading chess piece sprites...');
    const pieceTypes = ['King', 'Queen', 'Castle', 'Bishop', 'Knight', 'Pawn', 'Wizard'];
    const colors = ['W', 'B']; // White, Black
    
    pieceTypes.forEach(piece => {
      colors.forEach(color => {
        const key = `${piece}-${color}`;
        const img = new Image(); // Use requested new Image() pattern
        img.src = `/assets/sprites/${piece}-${color}.png?v=king-larger-than-queen`; // Kings larger than queens
        console.log(`🖼️ Loading sprite: ${img.src}`);
        
        img.onload = () => {
          console.log(`✅ Loaded sprite: ${key} (${img.naturalWidth}x${img.naturalHeight})`);
          imagesRef.current[key] = img;
          drawBoard(); // Redraw when image loads
        };
        
        img.onerror = (error) => {
          console.error(`❌ Failed to load sprite: ${key} from ${img.src}`, error);
        };
      });
    });
  }, []);

  // Draw the chess board and pieces on canvas
  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('❌ Canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('❌ Canvas context not found');
      return;
    }

    // Reduced logging to prevent crashes

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw squares
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const x = col * squareSize;
        const y = row * squareSize;
        
        // Alternate square colors
        const isLight = (row + col) % 2 === 0;
        ctx.fillStyle = isLight ? '#f0d9b5' : '#b58863';
        
        // Enhanced highlighting with glow effects
        if (selectedPosition?.row === row && selectedPosition?.col === col) {
          // Golden glow for selected square
          ctx.fillStyle = '#ffd700'; // Gold for selected
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ffd700';
        } else if (validMoves.some(move => move.row === row && move.col === col)) {
          // Green glow for valid moves
          ctx.fillStyle = isLight ? '#90ee90' : '#68c968';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00ff00';
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(x, y, squareSize, squareSize);
        
        // Draw border
        ctx.strokeStyle = '#999';
        ctx.strokeRect(x, y, squareSize, squareSize);
        
        // Draw piece if present
        const piece = board[row][col];
        if (piece && imagesRef.current) {
          const spriteKey = getSpriteKey(piece.type, piece.color);
          const img = imagesRef.current[spriteKey];
          
          // Debug only for kings and wizards to reduce console spam
          if (piece.type === 'king' || piece.type === 'wizard') {
            console.log(`🔍 Drawing ${piece.type} ${piece.color} at ${row},${col}`);
          }
          
          if (img && img.complete && img.naturalWidth > 0) {
            // Calculate aspect ratio preservation for all pieces
            const imgAspect = img.naturalWidth / img.naturalHeight;
            let padding = 5;
            let availableSize = squareSize - (padding * 2);
            
            // Apply size multipliers for specific pieces
            let sizeMultiplier = 1.0;
            
            if (piece.type === 'king') {
              sizeMultiplier = 1.15; // Kings slightly larger than queens (15% bigger)
              padding = 4; // Slightly reduced padding for larger pieces
            } else if (piece.type === 'wizard') {
              sizeMultiplier = 1.2; // Make wizards slightly larger (20% bigger)
              padding = 3; // Slight padding reduction
            }
            
            availableSize = (squareSize - (padding * 2)) * sizeMultiplier;
            
            let drawWidth, drawHeight, drawX, drawY;
            
            if (Math.abs(imgAspect - 1.0) < 0.1) {
              // Nearly square - center it
              drawWidth = availableSize;
              drawHeight = availableSize;
              drawX = x + (squareSize - drawWidth) / 2;
              drawY = y + (squareSize - drawHeight) / 2;
            } else if (imgAspect > 1) {
              // Wider than tall
              drawWidth = availableSize;
              drawHeight = availableSize / imgAspect;
              drawX = x + (squareSize - drawWidth) / 2;
              drawY = y + (squareSize - drawHeight) / 2;
            } else {
              // Taller than wide
              drawWidth = availableSize * imgAspect;
              drawHeight = availableSize;
              drawX = x + (squareSize - drawWidth) / 2;
              drawY = y + (squareSize - drawHeight) / 2;
            }
            
            // Reduce height by 10% for kings and wizards
            if (piece.type === 'king' || piece.type === 'wizard') {
              drawHeight = drawHeight * 0.9; // 10% height reduction
              drawY = y + (squareSize - drawHeight) / 2; // Re-center vertically
            }
            
            // Use ctx.drawImage with preserved aspect ratio and custom sizing
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          } else {
            // Fallback: draw text symbol if image not loaded
            const symbols = {
              white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙', wizard: '🧙' },
              black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟', wizard: '🧙' }
            };
            const symbol = symbols[piece.color as keyof typeof symbols][piece.type as keyof typeof symbols.white] || '?';
            
            ctx.fillStyle = piece.color === 'white' ? '#fff' : '#000';
            ctx.font = '30px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(symbol, x + squareSize / 2, y + squareSize / 2);
          }
        }
        
        // Draw move indicators
        if (validMoves.some(move => move.row === row && move.col === col)) {
          ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
          ctx.beginPath();
          ctx.arc(x + squareSize / 2, y + squareSize / 2, 8, 0, 2 * Math.PI);
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

  // Fallback text symbols for pieces
  const getPieceSymbol = (pieceType: string, color: string): string => {
    const symbols = {
      white: {
        king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙', wizard: '🧙'
      },
      black: {
        king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟', wizard: '🧙'
      }
    };
    return symbols[color as keyof typeof symbols][pieceType as keyof typeof symbols.white] || '?';
  };

  // Handle canvas clicks with animation trigger
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const col = Math.floor(x / squareSize);
    const row = Math.floor(y / squareSize);
    
    if (row >= 0 && row < 10 && col >= 0 && col < 10) {
      // Trigger animation effect
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      
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
              <div key={i} className="coord-label row-label" style={{ height: squareSize }}>
                {10 - i}
              </div>
            ))}
          </div>
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            onClick={handleCanvasClick}
            className={`chess-canvas ${isAnimating ? 'glow-selected' : ''}`}
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
