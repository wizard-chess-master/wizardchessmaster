import React from 'react';
import { ChessPiece as ChessPieceType, Position } from '../../lib/chess/types';

interface ChessPieceProps {
  piece: ChessPieceType;
  position: Position;
}

export function ChessPiece({ piece }: ChessPieceProps) {
  const getPieceSymbol = (): string => {
    const symbols = {
      white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙',
        wizard: '🧙'  // White wizard
      },
      black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟',
        wizard: '🧙'  // Black wizard (will be styled with CSS)
      }
    };

    return symbols[piece.color][piece.type];
  };

  const getPieceClass = (): string => {
    return `chess-piece ${piece.color} ${piece.type}`;
  };

  return (
    <div className={getPieceClass()}>
      <span className="piece-symbol">
        {getPieceSymbol()}
      </span>
    </div>
  );
}
