/**
 * Theme Music Toggle Component
 * Provides user control for the background theme music
 */

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Music, VolumeX } from 'lucide-react';
import { useAudio } from '@/lib/stores/useAudio';

export function ThemeMusicToggle() {
  const { 
    isThemeMusicEnabled, 
    isMuted, 
    themeVolume,
    toggleThemeMusic, 
    setThemeVolume,
    initializeThemeMusic,
    themeMusic 
  } = useAudio();

  // Initialize theme music on component mount
  useEffect(() => {
    if (!themeMusic) {
      initializeThemeMusic();
    }
  }, [themeMusic, initializeThemeMusic]);

  return (
    <Card className="medieval-panel bg-gradient-to-br from-amber-900/20 to-orange-800/30 border border-amber-600/50">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-200">
              Theme Music
            </span>
          </div>
          
          <Button
            variant="outline" 
            size="sm"
            onClick={toggleThemeMusic}
            disabled={isMuted}
            className={`
              h-8 px-3 text-xs medieval-button transition-all duration-200
              ${isThemeMusicEnabled && !isMuted 
                ? 'bg-amber-600/80 text-amber-100 border-amber-500' 
                : 'bg-stone-600/50 text-stone-300 border-stone-500'
              }
              hover:scale-105 active:scale-95
            `}
          >
            {isMuted ? (
              <VolumeX className="w-3 h-3" />
            ) : (
              isThemeMusicEnabled ? 'ON' : 'OFF'
            )}
          </Button>
        </div>

        {/* Volume Slider - only show when theme music is enabled and not muted */}
        {isThemeMusicEnabled && !isMuted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-300">Volume</span>
              <span className="text-amber-200">{Math.round(themeVolume * 100)}%</span>
            </div>
            <Slider
              value={[themeVolume]}
              onValueChange={(value) => setThemeVolume(value[0])}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>
        )}

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div 
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${isThemeMusicEnabled && !isMuted 
                ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse' 
                : 'bg-red-500/60'
              }
            `}
          />
          <span className="text-xs text-stone-400">
            {isMuted 
              ? 'System Muted' 
              : isThemeMusicEnabled 
                ? 'Playing' 
                : 'Stopped'
            }
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default ThemeMusicToggle;