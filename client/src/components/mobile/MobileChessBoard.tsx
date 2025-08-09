import React, { useMemo } from 'react';
import { useDeviceDetection } from '@/lib/hooks/useDeviceDetection';
import { useDeviceStore } from '@/lib/stores/useDeviceStore';
import { useChess } from '@/lib/stores/useChess';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { cn } from '@/lib/utils';

interface MobileChessBoardProps {
  className?: string;
}

export function MobileChessBoard({ className }: MobileChessBoardProps) {
  const deviceInfo = useDeviceDetection();
  const { settings } = useDeviceStore();
  const { board, selectedPosition } = useChess();

  // Calculate optimal board size based on device and orientation
  const boardSize = useMemo(() => {
    if (!deviceInfo.isMobile) return 'var(--chess-board-size)';
    
    const baseSize = Math.min(deviceInfo.screenWidth, deviceInfo.screenHeight) * 0.85;
    
    switch (settings.mobileChessBoardSize) {
      case 'small':
        return Math.min(baseSize * 0.8, 300);
      case 'large':
        return Math.min(baseSize, 450);
      default: // medium
        return Math.min(baseSize * 0.9, 375);
    }
  }, [deviceInfo, settings.mobileChessBoardSize]);

  const coordinatesVisible = settings.mobileShowCoordinates && deviceInfo.orientation === 'landscape';

  return (
    <div 
      className={cn(
        'mobile-chess-board-container',
        'flex flex-col items-center justify-center',
        'p-2',
        className
      )}
      style={{
        '--mobile-board-size': typeof boardSize === 'number' ? `${boardSize}px` : boardSize
      } as React.CSSProperties}
    >
      {/* Coordinates - Top (files: a-j) */}
      {coordinatesVisible && (
        <div className="coordinate-row flex w-full max-w-[var(--mobile-board-size)] mb-1">
          <div className="coordinate-corner w-6"></div>
          {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((file) => (
            <div 
              key={file} 
              className="coordinate-label flex-1 text-center text-xs text-amber-300 font-semibold"
            >
              {file}
            </div>
          ))}
          <div className="coordinate-corner w-6"></div>
        </div>
      )}

      <div className="board-with-coordinates flex">
        {/* Coordinates - Left (ranks: 10-1) */}
        {coordinatesVisible && (
          <div className="coordinate-column flex flex-col">
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rank) => (
              <div 
                key={rank} 
                className="coordinate-label flex-1 flex items-center justify-center text-xs text-amber-300 font-semibold w-6"
              >
                {rank}
              </div>
            ))}
          </div>
        )}

        {/* Chess Board */}
        <div 
          className={cn(
            'mobile-chess-board',
            'relative',
            'border-4 border-amber-800',
            'rounded-lg',
            'shadow-2xl',
            'bg-gradient-to-br from-amber-100 to-amber-200',
            deviceInfo.orientation === 'portrait' && 'mx-auto'
          )}
          style={{
            width: 'var(--mobile-board-size)',
            height: 'var(--mobile-board-size)'
          }}
        >
          <ChessBoard />
          
          {/* Mobile-specific overlays */}
          {deviceInfo.isMobile && (
            <div className="mobile-board-overlay absolute inset-0 pointer-events-none">
              {/* Touch feedback for selected square */}
              {selectedPosition && (
                <div 
                  className="selected-square-highlight absolute bg-blue-400/30 border-2 border-blue-500 rounded-md z-10"
                  style={{
                    left: `${(selectedPosition.col / 10) * 100}%`,
                    top: `${((9 - selectedPosition.row) / 10) * 100}%`,
                    width: '10%',
                    height: '10%'
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Coordinates - Right (ranks: 10-1) */}
        {coordinatesVisible && (
          <div className="coordinate-column flex flex-col">
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rank) => (
              <div 
                key={rank} 
                className="coordinate-label flex-1 flex items-center justify-center text-xs text-amber-300 font-semibold w-6"
              >
                {rank}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coordinates - Bottom (files: a-j) */}
      {coordinatesVisible && (
        <div className="coordinate-row flex w-full max-w-[var(--mobile-board-size)] mt-1">
          <div className="coordinate-corner w-6"></div>
          {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((file) => (
            <div 
              key={file} 
              className="coordinate-label flex-1 text-center text-xs text-amber-300 font-semibold"
            >
              {file}
            </div>
          ))}
          <div className="coordinate-corner w-6"></div>
        </div>
      )}

      {/* Mobile game info overlay */}
      <div className="mobile-game-info mt-2 text-center">
        <div className="text-sm text-amber-200">
          Tap to select • Double-tap to move • Long press for hints
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized square component for touch interactions
export function MobileTouchSquare({ 
  position, 
  piece, 
  isSelected, 
  isValidMove, 
  onTouch 
}: {
  position: { row: number; col: number };
  piece?: any;
  isSelected?: boolean;
  isValidMove?: boolean;
  onTouch: (position: { row: number; col: number }) => void;
}) {
  const deviceInfo = useDeviceDetection();
  
  if (!deviceInfo.isMobile) return null;

  return (
    <div
      className={cn(
        'mobile-touch-square',
        'absolute inset-0',
        'touch-manipulation',
        isSelected && 'bg-blue-400/20',
        isValidMove && 'bg-green-400/20'
      )}
      style={{
        left: `${(position.col / 10) * 100}%`,
        top: `${((9 - position.row) / 10) * 100}%`,
        width: '10%',
        height: '10%'
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        onTouch(position);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
      }}
    >
      {/* Touch target indicator */}
      <div className="absolute inset-1 border border-amber-400/30 rounded-sm opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
}