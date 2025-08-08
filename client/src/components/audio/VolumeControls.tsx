import React from 'react';
import { useAudio } from '../../lib/stores/useAudio';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Volume2, VolumeX } from 'lucide-react';
import { wizardChessAudio } from '../../lib/audio/audioManager';

export function VolumeControls() {
  const { isMuted, volume, toggleMute, setVolume } = useAudio();

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
  };

  const testSound = () => {
    wizardChessAudio.onButtonClick();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          Wizard Chess Audio
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium">Master Volume</label>
            <p className="text-xs text-muted-foreground">
              Controls all game audio
            </p>
          </div>
          <Switch
            checked={!isMuted}
            onCheckedChange={toggleMute}
          />
        </div>
        
        {!isMuted && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Volume Level</label>
                <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
            
            <button
              onClick={testSound}
              className="w-full text-sm py-2 px-3 rounded bg-secondary hover:bg-secondary/80 transition-colors"
            >
              Test Audio
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}