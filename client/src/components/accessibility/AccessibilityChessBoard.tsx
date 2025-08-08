/**
 * Accessibility-Enhanced Chess Board
 * Provides keyboard navigation, screen reader support, and audio feedback
 */

import React from 'react';
import { accessibilityManager } from '../../lib/accessibility/accessibilityManager';

interface AccessibilityChessBoardProps {
  board: any[][];
  selectedSquare: string | null;
  validMoves: string[];
  onSquareSelect: (square: string) => void;
  onMove: (from: string, to: string) => void;
  currentPlayer: 'white' | 'black';
  className?: string;
}

export default function AccessibilityChessBoard({
  board,
  selectedSquare,
  validMoves,
  onSquareSelect,
  onMove,
  currentPlayer,
  className
}: AccessibilityChessBoardProps) {
  const [focusedSquare, setFocusedSquare] = React.useState<string | null>(null);
  const [keyboardMode, setKeyboardMode] = React.useState(false);
  const boardRef = React.useRef<HTMLDivElement>(null);

  // Convert row/col to chess notation (a1, b2, etc.)
  const getSquareNotation = (row: number, col: number): string => {
    const file = String.fromCharCode(97 + col); // a-j
    const rank = (10 - row).toString(); // 10-1
    return file + rank;
  };

  // Convert chess notation to row/col
  const getRowCol = (square: string): [number, number] => {
    const file = square.charCodeAt(0) - 97; // a=0, b=1, etc.
    const rank = parseInt(square[1]); // 1-10
    const row = 10 - rank;
    return [row, file];
  };

  // Get piece description for screen readers
  const getPieceDescription = (piece: any): string => {
    if (!piece) return 'empty square';
    return `${piece.color} ${piece.type}`;
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!keyboardMode) {
      setKeyboardMode(true);
    }

    const settings = accessibilityManager.getSettings();
    if (!settings.enabled || !settings.keyboardNavigation) return;

    event.preventDefault();

    let newRow = 0;
    let newCol = 0;

    if (focusedSquare) {
      [newRow, newCol] = getRowCol(focusedSquare);
    }

    switch (event.key) {
      case 'ArrowUp':
        newRow = Math.max(0, newRow - 1);
        break;
      case 'ArrowDown':
        newRow = Math.min(9, newRow + 1);
        break;
      case 'ArrowLeft':
        newCol = Math.max(0, newCol - 1);
        break;
      case 'ArrowRight':
        newCol = Math.min(9, newCol + 1);
        break;
      case 'Enter':
      case ' ':
        if (focusedSquare) {
          handleSquareActivation(focusedSquare);
        }
        return;
      case 'Escape':
        setFocusedSquare(null);
        onSquareSelect('');
        accessibilityManager.announceGameState({
          type: 'move',
          message: 'Selection cleared',
          priority: 'low'
        });
        return;
      case 'h':
        if (event.ctrlKey) {
          announceKeyboardHelp();
        }
        return;
      case 'p':
        if (focusedSquare) {
          announcePieceInfo(focusedSquare);
        }
        return;
      case 'm':
        if (selectedSquare) {
          announceAvailableMoves();
        }
        return;
      case 'b':
        announceBoardPosition();
        return;
      default:
        return;
    }

    const newSquare = getSquareNotation(newRow, newCol);
    setFocusedSquare(newSquare);
    announceSquareFocus(newSquare);
  };

  // Handle square activation (click or enter/space)
  const handleSquareActivation = (square: string) => {
    if (selectedSquare && selectedSquare !== square && validMoves.includes(square)) {
      // Make move
      const [fromRow, fromCol] = getRowCol(selectedSquare);
      const [toRow, toCol] = getRowCol(square);
      const piece = board[fromRow][fromCol];
      const capturedPiece = board[toRow][toCol];
      
      onMove(selectedSquare, square);
      
      // Announce move
      accessibilityManager.announceMove(
        getPieceDescription(piece),
        selectedSquare,
        square,
        !!capturedPiece
      );
      
      setFocusedSquare(square);
    } else {
      // Select square
      onSquareSelect(square);
      setFocusedSquare(square);
      
      const [row, col] = getRowCol(square);
      const piece = board[row][col];
      
      if (piece) {
        // Announce piece selection and available moves
        accessibilityManager.announceGameState({
          type: 'move',
          message: `Selected ${getPieceDescription(piece)} on ${formatSquareForSpeech(square)}`,
          priority: 'medium'
        });
        
        // Announce available moves after a brief delay
        setTimeout(() => {
          const availableMoves = validMoves.filter(move => 
            selectedSquare === square ? validMoves.includes(move) : false
          );
          if (availableMoves.length > 0) {
            accessibilityManager.announceAvailableMoves(
              getPieceDescription(piece),
              square,
              availableMoves
            );
          }
        }, 500);
      } else {
        accessibilityManager.announceGameState({
          type: 'move',
          message: `Selected empty square ${formatSquareForSpeech(square)}`,
          priority: 'low'
        });
      }
    }
  };

  // Announce square focus during keyboard navigation
  const announceSquareFocus = (square: string) => {
    const [row, col] = getRowCol(square);
    const piece = board[row][col];
    const description = getPieceDescription(piece);
    
    accessibilityManager.announceGameState({
      type: 'position',
      message: `${formatSquareForSpeech(square)}, ${description}`,
      priority: 'low'
    });
  };

  // Announce piece information
  const announcePieceInfo = (square: string) => {
    const [row, col] = getRowCol(square);
    const piece = board[row][col];
    
    if (piece) {
      const isSelected = selectedSquare === square;
      const canMove = validMoves.length > 0 && selectedSquare === square;
      
      let message = `${getPieceDescription(piece)} on ${formatSquareForSpeech(square)}`;
      if (isSelected) message += ', currently selected';
      if (canMove) message += `, has ${validMoves.length} available moves`;
      
      accessibilityManager.announceGameState({
        type: 'position',
        message,
        priority: 'medium'
      });
    } else {
      accessibilityManager.announceGameState({
        type: 'position',
        message: `Empty square ${formatSquareForSpeech(square)}`,
        priority: 'low'
      });
    }
  };

  // Announce available moves for selected piece
  const announceAvailableMoves = () => {
    if (!selectedSquare) return;
    
    const [row, col] = getRowCol(selectedSquare);
    const piece = board[row][col];
    
    if (piece && validMoves.length > 0) {
      accessibilityManager.announceAvailableMoves(
        getPieceDescription(piece),
        selectedSquare,
        validMoves
      );
    }
  };

  // Announce board position
  const announceBoardPosition = () => {
    accessibilityManager.announceBoardPosition(board);
  };

  // Announce keyboard help
  const announceKeyboardHelp = () => {
    const helpMessage = `Chess board keyboard controls: 
    Arrow keys to navigate squares, 
    Enter or Space to select or move, 
    Escape to clear selection, 
    P for piece information, 
    M for available moves, 
    B for board position, 
    Control H for this help.`;
    
    accessibilityManager.announceGameState({
      type: 'move',
      message: helpMessage,
      priority: 'high'
    });
  };

  // Format square for speech synthesis
  const formatSquareForSpeech = (square: string): string => {
    const file = square[0].toUpperCase();
    const rank = square[1];
    return `${file} ${rank}`;
  };

  // Render individual square
  const renderSquare = (row: number, col: number) => {
    const square = getSquareNotation(row, col);
    const piece = board[row][col];
    const isSelected = selectedSquare === square;
    const isFocused = focusedSquare === square;
    const isValidMove = validMoves.includes(square);
    const isLight = (row + col) % 2 === 0;

    const settings = accessibilityManager.getSettings();

    return (
      <div
        key={square}
        className={`
          relative w-12 h-12 border border-gray-400 cursor-pointer
          flex items-center justify-center text-lg font-bold
          ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
          ${isSelected ? 'ring-4 ring-blue-500' : ''}
          ${isFocused ? 'ring-2 ring-purple-500' : ''}
          ${isValidMove ? 'ring-2 ring-green-400' : ''}
          ${settings.highContrastMode ? 'border-2 border-black' : ''}
          ${settings.reducedMotion ? '' : 'transition-all duration-200'}
          hover:opacity-80
        `}
        onClick={() => handleSquareActivation(square)}
        onMouseEnter={() => {
          if (!keyboardMode) {
            setFocusedSquare(square);
          }
        }}
        role="button"
        tabIndex={isFocused ? 0 : -1}
        aria-label={`${formatSquareForSpeech(square)}, ${getPieceDescription(piece)}${isSelected ? ', selected' : ''}${isValidMove ? ', valid move' : ''}`}
        aria-pressed={isSelected}
        aria-describedby={`square-${square}-description`}
      >
        {/* Piece Symbol */}
        {piece && (
          <span 
            className={`
              ${piece.color === 'white' ? 'text-white' : 'text-black'}
              ${settings.largeText ? 'text-2xl' : 'text-lg'}
              drop-shadow-sm
            `}
            aria-hidden="true"
          >
            {getPieceSymbol(piece)}
          </span>
        )}

        {/* Valid Move Indicator */}
        {isValidMove && !piece && (
          <div 
            className="w-4 h-4 bg-green-400 rounded-full opacity-70"
            aria-hidden="true"
          />
        )}

        {/* Screen Reader Description */}
        <div 
          id={`square-${square}-description`} 
          className="sr-only"
        >
          Square {formatSquareForSpeech(square)}, contains {getPieceDescription(piece)}
          {isSelected && ', currently selected'}
          {isValidMove && ', valid move destination'}
        </div>
      </div>
    );
  };

  // Get piece symbol for display
  const getPieceSymbol = (piece: any): string => {
    const symbols: Record<string, string> = {
      'king': '♔',
      'queen': '♕',
      'rook': '♖',
      'bishop': '♗',
      'knight': '♘',
      'pawn': '♙',
      'wizard': '🧙'
    };
    return symbols[piece.type] || '?';
  };

  return (
    <div 
      ref={boardRef}
      className={`
        inline-block border-4 border-gray-800 bg-gray-900 p-4
        ${className}
      `}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="grid"
      aria-label={`Chess board, ${currentPlayer} to move`}
      aria-describedby="board-instructions"
    >
      {/* Board Instructions */}
      <div id="board-instructions" className="sr-only">
        Use arrow keys to navigate, Enter or Space to select, Escape to clear selection.
        Press P for piece info, M for moves, B for board position, Ctrl+H for help.
      </div>

      {/* Board Grid */}
      <div className="grid grid-cols-10 gap-0">
        {board.map((row, rowIndex) =>
          row.map((_, colIndex) => renderSquare(rowIndex, colIndex))
        )}
      </div>

      {/* Current Turn Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {currentPlayer} to move
      </div>
    </div>
  );
}