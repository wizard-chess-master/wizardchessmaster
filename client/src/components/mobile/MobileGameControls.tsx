import React from 'react';
import { useDeviceDetection } from '@/lib/hooks/useDeviceDetection';
import { useDeviceStore } from '@/lib/stores/useDeviceStore';
import { useChess } from '@/lib/stores/useChess';
import { useAudio } from '@/lib/stores/useAudio';
import { Button } from '@/components/ui/button';
import { 
  RotateCcw, 
  Settings, 
  Home, 
  Volume2, 
  VolumeX, 
  Lightbulb, 
  Eye,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileGameControlsProps {
  onSettings: () => void;
  onMenu: () => void;
  onHint?: () => void;
  className?: string;
}

export function MobileGameControls({ onSettings, onMenu, onHint, className }: MobileGameControlsProps) {
  const deviceInfo = useDeviceDetection();
  const { settings } = useDeviceStore();
  const { undoMove, showValidMoves, setShowValidMoves } = useChess();
  const { isMuted, toggleMute } = useAudio();

  if (!deviceInfo.isMobile) return null;

  const buttonSize = deviceInfo.orientation === 'portrait' ? 'sm' : 'xs';
  const iconSize = deviceInfo.orientation === 'portrait' ? 20 : 16;

  return (
    <div 
      className={cn(
        'mobile-game-controls',
        'fixed bottom-0 left-0 right-0',
        'bg-gradient-to-t from-amber-900/95 to-amber-800/95',
        'backdrop-blur-md',
        'border-t-2 border-amber-600',
        'p-4 pb-safe',
        'z-50',
        settings.compactMode && 'py-2',
        className
      )}
    >
      <div className="flex justify-between items-center max-w-md mx-auto gap-2">
        
        {/* Menu Button */}
        <Button
          onClick={onMenu}
          variant="outline"
          size={buttonSize}
          className="flex-1 max-w-[80px] bg-amber-700/80 border-amber-500 text-amber-100 hover:bg-amber-600"
        >
          <Home size={iconSize} />
        </Button>

        {/* Undo Button */}
        <Button
          onClick={undoMove}
          variant="outline"
          size={buttonSize}
          className="flex-1 max-w-[80px] bg-blue-700/80 border-blue-500 text-blue-100 hover:bg-blue-600"
        >
          <RotateCcw size={iconSize} />
        </Button>

        {/* Show Valid Moves Toggle */}
        <Button
          onClick={() => setShowValidMoves(!showValidMoves)}
          variant="outline"
          size={buttonSize}
          className={cn(
            "flex-1 max-w-[80px] border-green-500 text-green-100 hover:bg-green-600",
            showValidMoves ? 'bg-green-600/80' : 'bg-green-700/80'
          )}
        >
          <Eye size={iconSize} />
        </Button>

        {/* Hint Button (if available) */}
        {onHint && (
          <Button
            onClick={onHint}
            variant="outline"
            size={buttonSize}
            className="flex-1 max-w-[80px] bg-purple-700/80 border-purple-500 text-purple-100 hover:bg-purple-600"
          >
            <Lightbulb size={iconSize} />
          </Button>
        )}

        {/* Audio Toggle */}
        <Button
          onClick={toggleMute}
          variant="outline"
          size={buttonSize}
          className="flex-1 max-w-[80px] bg-gray-700/80 border-gray-500 text-gray-100 hover:bg-gray-600"
        >
          {isMuted ? <VolumeX size={iconSize} /> : <Volume2 size={iconSize} />}
        </Button>

        {/* Settings Button */}
        <Button
          onClick={onSettings}
          variant="outline"
          size={buttonSize}
          className="flex-1 max-w-[80px] bg-amber-700/80 border-amber-500 text-amber-100 hover:bg-amber-600"
        >
          <Settings size={iconSize} />
        </Button>
      </div>
    </div>
  );
}

// Mobile menu overlay for additional options
export function MobileMenuOverlay({ isOpen, onClose, onSettings, onAchievements }: {
  isOpen: boolean;
  onClose: () => void;
  onSettings: () => void;
  onAchievements: () => void;
}) {
  const deviceInfo = useDeviceDetection();

  if (!deviceInfo.isMobile || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60" onClick={onClose}>
      <div 
        className="fixed top-0 left-0 right-0 bg-gradient-to-b from-amber-900 to-amber-800 border-b-2 border-amber-600 p-4 pt-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-100">Game Menu</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-amber-100"
          >
            ✕
          </Button>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={() => {
              onSettings();
              onClose();
            }}
            variant="outline"
            className="w-full bg-amber-700/80 border-amber-500 text-amber-100"
          >
            <Settings className="mr-2" size={20} />
            Settings
          </Button>
          
          <Button
            onClick={() => {
              onAchievements();
              onClose();
            }}
            variant="outline"
            className="w-full bg-purple-700/80 border-purple-500 text-purple-100"
          >
            <Lightbulb className="mr-2" size={20} />
            Achievements
          </Button>
        </div>
      </div>
    </div>
  );
}