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
    <Card className="border border-gray-200 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
          {isMuted ? <VolumeX className="w-5 h-5 text-red-600" /> : <Volume2 className="w-5 h-5 text-blue-600" />}
          Wizard Chess Audio
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900">Master Volume</label>
            <p className="text-xs text-gray-600">
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
                <label className="text-sm font-medium text-gray-900">Volume Level</label>
                <span className="text-sm text-gray-700 font-medium">{Math.round(volume * 100)}%</span>
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
              className="w-full text-sm py-2 px-3 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium transition-colors"
            >
              Test Audio
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}