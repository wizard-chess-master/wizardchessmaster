import React, { useRef, useEffect, useState } from 'react';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';
import { ChessPiece } from './ChessPiece';
import { Position } from '../../lib/chess/types';

export function ChessBoard() {
  const { board, selectedPosition, validMoves, selectSquare, moveHistory, isInCheck } = useChess();
  const { playPieceMovementSound, playGameEvent, playUISound, playWizardAbility } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingPiece, setAnimatingPiece] = useState<{piece: any, fromRow: number, fromCol: number, toRow: number, toCol: number} | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  type Particle = {x: number, y: number, vx: number, vy: number, life: number, maxLife: number, color: string};
  const [particles, setParticles] = useState<Particle[]>([]);
  const [captureEffect, setCaptureEffect] = useState<{x: number, y: number, timestamp: number} | null>(null);
  const [specialMoveEffect, setSpecialMoveEffect] = useState<{x: number, y: number, type: string, timestamp: number} | null>(null);
  const [canvasSize, setCanvasSize] = useState(800);
  const [squareSize, setSquareSize] = useState(80);

  // Responsive canvas sizing - 800x800 base, scales down for mobile
  useEffect(() => {
    const updateCanvasSize = () => {
      console.log('🎨 Updating canvas size...');
      // Calculate available space for the board
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Base size is 800x800 for desktop (reduced from 880 for better performance)
      let maxSize = 800;
      
      // Scale down for smaller screens, ensuring full visibility
      if (viewportWidth < 480) {
        // Small mobile: use 90% of viewport width, max 400px
        maxSize = Math.min(viewportWidth * 0.90, 400);
      } else if (viewportWidth < 768) {
        // Mobile: use 85% of viewport width, max 600px
        maxSize = Math.min(viewportWidth * 0.85, 600);
      } else if (viewportWidth < 1024) {
        // Tablet: use 80% of viewport width, max 700px
        maxSize = Math.min(viewportWidth * 0.80, 700);
      } else if (viewportWidth < 1200) {
        // Small desktop: use 70% of viewport width, max 800px
        maxSize = Math.min(viewportWidth * 0.70, 800);
      }
      
      // Ensure minimum size for playability
      maxSize = Math.max(maxSize, 320);
      
      const newSquareSize = Math.floor(maxSize / 10);
      const newCanvasSize = newSquareSize * 10;
      
      console.log('🎨 Canvas size calculated:', { 
        viewport: { width: viewportWidth, height: viewportHeight },
        canvas: { size: newCanvasSize, squareSize: newSquareSize }
      });
      
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
          // Special styling for castling moves
          const piece = selectedPosition ? board[selectedPosition.row][selectedPosition.col] : null;
          const isCastlingMove = piece?.type === 'king' && selectedPosition &&
                                 selectedPosition.col === 5 && (col === 2 || col === 6);
          
          if (isCastlingMove) {
            console.log('🏰 Drawing castling indicator at:', { row, col });
          }
          
          if (isCastlingMove) {
            // Draw castling indicator - larger golden circle
            ctx.fillStyle = 'rgba(255, 215, 0, 0.5)'; // Gold
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x + squareSize / 2, y + squareSize / 2, 20, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            // Add castling text
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.font = 'bold 12px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('CASTLE', x + squareSize / 2, y + squareSize / 2);
          } else {
            // Regular move indicator
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(x + squareSize / 2, y + squareSize / 2, 8, 0, 2 * Math.PI);
            ctx.fill();
          }
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

  // Handle canvas clicks - simplified for better reliability
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('🎯 Canvas clicked!');
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('❌ No canvas reference');
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const col = Math.floor(x / squareSize);
    const row = Math.floor(y / squareSize);
    
    console.log('🎯 Click coordinates:', { 
      canvas: { x, y },
      grid: { row, col },
      squareSize,
      piece: board[row]?.[col]
    });
    
    if (row >= 0 && row < 10 && col >= 0 && col < 10) {
      console.log('✅ Valid square clicked:', { row, col });
      console.log('🔍 Piece at position:', board[row][col]);
      
      // Trigger simple animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      
      selectSquare({ row, col });
    } else {
      console.log('❌ Click outside board bounds:', { row, col });
    }
  };

  // Redraw board when game state changes
  useEffect(() => {
    drawBoard();
  }, [board, selectedPosition, validMoves]);

  const handleSquareClick = (row: number, col: number) => {
    selectSquare({ row, col });
  };

  // Draw visual effects on canvas
  const drawEffects = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw particles
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });
    
    // Draw capture effect
    if (captureEffect) {
      const elapsed = Date.now() - captureEffect.timestamp;
      const progress = elapsed / 1000; // 1 second duration
      const alpha = 1 - progress;
      const size = 20 + progress * 30;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#FF4500';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(captureEffect.x, captureEffect.y, size, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }
    
    // Draw special move effect (wizard abilities)
    if (specialMoveEffect) {
      const elapsed = Date.now() - specialMoveEffect.timestamp;
      const progress = elapsed / 1500; // 1.5 second duration
      const alpha = 1 - progress;
      
      if (specialMoveEffect.type === 'teleport') {
        // Teleport swirl effect
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#9370DB';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const radius = 10 + i * 8 + progress * 20;
          ctx.beginPath();
          ctx.arc(specialMoveEffect.x, specialMoveEffect.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        ctx.restore();
      } else if (specialMoveEffect.type === 'spell') {
        // Magical glow effect
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(specialMoveEffect.x, specialMoveEffect.y, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }
    }
  };

  // Create particle explosion for captures
  const createCaptureParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 60,
        maxLife: 60,
        color: color === 'white' ? '#FFD700' : '#8B0000'
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Create magical sparkles for wizard moves
  const createWizardSparkles = (x: number, y: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 90,
        maxLife: 90,
        color: ['#9370DB', '#FF69B4', '#00CED1', '#FFD700'][Math.floor(Math.random() * 4)]
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Animation system for smooth piece movements and effects - SIMPLIFIED FOR DEBUGGING
  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      // Only redraw if there are active effects to prevent infinite loops
      if (particles.length > 0 || captureEffect || specialMoveEffect) {
        // Update particles
        setParticles(prev => prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
            vy: particle.vy + 0.1 // gravity
          }))
          .filter(particle => particle.life > 0)
        );
        
        // Update capture effects
        setCaptureEffect(prev => {
          if (prev && Date.now() - prev.timestamp > 1000) {
            return null;
          }
          return prev;
        });
        
        // Update special move effects
        setSpecialMoveEffect(prev => {
          if (prev && Date.now() - prev.timestamp > 1500) {
            return null;
          }
          return prev;
        });
        
        // Redraw canvas with effects
        drawBoard();
        drawEffects();
        
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    // Only start animation if there are effects to show
    if (particles.length > 0 || captureEffect || specialMoveEffect) {
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [particles, captureEffect, specialMoveEffect]);

  // Simplified click handler - disable effects for debugging
  const handleCanvasClickWithEffects = (event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('🎯 Canvas clicked - calling basic handler');
    // Call original click handler without effects for now
    handleCanvasClick(event);
  };

  // Disable animation effects for debugging
  useEffect(() => {
    console.log('📝 Move history updated:', moveHistory.length, 'moves');
    // Temporarily disable move effects for debugging
  }, [moveHistory, squareSize]);

  return (
    <div className="board-container">
      <div className="chess-board">
        <div className="board-coordinates">
          {/* Column labels */}
          <div className="coord-row">
            <div className="coord-corner" style={{ width: Math.max(30, squareSize * 0.4) + 'px', height: Math.max(30, squareSize * 0.4) + 'px' }}></div>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="coord-label" style={{ width: squareSize }}>
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
              id="chess-canvas"
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              onClick={handleCanvasClickWithEffects}
              className={`chess-canvas ${isAnimating ? 'glow-selected' : ''}`}
              style={{ 
                cursor: 'pointer',
                width: canvasSize + 'px',
                height: canvasSize + 'px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
