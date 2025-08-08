/**
 * Accessibility Controls Component
 * Provides UI for managing accessibility features and one-click enable/disable
 */

import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  Type, 
  Contrast, 
  Zap,
  Settings,
  HelpCircle,
  Accessibility,
  Home,
  X
} from 'lucide-react';
import { accessibilityManager } from '../../lib/accessibility/accessibilityManager';
import { useChess } from '../../lib/stores/useChess';

interface AccessibilityControlsProps {
  className?: string;
}

export default function AccessibilityControls({ className }: AccessibilityControlsProps) {
  const [settings, setSettings] = React.useState(accessibilityManager.getSettings());
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    if (!isInitialized) {
      accessibilityManager.initialize();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const updateSetting = <K extends keyof typeof settings>(
    key: K, 
    value: typeof settings[K]
  ) => {
    accessibilityManager.updateSetting(key, value);
    setSettings(accessibilityManager.getSettings());
  };

  const handleOneClickEnable = () => {
    accessibilityManager.enableAccessibilityMode();
    setSettings(accessibilityManager.getSettings());
  };

  const handleOneClickDisable = () => {
    accessibilityManager.disableAccessibilityMode();
    setSettings(accessibilityManager.getSettings());
    
    // Announce deactivation
    accessibilityManager.announceGameState({
      type: 'game',
      message: 'Accessibility mode has been deactivated. Visual and audio assistance features are now turned off.',
      priority: 'high'
    });
  };

  const handleReturnToMenu = () => {
    // Announce navigation first
    accessibilityManager.announceGameState({
      type: 'game', 
      message: 'Returning to main menu. Chess game has been reset.',
      priority: 'high'
    });
    
    // Reset game and return to menu
    setTimeout(() => {
      const { resetGame } = useChess.getState();
      resetGame();
      window.location.reload(); // Forces complete return to main menu
    }, 1000); // Give time for announcement
  };

  const announceHelp = () => {
    const helpText = `Accessibility features available: 
    Screen reader support for piece positions and moves, 
    Audio announcements for all game actions, 
    High contrast visual mode, 
    Large text for better readability, 
    Full keyboard navigation support, 
    Voice guidance for available moves, 
    Reduced motion for sensitive users, 
    Complete audio descriptions of game state.`;
    
    accessibilityManager.announceGameState({
      type: 'move',
      message: helpText,
      priority: 'high'
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-blue-600" />
          Accessibility Features
          {settings.enabled && (
            <Badge variant="default" className="bg-green-600">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* One-Click Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Quick Setup</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={announceHelp}
              className="text-xs"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              Help
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={handleOneClickEnable}
              disabled={settings.enabled}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Enable All Accessibility Features
            </Button>
            
            <Button
              onClick={handleOneClickDisable}
              disabled={!settings.enabled}
              variant="outline"
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Turn Off Accessibility Mode
            </Button>

            <Separator className="my-2" />

            <Button
              onClick={handleReturnToMenu}
              variant="outline"
              className="w-full bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Main Menu
            </Button>
          </div>
        </div>

        <Separator />

        {/* Individual Controls */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Individual Settings</h3>
          
          <ScrollArea className="h-64">
            <div className="space-y-4 pr-4">
              {/* Screen Reader Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Screen Reader Mode</p>
                    <p className="text-xs text-gray-600">Enhanced screen reader support</p>
                  </div>
                </div>
                <Switch
                  checked={settings.screenReaderMode}
                  onCheckedChange={(checked) => updateSetting('screenReaderMode', checked)}
                />
              </div>

              {/* Audio Announcements */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Audio Announcements</p>
                    <p className="text-xs text-gray-600">Spoken game state updates</p>
                  </div>
                </div>
                <Switch
                  checked={settings.audioAnnouncements}
                  onCheckedChange={(checked) => updateSetting('audioAnnouncements', checked)}
                />
              </div>

              {/* High Contrast Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Contrast className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="font-medium text-sm">High Contrast Mode</p>
                    <p className="text-xs text-gray-600">Enhanced visual contrast</p>
                  </div>
                </div>
                <Switch
                  checked={settings.highContrastMode}
                  onCheckedChange={(checked) => updateSetting('highContrastMode', checked)}
                />
              </div>

              {/* Large Text */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="font-medium text-sm">Large Text</p>
                    <p className="text-xs text-gray-600">Increased text size</p>
                  </div>
                </div>
                <Switch
                  checked={settings.largeText}
                  onCheckedChange={(checked) => updateSetting('largeText', checked)}
                />
              </div>

              {/* Keyboard Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="font-medium text-sm">Keyboard Navigation</p>
                    <p className="text-xs text-gray-600">Full keyboard control</p>
                  </div>
                </div>
                <Switch
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                />
              </div>

              {/* Voice Guidance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-teal-600" />
                  <div>
                    <p className="font-medium text-sm">Voice Guidance</p>
                    <p className="text-xs text-gray-600">Spoken move suggestions</p>
                  </div>
                </div>
                <Switch
                  checked={settings.voiceGuidance}
                  onCheckedChange={(checked) => updateSetting('voiceGuidance', checked)}
                />
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">Reduced Motion</p>
                    <p className="text-xs text-gray-600">Minimize animations</p>
                  </div>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                />
              </div>

              {/* Audio Descriptions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-pink-600" />
                  <div>
                    <p className="font-medium text-sm">Audio Descriptions</p>
                    <p className="text-xs text-gray-600">Detailed board descriptions</p>
                  </div>
                </div>
                <Switch
                  checked={settings.audioDescriptions}
                  onCheckedChange={(checked) => updateSetting('audioDescriptions', checked)}
                />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Status Info */}
        {settings.enabled && (
          <>
            <Separator />
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Accessibility className="w-4 h-4 text-green-600" />
                <p className="font-medium text-sm text-green-800">Accessibility Mode Active</p>
              </div>
              <p className="text-xs text-green-700">
                All features are enabled for optimal vision-impaired player experience.
                Use Ctrl+H for keyboard shortcuts help.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}