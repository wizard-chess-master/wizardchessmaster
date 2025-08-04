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
        wizard: '♕'  // Using queen symbol for wizard (distinctive)
      },
      black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟',
        wizard: '♛'  // Using queen symbol for wizard (distinctive)
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
      {piece.type === 'wizard' && (
        <span className="wizard-indicator">⚡</span>
      )}
    </div>
  );
}
