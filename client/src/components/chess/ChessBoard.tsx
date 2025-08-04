import React from 'react';
import { useChess } from '../../lib/stores/useChess';
import { ChessPiece } from './ChessPiece';
import { Position } from '../../lib/chess/types';

export function ChessBoard() {
  const { board, selectedPosition, validMoves, selectSquare } = useChess();

  const handleSquareClick = (row: number, col: number) => {
    selectSquare({ row, col });
  };

  const isValidMoveSquare = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isSelectedSquare = (row: number, col: number): boolean => {
    return selectedPosition?.row === row && selectedPosition?.col === col;
  };

  const getSquareColor = (row: number, col: number): string => {
    const isLight = (row + col) % 2 === 0;
    const baseColor = isLight ? 'square-light' : 'square-dark';
    
    if (isSelectedSquare(row, col)) {
      return `${baseColor} square-selected`;
    }
    
    if (isValidMoveSquare(row, col)) {
      return `${baseColor} square-valid-move`;
    }
    
    return baseColor;
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
        
        {/* Board with row labels */}
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            <div className="coord-label">{10 - rowIndex}</div>
            {row.map((piece, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`chess-square ${getSquareColor(rowIndex, colIndex)}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              >
                {piece && (
                  <ChessPiece
                    piece={piece}
                    position={{ row: rowIndex, col: colIndex }}
                  />
                )}
                {isValidMoveSquare(rowIndex, colIndex) && (
                  <div className="move-indicator" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
