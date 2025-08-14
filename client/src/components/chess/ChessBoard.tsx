import React, { useRef, useEffect, useState } from 'react';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';
import { useDeviceDetection } from '../../lib/hooks/useDeviceDetection';
import { useDeviceStore } from '../../lib/stores/useDeviceStore';
import { ChessPiece } from './ChessPiece';
import { Position } from '../../lib/chess/types';
import { AIThinkingIndicator } from '../ui/AIThinkingIndicator';
import { cn } from '../../lib/utils';

export function ChessBoard() {
  const { board, selectedPosition, validMoves, selectSquare, moveHistory, isInCheck, aiThinking, aiDifficulty } = useChess();
  const { playPieceMovementSound, playGameEvent, playUISound, playWizardAbility } = useAudio();
  const deviceInfo = useDeviceDetection();
  const { settings } = useDeviceStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  // Enhanced animation state management
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingPiece, setAnimatingPiece] = useState<{
    piece: any, 
    fromRow: number, 
    fromCol: number, 
    toRow: number, 
    toCol: number,
    type: 'normal' | 'wizard-teleport' | 'attack' | 'castling',
    progress: number,
    startTime: number,
    duration: number,
    isOpponentMove?: boolean
  } | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  // Opponent move highlighting
  const [opponentMoveHighlight, setOpponentMoveHighlight] = useState<{
    fromRow: number, 
    fromCol: number, 
    toRow: number, 
    toCol: number,
    startTime: number,
    duration: number
  } | null>(null);

  // Animation controller function
  const startMoveAnimation = (
    piece: any, 
    fromRow: number, 
    fromCol: number, 
    toRow: number, 
    toCol: number,
    type: 'normal' | 'wizard-teleport' | 'attack' | 'castling' = 'normal',
    isOpponentMove: boolean = false
  ) => {
    console.log('🎬 Starting move animation:', { piece: piece.type, from: [fromRow, fromCol], to: [toRow, toCol], type, isOpponentMove });
    
    // Set animation duration to exactly 0.5 seconds (500ms) as requested
    const duration = 500;
    
    setIsAnimating(true);
    setAnimatingPiece({
      piece,
      fromRow,
      fromCol, 
      toRow,
      toCol,
      type,
      progress: 0,
      startTime: Date.now(),
      duration,
      isOpponentMove
    });

    // Trigger opponent move highlighting if it's an opponent move
    if (isOpponentMove) {
      setOpponentMoveHighlight({
        fromRow,
        fromCol,
        toRow, 
        toCol,
        startTime: Date.now(),
        duration: 300 // 0.3s fade as requested
      });
    }

    // Play synchronized sound effects
    if (type === 'wizard-teleport') {
      playWizardAbility('teleport');
      console.log('🎵 Playing wizard teleport sound');
    } else if (type === 'attack') {
      playWizardAbility('attack');
      console.log('🎵 Playing wizard attack sound');
    } else if (piece.captured) {
      playGameEvent('capture');
      console.log('🎵 Playing capture sound');
    } else {
      playPieceMovementSound(piece.type);
      console.log('🎵 Playing move sound for', piece.type);
    }
  };
  
  // Enhanced particle system
  type Particle = {x: number, y: number, vx: number, vy: number, life: number, maxLife: number, color: string, size?: number};
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Enhanced visual effects
  const [captureEffect, setCaptureEffect] = useState<{x: number, y: number, timestamp: number, intensity: number} | null>(null);
  const [specialMoveEffect, setSpecialMoveEffect] = useState<{x: number, y: number, type: string, timestamp: number} | null>(null);
  const [attackBurstEffect, setAttackBurstEffect] = useState<{x: number, y: number, timestamp: number, color: string} | null>(null);
  const [wizardTeleportEffect, setWizardTeleportEffect] = useState<{
    fromX: number, fromY: number, toX: number, toY: number, 
    timestamp: number, phase: 'fade-out' | 'fade-in'
  } | null>(null);
  
  // Canvas and sizing
  const [canvasSize, setCanvasSize] = useState(800);
  const [squareSize, setSquareSize] = useState(80);
  
  // Animation frame reference
  const animationFrameRef = useRef<number>();

  // Listen for animation events from chess store
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleChessAnimation = (event: CustomEvent) => {
      const { piece, fromRow, fromCol, toRow, toCol, type, isOpponentMove, captured } = event.detail;
      
      // Create enhanced piece object for animation
      const animationPiece = { ...piece, captured };
      
      startMoveAnimation(animationPiece, fromRow, fromCol, toRow, toCol, type, isOpponentMove);
    };

    canvas.addEventListener('chessAnimation', handleChessAnimation as EventListener);
    
    return () => {
      canvas.removeEventListener('chessAnimation', handleChessAnimation as EventListener);
    };
  }, []);

  // AI move animation handler
  useEffect(() => {
    const lastMove = moveHistory[moveHistory.length - 1];
    if (lastMove && moveHistory.length > 0) {
      // Detect if this was an AI move (assuming AI plays as black)
      const isAIMove = lastMove.piece.color === 'black';
      
      if (isAIMove) {
        console.log('🤖 Detected AI move, triggering opponent highlight');
        
        // Skip animation for wizard ranged attacks - they're handled by special effects
        if (lastMove.isWizardAttack) {
          console.log('🧙 Skipping movement animation for wizard ranged attack');
          return;
        }
        
        const type = lastMove.isWizardTeleport ? 'wizard-teleport' 
                   : lastMove.isCastling ? 'castling' 
                   : 'normal';
        
        setTimeout(() => {
          startMoveAnimation(
            { ...lastMove.piece, captured: lastMove.captured },
            lastMove.from.row,
            lastMove.from.col,
            lastMove.to.row,
            lastMove.to.col,
            type,
            true // isOpponentMove
          );
        }, 100); // Small delay to ensure UI updates
      }
    }
  }, [moveHistory]);

  // Responsive canvas sizing - optimized for fullscreen and performance
  useEffect(() => {
    const handleResize = () => {
      // Get current viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Ensure valid dimensions
      if (viewportWidth <= 0 || viewportHeight <= 0) {
        return;
      }
      
      // Account for padding, coordinate labels, and border
      const padding = 20; // Reduced padding to minimize gap
      const labelHeight = 30; // Height for coordinate labels
      const labelWidth = 30; // Width for coordinate labels
      const borderWidth = 8; // Account for border-4 class (4px each side = 8px total)
      
      // Calculate available space accounting for labels and border
      const availableWidth = viewportWidth - padding * 2 - borderWidth; // Subtract border width
      const availableHeight = viewportHeight - padding * 2 - 50; // Adjusted for top gap
      
      // Dynamic size factor based on screen size - adjusted to fit right border
      let sizeFactor = 0.75; // Adjusted to fit right border
      
      if (viewportWidth <= 768) {
        sizeFactor = 0.9; // Mobile
      } else if (viewportWidth <= 1024) {
        sizeFactor = 0.85; // Tablet
      } else if (viewportWidth >= 2560) {
        sizeFactor = 0.65; // Large displays
      } else if (viewportWidth / viewportHeight > 1.6) {
        sizeFactor = 0.75; // Wide screens - adjusted
      }
      
      // Calculate board size using available space
      const maxSize = Math.min(
        availableWidth * sizeFactor,
        availableHeight * sizeFactor
      );
      
      // Remove hard cap to allow larger boards on big screens
      const finalSize = Math.max(300, Math.floor(maxSize / 10) * 10);
      const newSquareSize = Math.floor(finalSize / 10);
      const newCanvasSize = newSquareSize * 10;
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🎨 Resize calculated:', {
          viewport: { width: viewportWidth, height: viewportHeight },
          sizeFactor,
          finalSize: newCanvasSize
        });
      }
      
      // Update state
      setCanvasSize(newCanvasSize);
      setSquareSize(newSquareSize);
      
      // Efficient redraw without opacity tricks
      requestAnimationFrame(() => {
        drawBoard();
      });
    };

    // Initial sizing
    handleResize();
    
    // Add all necessary event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    document.addEventListener('fullscreenchange', handleResize);
    document.addEventListener('webkitfullscreenchange', handleResize);
    document.addEventListener('mozfullscreenchange', handleResize);
    document.addEventListener('MSFullscreenChange', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
      document.removeEventListener('webkitfullscreenchange', handleResize);
      document.removeEventListener('mozfullscreenchange', handleResize);
      document.removeEventListener('MSFullscreenChange', handleResize);
    };
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

    // Clear canvas - use actual canvas dimensions
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate actual square size based on canvas dimensions
    const actualSquareSize = canvas.width / 10;

    // Draw squares
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const x = col * actualSquareSize;
        const y = row * actualSquareSize;
        
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
        } else if (opponentMoveHighlight && 
                   ((opponentMoveHighlight.fromRow === row && opponentMoveHighlight.fromCol === col) ||
                    (opponentMoveHighlight.toRow === row && opponentMoveHighlight.toCol === col))) {
          // Yellow glow for opponent moves with fade effect
          const elapsed = Date.now() - opponentMoveHighlight.startTime;
          const fadeProgress = Math.min(elapsed / opponentMoveHighlight.duration, 1);
          const alpha = 1 - fadeProgress; // Fade out over time
          
          ctx.fillStyle = isLight ? '#fffacd' : '#ffd700'; // Light yellow to gold
          ctx.shadowBlur = 12 * alpha;
          ctx.shadowColor = `rgba(255, 215, 0, ${alpha})`;
          
          // Remove highlight when fade is complete
          if (fadeProgress >= 1) {
            setOpponentMoveHighlight(null);
          }
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(x, y, actualSquareSize, actualSquareSize);
        
        // Draw border
        ctx.strokeStyle = '#999';
        ctx.strokeRect(x, y, actualSquareSize, actualSquareSize);
        
        // Draw piece if present (skip if it's the animating piece)
        const piece = board[row][col];
        const isAnimatingPiece = animatingPiece && 
          animatingPiece.fromRow === row && animatingPiece.fromCol === col;
        
        // Debug logging for missing pieces (only log once)
        if (row === 9 && !piece && col === 6) {
          console.log(`⚠️ MISSING PIECE at white home row (9,6) - should be wizard!`);
        }
        
        if (piece && imagesRef.current && !isAnimatingPiece) {
          drawPieceAtPosition(ctx, piece, x, y, actualSquareSize);
        }
        
        // Draw move indicators
        if (validMoves.some(move => move.row === row && move.col === col)) {
          // Special styling for castling moves
          const piece = selectedPosition ? board[selectedPosition.row][selectedPosition.col] : null;
          const isCastlingMove = piece?.type === 'king' && selectedPosition &&
                                 selectedPosition.col === 5 && (col === 2 || col === 7);
          
          if (isCastlingMove) {
            console.log('🏰 Drawing castling indicator at:', { row, col });
          }
          
          if (isCastlingMove) {
            // Draw castling indicator - larger golden circle
            ctx.fillStyle = 'rgba(255, 215, 0, 0.5)'; // Gold
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x + actualSquareSize / 2, y + actualSquareSize / 2, 20, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            // Add castling text
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.font = 'bold 12px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('CASTLE', x + actualSquareSize / 2, y + actualSquareSize / 2);
          } else {
            // Regular move indicator
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(x + actualSquareSize / 2, y + actualSquareSize / 2, 8, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }
    }
    
    // Draw animating piece with smooth interpolation
    if (animatingPiece) {
      const elapsed = Date.now() - animatingPiece.startTime;
      const progress = Math.min(elapsed / animatingPiece.duration, 1);
      
      // Enhanced smooth easing function (ease-out cubic)
      const easedProgress = animatingPiece.type === 'wizard-teleport' 
        ? progress // Linear for teleport (instant)
        : 1 - Math.pow(1 - progress, 3); // Cubic ease-out for smooth movement
      
      // Calculate current position using linear interpolation (lerp)
      // Use actual canvas dimensions for proper positioning
      const actualSquareSize = ctx.canvas.width / 10;
      const fromX = animatingPiece.fromCol * actualSquareSize;
      const fromY = animatingPiece.fromRow * actualSquareSize;
      const toX = animatingPiece.toCol * actualSquareSize;
      const toY = animatingPiece.toRow * actualSquareSize;
      
      const currentX = fromX + (toX - fromX) * easedProgress;
      const currentY = fromY + (toY - fromY) * easedProgress;
      
      // Handle wizard teleport fade effect
      if (animatingPiece.type === 'wizard-teleport') {
        const fadeProgress = progress * 2; // 0-2 range
        let alpha = 1;
        
        if (fadeProgress < 1) {
          // Fade out phase (first half)
          alpha = 1 - fadeProgress;
        } else {
          // Fade in phase (second half)
          alpha = fadeProgress - 1;
        }
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        
        // Draw at destination position during fade-in
        const drawX = fadeProgress < 1 ? fromX : toX;
        const drawY = fadeProgress < 1 ? fromY : toY;
        drawPieceAtPosition(ctx, animatingPiece.piece, drawX, drawY);
        ctx.restore();
      } else {
        // Normal smooth movement
        drawPieceAtPosition(ctx, animatingPiece.piece, currentX, currentY);
      }
      
      // Check if animation is complete
      if (progress >= 1) {
        console.log('✅ Animation completed for:', animatingPiece.piece.type);
        setAnimatingPiece(null);
        setIsAnimating(false);
      }
    }
  };

  // Helper function to draw a piece at given position
  const drawPieceAtPosition = (ctx: CanvasRenderingContext2D, piece: any, x: number, y: number, currentSquareSize?: number) => {
    const spriteKey = getSpriteKey(piece.type, piece.color);
    const img = imagesRef.current[spriteKey];
    
    // Use passed square size or fall back to default
    const actualSquare = currentSquareSize || squareSize;
    
    if (img && img.complete && img.naturalWidth > 0) {
      // Calculate aspect ratio preservation for all pieces
      const imgAspect = img.naturalWidth / img.naturalHeight;
      let padding = 5;
      let availableSize = actualSquare - (padding * 2);
      
      // Apply size multipliers for specific pieces
      let sizeMultiplier = 1.0;
      
      if (piece.type === 'king') {
        sizeMultiplier = 1.15; // Kings slightly larger than queens (15% bigger)
        padding = 4; // Slightly reduced padding for larger pieces
      } else if (piece.type === 'wizard') {
        sizeMultiplier = 1.2; // Make wizards slightly larger (20% bigger)
        padding = 3; // Slight padding reduction
      }
      
      availableSize = (actualSquare - (padding * 2)) * sizeMultiplier;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (Math.abs(imgAspect - 1.0) < 0.1) {
        // Nearly square - center it
        drawWidth = availableSize;
        drawHeight = availableSize;
        drawX = x + (actualSquare - drawWidth) / 2;
        drawY = y + (actualSquare - drawHeight) / 2;
      } else if (imgAspect > 1) {
        // Wider than tall
        drawWidth = availableSize;
        drawHeight = availableSize / imgAspect;
        drawX = x + (actualSquare - drawWidth) / 2;
        drawY = y + (actualSquare - drawHeight) / 2;
      } else {
        // Taller than wide
        drawWidth = availableSize * imgAspect;
        drawHeight = availableSize;
        drawX = x + (actualSquare - drawWidth) / 2;
        drawY = y + (actualSquare - drawHeight) / 2;
      }
      
      // Reduce height by 10% for kings and wizards
      if (piece.type === 'king' || piece.type === 'wizard') {
        drawHeight = drawHeight * 0.9; // 10% height reduction
        drawY = y + (actualSquare - drawHeight) / 2; // Re-center vertically
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
      ctx.fillText(symbol, x + actualSquare / 2, y + actualSquare / 2);
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

  // Handle canvas clicks - optimized for performance
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Account for canvas scaling: canvas internal size vs display size
    // The canvas has internal resolution of canvasSize but is displayed at effectiveBoardSize
    const scaleX = canvasSize / rect.width;
    const scaleY = canvasSize / rect.height;
    
    // Convert click coordinates to canvas internal coordinates
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    // Now calculate the square using the canvas's internal coordinate system
    const col = Math.floor(canvasX / squareSize);
    const row = Math.floor(canvasY / squareSize);
    
    // Only log in development mode for debugging
    if (process.env.NODE_ENV === 'development' && board[row]?.[col]) {
      console.log('🎯 Square clicked:', { row, col, piece: board[row][col]?.type });
    }
    
    if (row >= 0 && row < 10 && col >= 0 && col < 10) {
      // Trigger simple animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      
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

  // Enhanced visual effects rendering
  const drawEffects = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw particles with size support
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const size = particle.size || 3;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = 5;
      ctx.shadowColor = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });
    
    // Draw enhanced capture effect with intensity
    if (captureEffect) {
      const elapsed = Date.now() - captureEffect.timestamp;
      const progress = elapsed / 500; // Faster 0.5 second duration
      const alpha = (1 - progress) * captureEffect.intensity;
      const size = 15 + progress * 25;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#FF4500';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#FF4500';
      ctx.beginPath();
      ctx.arc(captureEffect.x, captureEffect.y, size, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Inner glow
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = '#FF4500';
      ctx.fill();
      ctx.restore();
    }
    
    // Draw attack burst effect (0.2s glowing burst with radial gradient)
    if (attackBurstEffect) {
      const elapsed = Date.now() - attackBurstEffect.timestamp;
      const progress = elapsed / 200; // 0.2 second duration
      
      if (progress < 1) {
        const alpha = 1 - progress;
        const size = 10 + progress * 40;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Create radial gradient burst
        const gradient = ctx.createRadialGradient(
          attackBurstEffect.x, attackBurstEffect.y, 0,
          attackBurstEffect.x, attackBurstEffect.y, size
        );
        gradient.addColorStop(0, attackBurstEffect.color);
        gradient.addColorStop(0.5, attackBurstEffect.color + '80'); // Semi-transparent
        gradient.addColorStop(1, attackBurstEffect.color + '00'); // Fully transparent
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(attackBurstEffect.x, attackBurstEffect.y, size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      } else {
        setAttackBurstEffect(null);
      }
    }
    
    // Draw wizard teleport effect (0.3s fade-out/fade-in)
    if (wizardTeleportEffect) {
      const elapsed = Date.now() - wizardTeleportEffect.timestamp;
      const progress = elapsed / 300; // 0.3 second total duration
      
      if (progress < 1) {
        ctx.save();
        
        if (wizardTeleportEffect.phase === 'fade-out') {
          // Fade out at origin with swirling effect
          const alpha = 1 - (progress * 2); // Fade out in first half
          if (alpha > 0) {
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.strokeStyle = '#9370DB';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#9370DB';
            
            // Swirling circles
            for (let i = 0; i < 4; i++) {
              const radius = 8 + i * 6 + (progress * 2) * 15;
              const rotation = progress * Math.PI * 4;
              ctx.beginPath();
              ctx.arc(
                wizardTeleportEffect.fromX + Math.cos(rotation + i) * 5,
                wizardTeleportEffect.fromY + Math.sin(rotation + i) * 5,
                radius, 0, 2 * Math.PI
              );
              ctx.stroke();
            }
          }
        } else {
          // Fade in at destination
          const alpha = progress * 2 - 1; // Fade in during second half
          if (alpha > 0) {
            ctx.globalAlpha = Math.min(1, alpha);
            ctx.fillStyle = '#9370DB';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#9370DB';
            
            // Materializing effect
            const sparkleSize = (1 - alpha) * 20;
            ctx.beginPath();
            ctx.arc(wizardTeleportEffect.toX, wizardTeleportEffect.toY, 8 + sparkleSize, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
        
        ctx.restore();
      } else {
        setWizardTeleportEffect(null);
      }
    }
    
    // Draw special move effects (enhanced)
    if (specialMoveEffect) {
      const elapsed = Date.now() - specialMoveEffect.timestamp;
      const progress = elapsed / 1500;
      const alpha = 1 - progress;
      
      if (specialMoveEffect.type === 'teleport') {
        // Enhanced teleport swirl effect
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#9370DB';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#9370DB';
        
        for (let i = 0; i < 6; i++) {
          const radius = 8 + i * 6 + progress * 25;
          const rotation = progress * Math.PI * 6;
          ctx.beginPath();
          ctx.arc(
            specialMoveEffect.x + Math.cos(rotation + i) * 3,
            specialMoveEffect.y + Math.sin(rotation + i) * 3,
            radius, 0, 2 * Math.PI
          );
          ctx.stroke();
        }
        ctx.restore();
      } else if (specialMoveEffect.type === 'spell') {
        // Enhanced magical glow effect
        ctx.save();
        ctx.globalAlpha = alpha;
        const glowSize = 15 + progress * 10;
        
        // Create magical gradient
        const gradient = ctx.createRadialGradient(
          specialMoveEffect.x, specialMoveEffect.y, 0,
          specialMoveEffect.x, specialMoveEffect.y, glowSize
        );
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.6, '#FF8C00');
        gradient.addColorStop(1, '#FF4500');
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#FFD700';
        ctx.beginPath();
        ctx.arc(specialMoveEffect.x, specialMoveEffect.y, glowSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }
    }
  };

  // Enhanced particle creation functions
  const createCaptureParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 45,
        maxLife: 45,
        color: color === 'white' ? '#FFD700' : '#8B0000',
        size: 2 + Math.random() * 3
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    
    // Trigger audio effect
    if (color === 'white') {
      playGameEvent('capture');
    }
  };

  // Create enhanced wizard sparkles with more variety
  const createWizardSparkles = (x: number, y: number) => {
    const newParticles: Particle[] = [];
    const colors = ['#9370DB', '#FF69B4', '#00CED1', '#FFD700', '#FF4500', '#32CD32'];
    
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 60 + Math.random() * 30,
        maxLife: 60 + Math.random() * 30,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1 + Math.random() * 2
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Create attack burst effect (0.2s burst with audio sync)
  const createAttackBurst = (x: number, y: number, attackerColor: string, isWizard: boolean = false) => {
    const color = attackerColor === 'white' ? '#FFD700' : '#8B0000';
    
    setAttackBurstEffect({
      x, y,
      timestamp: Date.now(),
      color
    });
    
    // Create intense particles for the burst
    const burstParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const speed = 6 + Math.random() * 4;
      burstParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        color,
        size: 3 + Math.random() * 2
      });
    }
    setParticles(prev => [...prev, ...burstParticles]);
    
    // Trigger audio with spatial positioning
    if (isWizard) {
      playWizardAbility('ranged_attack');
    } else {
      playGameEvent('capture');
    }
  };

  // Create smooth piece movement animation
  const animatePieceMove = (piece: any, fromRow: number, fromCol: number, toRow: number, toCol: number, moveType: 'normal' | 'wizard-teleport' | 'attack' | 'castling' = 'normal') => {
    const duration = moveType === 'wizard-teleport' ? 300 : moveType === 'attack' ? 200 : 500; // 0.3s for teleport, 0.2s for attack, 0.5s for normal
    
    setAnimatingPiece({
      piece,
      fromRow,
      fromCol,
      toRow,
      toCol,
      type: moveType,
      progress: 0,
      startTime: Date.now(),
      duration
    });
    
    setIsAnimating(true);
    
    // Play appropriate sound with spatial audio
    const centerX = (fromCol + toCol) * 0.5 * squareSize + squareSize * 0.5;
    const centerY = (fromRow + toRow) * 0.5 * squareSize + squareSize * 0.5;
    const spatialX = centerX / canvasSize;
    const spatialY = centerY / canvasSize;
    
    if (moveType === 'wizard-teleport') {
      // Wizard teleport with fade effect
      setWizardTeleportEffect({
        fromX: fromCol * squareSize + squareSize * 0.5,
        fromY: fromRow * squareSize + squareSize * 0.5,
        toX: toCol * squareSize + squareSize * 0.5,
        toY: toRow * squareSize + squareSize * 0.5,
        timestamp: Date.now(),
        phase: 'fade-out'
      });
      
      // Switch to fade-in after half duration
      setTimeout(() => {
        setWizardTeleportEffect(prev => 
          prev ? { ...prev, phase: 'fade-in' } : null
        );
      }, 150);
      
      playWizardAbility('teleport');
      createWizardSparkles(fromCol * squareSize + squareSize * 0.5, fromRow * squareSize + squareSize * 0.5);
      setTimeout(() => {
        createWizardSparkles(toCol * squareSize + squareSize * 0.5, toRow * squareSize + squareSize * 0.5);
      }, 150);
      
    } else if (moveType === 'attack') {
      createAttackBurst(toCol * squareSize + squareSize * 0.5, toRow * squareSize + squareSize * 0.5, piece.color, piece.type === 'wizard');
      
    } else if (piece.type === 'wizard') {
      playWizardAbility('summon');
      createWizardSparkles(centerX, centerY);
      
    } else {
      playPieceMovementSound(piece.type);
    }
  };

  // Enhanced animation system with smooth 60fps rendering
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    const animate = () => {
      let shouldContinue = false;
      
      // Update particles with physics
      setParticles(prev => {
        const updatedParticles = prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
            vy: particle.vy + 0.15, // Enhanced gravity for more realistic physics
            vx: particle.vx * 0.99 // Air resistance
          }))
          .filter(particle => particle.life > 0);
        
        if (updatedParticles.length > 0) shouldContinue = true;
        return updatedParticles;
      });
      
      // Update effects timers
      setCaptureEffect(prev => {
        if (prev && Date.now() - prev.timestamp > 500) {
          return null;
        }
        if (prev) shouldContinue = true;
        return prev;
      });
      
      setSpecialMoveEffect(prev => {
        if (prev && Date.now() - prev.timestamp > 1500) {
          return null;
        }
        if (prev) shouldContinue = true;
        return prev;
      });
      
      setAttackBurstEffect(prev => {
        if (prev && Date.now() - prev.timestamp > 200) {
          return null;
        }
        if (prev) shouldContinue = true;
        return prev;
      });
      
      setWizardTeleportEffect(prev => {
        if (prev && Date.now() - prev.timestamp > 300) {
          return null;
        }
        if (prev) shouldContinue = true;
        return prev;
      });
      
      // Check if piece animation is ongoing
      if (animatingPiece) {
        shouldContinue = true;
      }
      
      // Redraw canvas with all effects
      drawBoard();
      drawEffects();
      
      // Continue animation loop if needed
      if (shouldContinue) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Start animation if there are effects to show
    const hasActiveEffects = particles.length > 0 || captureEffect || specialMoveEffect || 
                           attackBurstEffect || wizardTeleportEffect || animatingPiece || isAnimating;
    
    if (hasActiveEffects) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles, captureEffect, specialMoveEffect, attackBurstEffect, wizardTeleportEffect, animatingPiece, isAnimating]);

  // Move detection and animation triggering
  useEffect(() => {
    if (moveHistory.length > 0) {
      const lastMove = moveHistory[moveHistory.length - 1];
      console.log('🎬 Detected move:', lastMove);
      
      // Extract move details
      const moveNotation = lastMove.notation || lastMove.move || '';
      const isCapture = moveNotation.includes('x') || moveNotation.includes('X');
      const isCheck = moveNotation.includes('+');
      const isCheckmate = moveNotation.includes('#');
      const isCastling = moveNotation.includes('O-O') || moveNotation.includes('0-0');
      
      // Try to extract positions from the move notation or move object
      let fromRow = -1, fromCol = -1, toRow = -1, toCol = -1;
      
      // If move object has position data
      if (lastMove.from && lastMove.to) {
        fromRow = lastMove.from.row || 0;
        fromCol = lastMove.from.col || 0;
        toRow = lastMove.to.row || 0;
        toCol = lastMove.to.col || 0;
      } else if (typeof lastMove.move === 'string' && lastMove.move.length >= 4) {
        // Parse algebraic notation like "e2e4"
        const moveStr = lastMove.move.toLowerCase();
        if (moveStr.length >= 4) {
          fromCol = moveStr.charCodeAt(0) - 97; // 'a' = 97
          fromRow = 10 - parseInt(moveStr[1]);
          toCol = moveStr.charCodeAt(2) - 97;
          toRow = 10 - parseInt(moveStr[3]);
        }
      }
      
      // Check if this is a wizard ranged attack (wizard stays in place)
      const isWizardAttack = lastMove.isWizardAttack || false;
      
      // Get the piece that made the move
      // For wizard attacks, the wizard stays at the from position
      const movedPiece = isWizardAttack 
        ? (fromRow >= 0 && fromCol >= 0 ? board[fromRow][fromCol] : null)
        : (toRow >= 0 && toCol >= 0 ? board[toRow][toCol] : null);
      
      if (movedPiece && fromRow >= 0 && fromCol >= 0 && toRow >= 0 && toCol >= 0) {
        // Special handling for wizard ranged attacks
        if (isWizardAttack) {
          console.log('🧙 Wizard ranged attack detected - wizard stays at:', { row: fromRow, col: fromCol });
          
          // Calculate positions for magic beam effect
          const wizardX = fromCol * squareSize + squareSize / 2;
          const wizardY = fromRow * squareSize + squareSize / 2;
          const targetX = toCol * squareSize + squareSize / 2;
          const targetY = toRow * squareSize + squareSize / 2;
          
          // Create magical beam particles from wizard to target
          const beamParticles: Particle[] = [];
          const beamSteps = 20;
          const dx = targetX - wizardX;
          const dy = targetY - wizardY;
          
          // Create delayed particle trail for magic beam effect
          for (let i = 0; i < beamSteps; i++) {
            setTimeout(() => {
              const progress = i / beamSteps;
              const beamX = wizardX + dx * progress;
              const beamY = wizardY + dy * progress;
              
              // Create magical sparkles along the beam path
              for (let j = 0; j < 3; j++) {
                beamParticles.push({
                  x: beamX + (Math.random() - 0.5) * 10,
                  y: beamY + (Math.random() - 0.5) * 10,
                  vx: (Math.random() - 0.5) * 2,
                  vy: (Math.random() - 0.5) * 2 - 0.5,
                  life: 30,
                  maxLife: 30,
                  color: ['#ff00ff', '#aa00ff', '#ff44ff'][Math.floor(Math.random() * 3)], // Purple variations
                  size: 2 + Math.random() * 2
                });
              }
              setParticles(prev => [...prev, ...beamParticles]);
            }, i * 15); // Stagger particle creation for beam effect
          }
          
          // Delayed impact explosion at target
          setTimeout(() => {
            // Trigger attack burst effect at target
            setAttackBurstEffect({
              x: targetX,
              y: targetY,
              timestamp: Date.now(),
              color: '#ff00ff' // Purple for wizard attacks
            });
            
            // Create impact particles at target
            const impactParticles: Particle[] = [];
            for (let i = 0; i < 25; i++) {
              const angle = (i / 25) * Math.PI * 2;
              const speed = 5 + Math.random() * 4;
              impactParticles.push({
                x: targetX,
                y: targetY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 35,
                maxLife: 35,
                color: '#ff00ff', // Purple for wizard attacks
                size: 4 + Math.random() * 3
              });
            }
            
            // Add some larger magical orbs
            for (let i = 0; i < 5; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 2 + Math.random() * 2;
              impactParticles.push({
                x: targetX,
                y: targetY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                life: 45,
                maxLife: 45,
                color: '#ffaaff', // Light purple orbs
                size: 6 + Math.random() * 4
              });
            }
            
            setParticles(prev => [...prev, ...impactParticles]);
          }, 300); // Delay impact for dramatic effect
          
          // Play wizard attack sound
          playWizardAbility('ranged_attack');
          
          // Don't animate piece movement for ranged attacks
          return;
        }
        
        console.log('🎭 Animating piece movement:', {
          piece: movedPiece.type,
          from: { row: fromRow, col: fromCol },
          to: { row: toRow, col: toCol },
          type: isCastling ? 'castling' : 
                (movedPiece.type === 'wizard' && Math.abs(fromRow - toRow) > 1 || Math.abs(fromCol - toCol) > 1) ? 'wizard-teleport' :
                isCapture ? 'attack' : 'normal'
        });
        
        // Trigger appropriate animation
        let animationType: 'normal' | 'wizard-teleport' | 'attack' | 'castling' = 'normal';
        
        if (isCastling) {
          animationType = 'castling';
        } else if (movedPiece.type === 'wizard' && !isCapture && (Math.abs(fromRow - toRow) > 1 || Math.abs(fromCol - toCol) > 1)) {
          animationType = 'wizard-teleport';
        } else if (isCapture) {
          animationType = 'attack';
        }
        
        // Start animation
        animatePieceMove(movedPiece, fromRow, fromCol, toRow, toCol, animationType);
        
        // Add special effects for captures
        if (isCapture) {
          const centerX = toCol * squareSize + squareSize * 0.5;
          const centerY = toRow * squareSize + squareSize * 0.5;
          createCaptureParticles(centerX, centerY, movedPiece.color);
          
          setCaptureEffect({
            x: centerX,
            y: centerY,
            timestamp: Date.now(),
            intensity: isCheckmate ? 2.0 : isCheck ? 1.5 : 1.0
          });
        }
        
        // Add special effects for check/checkmate
        if (isCheck || isCheckmate) {
          const kingColor = movedPiece.color === 'white' ? 'black' : 'white';
          // Find king position and add warning effect
          for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
              const piece = board[row][col];
              if (piece && piece.type === 'king' && piece.color === kingColor) {
                const kingX = col * squareSize + squareSize * 0.5;
                const kingY = row * squareSize + squareSize * 0.5;
                
                setSpecialMoveEffect({
                  x: kingX,
                  y: kingY,
                  type: isCheckmate ? 'checkmate' : 'check',
                  timestamp: Date.now()
                });
                break;
              }
            }
          }
        }
      }
    }
  }, [moveHistory.length, board, squareSize]); // Depend on moveHistory length to detect new moves

  // Enhanced click handler with visual feedback
  const handleCanvasClickWithEffects = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Create click ripple effect
    const centerX = Math.floor(x / squareSize) * squareSize + squareSize * 0.5;
    const centerY = Math.floor(y / squareSize) * squareSize + squareSize * 0.5;
    
    // Add subtle click particles
    const clickParticles: Particle[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const speed = 2 + Math.random() * 2;
      clickParticles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 20,
        maxLife: 20,
        color: '#FFD700',
        size: 1
      });
    }
    setParticles(prev => [...prev, ...clickParticles]);
    
    // Play UI sound
    playUISound('click');
    
    // Call original click handler
    handleCanvasClick(event);
  };

  // Force mobile mode for testing if screen is small (desktop mobile view mode)
  const forceMobileMode = deviceInfo.screenWidth <= 768 || window.innerWidth <= 768;
  const finalIsMobile = deviceInfo.isMobile || forceMobileMode;
  
  // Calculate mobile-responsive sizing and styling
  const isMobileDevice = finalIsMobile;
  const shouldHideCoordinates = isMobileDevice && deviceInfo.orientation === 'portrait' && !settings.mobileShowCoordinates;
  
  // Debug device detection only in development
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) { // Log occasionally
    console.log('🔍 ChessBoard Device Detection:', {
      deviceInfo,
      forceMobileMode,
      finalIsMobile,
      currentCanvasSize: canvasSize
    });
  }
  
  // Force immediate mobile sizing for screens <= 768px
  React.useEffect(() => {
    // Mobile mode detection handled silently
  }, []);
  
  // Mobile-specific board size calculation with forced mobile detection
  const mobileBoardSize = React.useMemo(() => {
    // Force mobile sizing for narrow screens
    const shouldUseMobileSize = isMobileDevice || window.innerWidth <= 768;
    
    if (!shouldUseMobileSize) return canvasSize;
    
    const actualWidth = window.innerWidth;
    const actualHeight = window.innerHeight;
    
    // Consistent padding with desktop calculations - include border
    const padding = 20; // Reduced to match desktop
    const labelHeight = 30;
    const labelWidth = 30;
    const borderWidth = 8; // Account for border-4 class (4px each side)
    
    let availableWidth = actualWidth - padding * 2 - borderWidth; // Subtract border width
    let availableHeight = actualHeight - padding * 2 - 50; // Adjusted for top gap
    
    // Calculate optimal size based on actual viewport with more mobile-friendly constraints
    const isPortrait = actualWidth < actualHeight;
    
    console.log('📐 Mobile sizing calculation (REAL DEVICE):', {
      actualWidth,
      actualHeight,
      availableWidth,
      availableHeight,
      isPortrait,
      shouldUseMobileSize,
      padding,
      labelHeight,
      labelWidth
    });
    
    let calculatedSize;
    
    if (isPortrait) {
      // Portrait: prioritize width with more aggressive constraints
      const maxByWidth = availableWidth;
      const maxByHeight = availableHeight * 0.75; // Use 75% of available height
      calculatedSize = Math.min(maxByWidth, maxByHeight);
      console.log('📱 Portrait calculation:', { maxByWidth, maxByHeight, calculatedSize });
    } else {
      // Landscape: prioritize height with better constraints  
      const maxByWidth = availableWidth * 0.65; // Use 65% of width in landscape
      const maxByHeight = availableHeight * 0.85; // Use 85% of height
      calculatedSize = Math.min(maxByWidth, maxByHeight);
      console.log('📱 Landscape calculation:', { maxByWidth, maxByHeight, calculatedSize });
    }
    
    // Ensure minimum size but cap maximum for mobile
    const finalSize = Math.max(240, Math.min(calculatedSize, actualWidth <= 480 ? 360 : 420));
    
    console.log('📱 Final mobile size:', {
      calculatedSize,
      finalSize,
      deviceWidth: actualWidth,
      reductionFromDesktop: `${Math.round((1 - finalSize/canvasSize) * 100)}%`
    });
    
    return finalSize;
  }, [isMobileDevice, deviceInfo, canvasSize]);
  
  // Force mobile sizing for narrow screens regardless of device detection
  const shouldUseMobileSize = isMobileDevice || window.innerWidth <= 768;
  const effectiveBoardSize = shouldUseMobileSize ? mobileBoardSize : canvasSize;
  const effectiveSquareSize = effectiveBoardSize / 10;
  
  // Only log sizing info occasionally in development
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
    console.log('📐 Board sizing:', {
      effectiveBoardSize,
      effectiveSquareSize
    });
  }

  return (
    <div className={cn(
      "board-container",
      "flex flex-col items-center justify-start", // Position at top
      "w-full h-screen overflow-hidden p-1", // Full viewport with minimal padding
      isMobileDevice && "mobile-board-container",
      isMobileDevice && deviceInfo.orientation === 'portrait' && "portrait-board",
      isMobileDevice && deviceInfo.orientation === 'landscape' && "landscape-board"
    )}
    style={{
      backgroundColor: 'transparent',
      position: 'relative',
      marginTop: '-30px' // Reduced negative margin to minimize top gap
    }}>
      {/* AI Thinking Indicator */}
      {aiThinking && (
        <AIThinkingIndicator difficulty={aiDifficulty} />
      )}
      
      <div 
        className={cn(
          "chess-board",
          "relative",
          isMobileDevice && "mobile-chess-board"
        )}
        style={{
          width: `${effectiveBoardSize}px`,
          height: `${effectiveBoardSize}px`,
          margin: '0 auto', // Always center the board
          maxWidth: 'calc(100vw - 48px)', // Full width minus padding (20px*2) and border (8px)
          maxHeight: 'calc(100vh - 100px)', // Full height minus padding and adjusted for top gap
          position: 'relative'
        }}
      >
        <div className="board-coordinates">
          {/* Column labels - hide on mobile portrait if setting is disabled */}
          {!shouldHideCoordinates && (
            <div className="coord-row">
              <div 
                className="coord-corner" 
                style={{ 
                  width: Math.max(20, effectiveSquareSize * 0.3) + 'px', 
                  height: Math.max(20, effectiveSquareSize * 0.3) + 'px' 
                }}
              ></div>
              {Array.from({ length: 10 }, (_, i) => (
                <div 
                  key={i} 
                  className={cn("coord-label", isMobileDevice && "mobile-coord-label")} 
                  style={{ width: effectiveSquareSize }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
          )}
          
          {/* Canvas board with row labels */}
          <div className="canvas-container flex">
            {!shouldHideCoordinates && (
              <div className="row-labels flex flex-col">
                {Array.from({ length: 10 }, (_, i) => (
                  <div 
                    key={i} 
                    className={cn("coord-label row-label", isMobileDevice && "mobile-coord-label")} 
                    style={{ height: effectiveSquareSize }}
                  >
                    {10 - i}
                  </div>
                ))}
              </div>
            )}
            
            <canvas
              id="chess-canvas"
              ref={canvasRef}
              width={effectiveBoardSize} // Match internal resolution to display size
              height={effectiveBoardSize} // Match internal resolution to display size
              onClick={handleCanvasClickWithEffects}
              className={cn(
                "chess-canvas",
                isAnimating && "glow-selected",
                isMobileDevice && "mobile-chess-canvas",
                isMobileDevice && "touch-manipulation"
              )}
              style={{ 
                cursor: 'pointer',
                width: effectiveBoardSize + 'px',  // Display size matches internal
                height: effectiveBoardSize + 'px', // Display size matches internal
                border: isMobileDevice ? '3px solid #b58863' : undefined,
                borderRadius: isMobileDevice ? '8px' : undefined,
                boxShadow: isMobileDevice ? '0 4px 12px rgba(0,0,0,0.3)' : undefined
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
