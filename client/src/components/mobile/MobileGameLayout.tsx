import React, { useState } from 'react';
import { useDeviceDetection } from '@/lib/hooks/useDeviceDetection';
import { useDeviceStore } from '@/lib/stores/useDeviceStore';
import { useChess } from '@/lib/stores/useChess';
import { ResponsiveMobileChessBoard } from './MobileChessBoardWrapper';
import { MobileGameControls, MobileMenuOverlay } from './MobileGameControls';
import { MobileSettingsDialog, MobileSettingsQuickAccess } from './MobileSettingsDialog';
import { GameUI } from '@/components/chess/GameUI';
import { cn } from '@/lib/utils';

interface MobileGameLayoutProps {
  onSettings?: () => void;
  onAchievements?: () => void;
  onMenu?: () => void;
  children?: React.ReactNode;
}

export function MobileGameLayout({ 
  onSettings, 
  onAchievements, 
  onMenu,
  children 
}: MobileGameLayoutProps) {
  const deviceInfo = useDeviceDetection();
  const { settings } = useDeviceStore();
  const { gamePhase } = useChess();
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  // Only render for mobile devices
  if (!deviceInfo.isMobile) {
    return <>{children}</>;
  }

  const isPortrait = deviceInfo.orientation === 'portrait';
  const isPlaying = gamePhase === 'playing' || gamePhase === 'ended';

  return (
    <div 
      className={cn(
        'mobile-game-layout',
        'min-h-screen w-full',
        'bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900',
        'relative overflow-hidden',
        settings.compactMode && 'compact-mobile-layout'
      )}
    >
      {/* Mobile Game Header */}
      {isPlaying && (
        <div className="mobile-game-header fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-amber-900/95 to-transparent backdrop-blur-md pt-safe">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-amber-100">Wizard Chess</h1>
              <div className="text-xs text-amber-200 capitalize">
                {gamePhase}
              </div>
            </div>
            
            {!settings.hideNonEssentialUI && (
              <MobileSettingsQuickAccess />
            )}
          </div>
        </div>
      )}

      {/* Main Game Content */}
      <div 
        className={cn(
          'mobile-game-content',
          'flex flex-col',
          'min-h-screen',
          isPlaying && 'pt-20 pb-20', // Account for header and controls
          isPortrait ? 'portrait-layout' : 'landscape-layout'
        )}
      >
        
        {isPortrait ? (
          // Portrait Layout
          <div className="flex flex-col items-center justify-center flex-1 p-4 space-y-2 min-h-0">
            
            {/* Game Info at top - compact */}
            {!settings.hideNonEssentialUI && (
              <div className="w-full max-w-md flex-shrink-0">
                <GameUI compact />
              </div>
            )}
            
            {/* Chess Board in center - takes remaining space */}
            <div className="flex-1 flex items-center justify-center min-h-0 w-full">
              <ResponsiveMobileChessBoard />
            </div>
            
          </div>
        ) : (
          // Landscape Layout
          <div className="flex items-center justify-center flex-1 p-2 gap-2 min-h-0">
            
            {/* Chess Board on left/center */}
            <div className="flex-shrink-0 h-full flex items-center justify-center">
              <ResponsiveMobileChessBoard />
            </div>
            
            {/* Game Info on right */}
            {!settings.hideNonEssentialUI && (
              <div className="flex-1 max-w-xs h-full overflow-y-auto">
                <GameUI compact />
              </div>
            )}
            
          </div>
        )}

        {/* Render children if not in playing mode */}
        {!isPlaying && children}
      </div>

      {/* Mobile Controls (bottom bar) */}
      {isPlaying && (
        <MobileGameControls
          onSettings={() => setShowMobileSettings(true)}
          onMenu={() => setShowMobileMenu(true)}
          onHint={() => {
            // Trigger hint system
            const event = new CustomEvent('requestHint', { 
              detail: { source: 'mobile-controls' } 
            });
            window.dispatchEvent(event);
          }}
        />
      )}

      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onSettings={() => {
          setShowMobileSettings(true);
          setShowMobileMenu(false);
        }}
        onAchievements={() => {
          onAchievements?.();
          setShowMobileMenu(false);
        }}
      />

      {/* Mobile Settings Dialog */}
      <MobileSettingsDialog
        isOpen={showMobileSettings}
        onClose={() => setShowMobileSettings(false)}
      />

      {/* Mobile-specific CSS variables and styles */}
      <style jsx>{`
        .compact-mobile-layout .mobile-game-header {
          padding: 8px 16px;
        }
        
        .compact-mobile-layout .mobile-game-content {
          padding-top: 60px;
        }
        
        .portrait-layout .mobile-chess-board-container {
          width: 100%;
          max-width: min(100vw - 32px, 90vh - 200px);
        }
        
        .landscape-layout .mobile-chess-board-container {
          width: auto;
          max-width: min(70vw, 100vh - 80px);
        }
        
        @media (max-height: 600px) {
          .landscape-layout .mobile-game-content {
            padding-top: 60px;
            padding-bottom: 60px;
          }
        }
      `}</style>
    </div>
  );
}

// Mobile-optimized component wrapper
export function withMobileLayout<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  layoutProps?: Partial<MobileGameLayoutProps>
) {
  return function MobileWrappedComponent(props: P) {
    const deviceInfo = useDeviceDetection();
    
    if (!deviceInfo.isMobile) {
      return <WrappedComponent {...props} />;
    }
    
    return (
      <MobileGameLayout {...layoutProps}>
        <WrappedComponent {...props} />
      </MobileGameLayout>
    );
  };
}