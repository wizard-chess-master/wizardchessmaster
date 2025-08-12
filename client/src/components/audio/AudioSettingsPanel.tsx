/**
 * Audio Settings Panel Component
 * Provides comprehensive audio controls and settings
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Headphones, Music, Mic, Wind, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { audioSettings } from '../../lib/audio/audioSettings';
import { mobileAudioHandler } from '../../lib/audio/mobileAudioHandler';
import { audioDebugger } from '../../lib/audio/audioDebugger';
import { enhancedAudioManager } from '../../lib/audio/enhancedAudioManager';

export function AudioSettingsPanel() {
  const [settings, setSettings] = useState(audioSettings.getSettings());
  const [mobileState, setMobileState] = useState(mobileAudioHandler.getState());
  const [debugMode, setDebugMode] = useState(false);
  const [status, setStatus] = useState(enhancedAudioManager.getStatus());
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    // Listen for settings changes
    const unsubscribeSettings = audioSettings.addListener((newSettings) => {
      setSettings(newSettings);
    });

    // Listen for mobile state changes
    const unsubscribeMobile = mobileAudioHandler.addListener((newState) => {
      setMobileState(newState);
    });

    // Update recommendations
    setRecommendations(audioSettings.getPerformanceRecommendations());

    // Update status periodically
    const interval = setInterval(() => {
      setStatus(enhancedAudioManager.getStatus());
    }, 1000);

    return () => {
      unsubscribeSettings();
      unsubscribeMobile();
      clearInterval(interval);
    };
  }, []);

  const handleVolumeChange = (category: string, value: number[]) => {
    const key = `${category}Volume` as keyof typeof settings;
    audioSettings.updateSettings({ [key]: value[0] });
  };

  const handleToggle = (key: string, value: boolean) => {
    audioSettings.updateSettings({ [key]: value });
  };

  const handleQualityChange = (quality: 'low' | 'medium' | 'high') => {
    audioSettings.updateSettings({ audioQuality: quality });
  };

  const handlePreloadStrategyChange = (strategy: 'none' | 'critical' | 'all') => {
    audioSettings.updateSettings({ preloadStrategy: strategy });
  };

  const toggleDebugMode = () => {
    const newDebugMode = !debugMode;
    setDebugMode(newDebugMode);
    
    if (newDebugMode) {
      audioDebugger.enableDebugMode();
    } else {
      audioDebugger.disableDebugMode();
    }
  };

  const resetSettings = () => {
    audioSettings.resetToDefaults();
  };

  const testAudio = async () => {
    await enhancedAudioManager.playUISound('click');
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Audio Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="volume" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>

          {/* Volume Controls */}
          <TabsContent value="volume" className="space-y-4">
            <div className="space-y-4">
              {/* Master Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="master-volume">Master Volume</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </div>
                <Slider
                  id="master-volume"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[settings.masterVolume]}
                  onValueChange={(value) => handleVolumeChange('master', value)}
                  className="w-full"
                />
              </div>

              {/* Music Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="music-volume" className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Music
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.musicVolume * 100)}%
                  </span>
                </div>
                <Slider
                  id="music-volume"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[settings.musicVolume]}
                  onValueChange={(value) => handleVolumeChange('music', value)}
                  disabled={!settings.enableMusic}
                  className="w-full"
                />
              </div>

              {/* SFX Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sfx-volume" className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Sound Effects
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.sfxVolume * 100)}%
                  </span>
                </div>
                <Slider
                  id="sfx-volume"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[settings.sfxVolume]}
                  onValueChange={(value) => handleVolumeChange('sfx', value)}
                  disabled={!settings.enableSfx}
                  className="w-full"
                />
              </div>

              {/* Voice Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="voice-volume" className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Voice
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.voiceVolume * 100)}%
                  </span>
                </div>
                <Slider
                  id="voice-volume"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[settings.voiceVolume]}
                  onValueChange={(value) => handleVolumeChange('voice', value)}
                  disabled={!settings.enableVoice}
                  className="w-full"
                />
              </div>

              {/* Ambient Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ambient-volume" className="flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    Ambient
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.ambientVolume * 100)}%
                  </span>
                </div>
                <Slider
                  id="ambient-volume"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[settings.ambientVolume]}
                  onValueChange={(value) => handleVolumeChange('ambient', value)}
                  disabled={!settings.enableAmbient}
                  className="w-full"
                />
              </div>

              <Button onClick={testAudio} className="w-full">
                Test Audio
              </Button>
            </div>
          </TabsContent>

          {/* Feature Toggles */}
          <TabsContent value="features" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-music">Background Music</Label>
                <Switch
                  id="enable-music"
                  checked={settings.enableMusic}
                  onCheckedChange={(value) => handleToggle('enableMusic', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-sfx">Sound Effects</Label>
                <Switch
                  id="enable-sfx"
                  checked={settings.enableSfx}
                  onCheckedChange={(value) => handleToggle('enableSfx', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-voice">Voice Acting</Label>
                <Switch
                  id="enable-voice"
                  checked={settings.enableVoice}
                  onCheckedChange={(value) => handleToggle('enableVoice', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-ambient">Ambient Sounds</Label>
                <Switch
                  id="enable-ambient"
                  checked={settings.enableAmbient}
                  onCheckedChange={(value) => handleToggle('enableAmbient', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-3d">3D Spatial Audio</Label>
                <Switch
                  id="enable-3d"
                  checked={settings.enable3DAudio}
                  onCheckedChange={(value) => handleToggle('enable3DAudio', value)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Performance Settings */}
          <TabsContent value="performance" className="space-y-4">
            <div className="space-y-4">
              {/* Audio Quality */}
              <div className="space-y-2">
                <Label>Audio Quality</Label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.audioQuality === 'low' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQualityChange('low')}
                  >
                    Low
                  </Button>
                  <Button
                    variant={settings.audioQuality === 'medium' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQualityChange('medium')}
                  >
                    Medium
                  </Button>
                  <Button
                    variant={settings.audioQuality === 'high' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQualityChange('high')}
                  >
                    High
                  </Button>
                </div>
              </div>

              {/* Preload Strategy */}
              <div className="space-y-2">
                <Label>Preload Strategy</Label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.preloadStrategy === 'none' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePreloadStrategyChange('none')}
                  >
                    None
                  </Button>
                  <Button
                    variant={settings.preloadStrategy === 'critical' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePreloadStrategyChange('critical')}
                  >
                    Critical
                  </Button>
                  <Button
                    variant={settings.preloadStrategy === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePreloadStrategyChange('all')}
                  >
                    All
                  </Button>
                </div>
              </div>

              {/* Max Simultaneous Sounds */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Max Simultaneous Sounds</Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.maxSimultaneousSounds}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  value={[settings.maxSimultaneousSounds]}
                  onValueChange={(value) => 
                    audioSettings.updateSettings({ maxSimultaneousSounds: value[0] })
                  }
                  className="w-full"
                />
              </div>

              {/* Mobile Optimizations */}
              <div className="flex items-center justify-between">
                <Label htmlFor="mobile-opt">Mobile Optimizations</Label>
                <Switch
                  id="mobile-opt"
                  checked={settings.useMobileOptimizations}
                  onCheckedChange={(value) => handleToggle('useMobileOptimizations', value)}
                />
              </div>

              {/* Performance Recommendations */}
              {recommendations.length > 0 && (
                <Alert>
                  <Settings2 className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1">
                      {recommendations.map((rec, index) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* Debug Information */}
          <TabsContent value="debug" className="space-y-4">
            <div className="space-y-4">
              {/* Debug Mode Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="debug-mode">Debug Mode</Label>
                <Switch
                  id="debug-mode"
                  checked={debugMode}
                  onCheckedChange={toggleDebugMode}
                />
              </div>

              {/* Mobile State */}
              <div className="space-y-2">
                <Label>Mobile Audio State</Label>
                <div className="text-sm space-y-1 p-3 bg-muted rounded">
                  <div>Unlocked: {mobileState.isUnlocked ? '✅' : '❌'}</div>
                  <div>Autoplay: {mobileState.canAutoplay ? '✅' : '❌'}</div>
                  <div>User Gesture: {mobileState.hasUserGesture ? '✅' : '❌'}</div>
                  <div>Orientation: {mobileState.orientation}</div>
                  <div>Background: {mobileState.isInBackground ? 'Yes' : 'No'}</div>
                  {mobileState.batteryLevel && (
                    <div>Battery: {Math.round(mobileState.batteryLevel * 100)}%</div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-2">
                <Label>Performance Metrics</Label>
                <div className="text-sm space-y-1 p-3 bg-muted rounded">
                  <div>Cache Hits: {status.performance?.cacheHits || 0}</div>
                  <div>Cache Misses: {status.performance?.cacheMisses || 0}</div>
                  <div>Avg Load Time: {status.performance?.averageLoadTime?.toFixed(2) || '0'}ms</div>
                  <div>Memory Usage: {status.performance?.memoryUsage?.toFixed(2) || '0'}MB</div>
                  <div>Active Nodes: {status.performance?.activeAudioNodes || 0}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => audioDebugger.runFullTest()}
                >
                  Run Tests
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => audioDebugger.clearErrors()}
                >
                  Clear Errors
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSettings}
                >
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}