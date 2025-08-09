import React from 'react';
import { useDeviceDetection } from '@/lib/hooks/useDeviceDetection';
import { useDeviceStore } from '@/lib/stores/useDeviceStore';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { cn } from '@/lib/utils';

export function MobileChessBoardWrapper() {
  const deviceInfo = useDeviceDetection();
  const { settings } = useDeviceStore();

  if (!deviceInfo.isMobile) {
    return <ChessBoard />;
  }

  return (
    <div 
      className={cn(
        'mobile-chess-wrapper',
        'w-full h-full',
        'flex items-center justify-center',
        'p-2'
      )}
    >
      <div 
        className={cn(
          'mobile-chess-container',
          'relative',
          'bg-gradient-to-br from-amber-100 to-amber-200',
          'border-4 border-amber-800',
          'rounded-lg shadow-2xl',
          'w-full h-full',
          'max-w-[500px] max-h-[500px]',
          'aspect-square'
        )}
        style={{
          // Ensure the board fills available space efficiently
          minWidth: '280px',
          minHeight: '280px'
        }}
      >
        {/* Chess board content */}
        <div className="absolute inset-0 p-1">
          <ChessBoard />
        </div>

        {/* Mobile-specific touch overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: deviceInfo.isTouch ? 
              'radial-gradient(circle at center, transparent 95%, rgba(255,255,255,0.1) 100%)' : 
              'none'
          }}
        />
      </div>
    </div>
  );
}

// Enhanced mobile chess board that automatically adjusts to screen size
export function ResponsiveMobileChessBoard() {
  const deviceInfo = useDeviceDetection();
  const { settings } = useDeviceStore();

  // For desktop, just return regular chess board
  if (!deviceInfo.isMobile) {
    return <ChessBoard />;
  }

  const { screenWidth, screenHeight, orientation } = deviceInfo;

  // Calculate optimal size based on viewport
  const getBoardDimensions = () => {
    const headerHeight = 80;  // Mobile header
    const controlsHeight = 80; // Bottom controls
    const padding = 32; // Side padding

    let availableWidth = screenWidth - padding;
    let availableHeight = screenHeight - headerHeight - controlsHeight - padding;

    if (orientation === 'portrait') {
      // In portrait, prioritize width but respect height
      const maxSize = Math.min(availableWidth, availableHeight * 0.8);
      return Math.max(280, Math.min(maxSize, 450));
    } else {
      // In landscape, use available height more aggressively
      const maxSize = Math.min(availableWidth * 0.6, availableHeight);
      return Math.max(280, Math.min(maxSize, 400));
    }
  };

  const boardSize = getBoardDimensions();

  return (
    <div 
      className="responsive-mobile-chess-board flex items-center justify-center w-full h-full"
      style={{
        minHeight: `${boardSize}px`,
        minWidth: `${boardSize}px`
      }}
    >
      <div
        className={cn(
          'chess-board-container',
          'relative',
          'bg-gradient-to-br from-amber-100 to-amber-200',
          'border-4 border-amber-800',
          'rounded-lg shadow-2xl',
          'flex-shrink-0'
        )}
        style={{
          width: `${boardSize}px`,
          height: `${boardSize}px`
        }}
      >
        <ChessBoard />
      </div>
    </div>
  );
}