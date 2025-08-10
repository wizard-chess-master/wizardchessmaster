import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { ChevronDown, Settings, ChevronUp } from 'lucide-react';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';
// import { GameHints } from './GameHints';
import { AdBanner } from '../monetization/AdBanner';
// import { useAmbientSound } from '../../lib/stores/useAmbientSound';
// import type { GameIntensity } from '../../lib/stores/useAmbientSound';

type GameIntensity = 'calm' | 'moderate' | 'tense' | 'critical';

interface GameUIProps {
  onSettings: () => void;
}

export function GameUI({ onSettings }: GameUIProps) {
  const { 
    currentPlayer, 
    moveHistory, 
    isInCheck, 
    gameMode,
    resetGame 
  } = useChess();
  
  const { isMuted } = useAudio();
  
  // const { isEnabled: isAmbientEnabled, currentIntensity } = useAmbientSound();
  const isAmbientEnabled = false;
  const currentIntensity: GameIntensity = 'calm';
  const [showControls, setShowControls] = useState(false);

  const getCurrentPlayerDisplay = () => {
    return currentPlayer === 'white' ? '🤍 White to move' : '⚫ Black to move';
  };

  const getGameModeDisplay = () => {
    switch(gameMode) {
      case 'local': return 'Local PvP';
      case 'ai': return 'vs AI';
      case 'ai-vs-ai': return 'AI vs AI';
      default: return 'Chess';
    }
  };

  const getIntensityColor = (intensity: GameIntensity) => {
    const colors: Record<GameIntensity, string> = {
      calm: 'bg-blue-500',
      moderate: 'bg-yellow-500',
      tense: 'bg-orange-500',
      critical: 'bg-red-500'
    };
    return colors[intensity];
  };

  const getIntensityIcon = (intensity: GameIntensity) => {
    const icons: Record<GameIntensity, string> = {
      calm: '🌙',
      moderate: '⚡',
      tense: '🔥',
      critical: '⚔️'
    };
    return icons[intensity];
  };

  return (
    <div className="game-ui w-full">
      {/* Mobile Top Ad Banner - Hidden on Desktop */}
      <AdBanner 
        className="mb-3 lg:hidden"
        style={{ maxWidth: '400px', width: '100%' }}
      />

      {/* Game Info Layout - Status and History */}
      <div className="game-info-grid grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          
          {/* Game Status Card */}
          <Card className="medieval-panel game-status w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between medieval-text text-sm">
                <span>🏰 Fantasy Chess</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{getGameModeDisplay()}</Badge>
                  {isAmbientEnabled && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs capitalize ${getIntensityColor(currentIntensity)} text-white border-transparent`}
                    >
                      {getIntensityIcon(currentIntensity)} {currentIntensity}
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="status-info flex items-center justify-between">
                <div className="current-player">
                  <span className={`player-indicator ${currentPlayer} medieval-text text-sm font-medium`}>
                    {getCurrentPlayerDisplay()}
                  </span>
                  {isInCheck && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      ⚠️ Check!
                    </Badge>
                  )}
                </div>
                <div className="move-count medieval-text text-sm text-muted-foreground">
                  Move: {Math.floor(moveHistory.length / 2) + 1}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Move History */}
          <Card className="medieval-panel move-history w-full">
            <CardHeader className="pb-3">
              <CardTitle className="medieval-text text-sm">📜 Move History</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="move-list max-h-32 overflow-y-auto">
                {moveHistory.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No moves yet</p>
                ) : (
                  <div className="space-y-1">
                    {moveHistory.slice(-8).map((move, index) => (
                      <div key={index} className="text-xs flex justify-between items-center py-1">
                        <span className="font-mono">
                          {Math.floor((moveHistory.length - 8 + index) / 2) + 1}.
                          {((moveHistory.length - 8 + index) % 2 === 0) ? ' ' : '.. '}
                          {String.fromCharCode(97 + move.from.col)}{10 - move.from.row}→
                          {String.fromCharCode(97 + move.to.col)}{10 - move.to.row}
                        </span>
                        <span className="text-gray-400">{move.piece.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts - Collapsible */}
          <div className="md:col-span-3">
            <Collapsible open={showControls} onOpenChange={setShowControls}>
              <Card className="medieval-panel w-full">
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-white/5 transition-colors">
                    <CardTitle className="medieval-text text-sm flex items-center justify-between">
                      ⌨️ Keyboard Shortcuts
                      {showControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-xs">
                      <div className="control-item flex justify-between">
                        <span className="control-key font-mono">Mouse Click</span>
                        <span>Select piece / Make move</span>
                      </div>
                      
                      <div className="control-item flex justify-between">
                        <span className="control-key font-mono">Ctrl+Z</span>
                        <span>Undo last move</span>
                      </div>
                      
                      <div className="control-item flex justify-between">
                        <span className="control-key font-mono">Escape</span>
                        <span>Deselect piece</span>
                      </div>
                      
                      <div className="control-item flex justify-between">
                        <span className="control-key font-mono">Ctrl+M</span>
                        <span>Toggle sound</span>
                      </div>
                      
                      <div className="control-item flex justify-between">
                        <span className="control-key font-mono">Ctrl+H</span>
                        <span>Return to menu</span>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        
      </div>
    </div>
  );
}