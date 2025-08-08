/**
 * Voice Toggle Component
 * Provides user control for the wizard voice system
 */

import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Play, Mic } from 'lucide-react';
import { wizardVoiceSystem, type WizardVoiceClip } from '@/lib/audio/wizardVoiceSystem';

export function VoiceToggle() {
  const [voiceState, setVoiceState] = useState(wizardVoiceSystem.getState());
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    // Initialize voice system if not already done
    if (!voiceState.isInitialized) {
      wizardVoiceSystem.initialize();
    }

    // Update state periodically
    const interval = setInterval(() => {
      setVoiceState(wizardVoiceSystem.getState());
    }, 1000);

    return () => clearInterval(interval);
  }, [voiceState.isInitialized]);

  const handleToggleVoice = (enabled: boolean) => {
    wizardVoiceSystem.setEnabled(enabled);
    setVoiceState(wizardVoiceSystem.getState());
  };

  const handleVolumeChange = (value: number[]) => {
    const volume = value[0] / 100;
    wizardVoiceSystem.setVolume(volume);
    setVoiceState(wizardVoiceSystem.getState());
  };

  const handleTestVoice = async (clipId: WizardVoiceClip) => {
    await wizardVoiceSystem.testVoice(clipId);
  };

  return (
    <div className="relative">
      {/* Main Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowControls(!showControls)}
        className="flex items-center gap-2"
      >
        {voiceState.isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        Voice
        {voiceState.currentlyPlaying && (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        )}
      </Button>

      {/* Voice Controls Panel */}
      {showControls && (
        <Card className="absolute top-full right-0 mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Voice Controls
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enable Voice</span>
              <Switch
                checked={voiceState.isEnabled}
                onCheckedChange={handleToggleVoice}
              />
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Volume</span>
                <span className="text-xs text-gray-500">
                  {Math.round(voiceState.volume * 100)}%
                </span>
              </div>
              <Slider
                value={[voiceState.volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                min={0}
                step={5}
                disabled={!voiceState.isEnabled}
                className="w-full"
              />
            </div>

            {/* Status Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={voiceState.isEnabled ? 'text-green-600' : 'text-red-600'}>
                  {voiceState.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Queue:</span>
                <span>{voiceState.queueLength} clips</span>
              </div>
              {voiceState.currentlyPlaying && (
                <div className="flex justify-between">
                  <span>Playing:</span>
                  <span className="text-green-600 font-medium">
                    {voiceState.currentlyPlaying.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>

            {/* Test Buttons */}
            <div className="border-t pt-3">
              <div className="text-xs font-medium mb-2">Test Voice Clips:</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestVoice('greeting')}
                  disabled={!voiceState.isEnabled}
                  className="text-xs"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Greeting
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestVoice('good_move')}
                  disabled={!voiceState.isEnabled}
                  className="text-xs"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Good Move
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestVoice('wizard_attack')}
                  disabled={!voiceState.isEnabled}
                  className="text-xs"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Attack
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestVoice('hint')}
                  disabled={!voiceState.isEnabled}
                  className="text-xs"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Hint
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default VoiceToggle;