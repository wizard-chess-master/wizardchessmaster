import React from 'react';
import { Volume2, VolumeX, Music, Volume1 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { gameAudioManager } from '../../lib/audio/gameAudioManager';

interface VolumeControlsProps {
  className?: string;
}

export function VolumeControls({ className }: VolumeControlsProps) {
  const [settings, setSettings] = React.useState(gameAudioManager.getSettings());

  const updateSettings = React.useCallback((newSettings: any) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    gameAudioManager.updateSettings(updated);
  }, [settings]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Audio Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Master Volume</label>
            <span className="text-xs text-gray-500">{Math.round(settings.masterVolume * 100)}%</span>
          </div>
          <Slider
            value={[settings.masterVolume]}
            onValueChange={([value]) => updateSettings({ masterVolume: value })}
            max={1}
            min={0}
            step={0.05}
            className="w-full"
          />
        </div>

        {/* Sound Effects */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume1 className="w-4 h-4" />
              <span className="text-sm font-medium">Sound Effects</span>
            </div>
            <Switch
              checked={settings.sfxEnabled}
              onCheckedChange={(enabled) => updateSettings({ sfxEnabled: enabled })}
            />
          </div>
          <div className="ml-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Volume</span>
              <span className="text-xs text-gray-500">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <Slider
              value={[settings.sfxVolume]}
              onValueChange={([value]) => updateSettings({ sfxVolume: value })}
              max={1}
              min={0}
              step={0.05}
              disabled={!settings.sfxEnabled}
              className="w-full"
            />
          </div>
        </div>

        {/* Voice */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span className="text-sm font-medium">Voice</span>
            </div>
            <Switch
              checked={settings.voiceEnabled}
              onCheckedChange={(enabled) => updateSettings({ voiceEnabled: enabled })}
            />
          </div>
          <div className="ml-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Volume</span>
              <span className="text-xs text-gray-500">{Math.round(settings.voiceVolume * 100)}%</span>
            </div>
            <Slider
              value={[settings.voiceVolume]}
              onValueChange={([value]) => updateSettings({ voiceVolume: value })}
              max={1}
              min={0}
              step={0.05}
              disabled={!settings.voiceEnabled}
              className="w-full"
            />
          </div>
        </div>

        {/* Music */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              <span className="text-sm font-medium">Music</span>
            </div>
            <Switch
              checked={settings.musicEnabled}
              onCheckedChange={(enabled) => updateSettings({ musicEnabled: enabled })}
            />
          </div>
          <div className="ml-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Volume</span>
              <span className="text-xs text-gray-500">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <Slider
              value={[settings.musicVolume]}
              onValueChange={([value]) => updateSettings({ musicVolume: value })}
              max={1}
              min={0}
              step={0.05}
              disabled={!settings.musicEnabled}
              className="w-full"
            />
          </div>
        </div>

        {/* Test Buttons */}
        <div className="pt-4 border-t space-y-2">
          <p className="text-sm font-medium">Test Audio</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => gameAudioManager.onButtonClick()}
              className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded border"
            >
              Button Click
            </button>
            <button
              onClick={() => gameAudioManager.onPieceMove()}
              className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 rounded border"
            >
              Move Sound
            </button>
            <button
              onClick={() => gameAudioManager.onVictory()}
              className="px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded border"
            >
              Victory
            </button>
            <button
              onClick={() => gameAudioManager.playMusic('theme_music')}
              className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 rounded border"
            >
              Play Music
            </button>
            <button
              onClick={() => gameAudioManager.stopMusic()}
              className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 rounded border"
            >
              Stop Music
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}