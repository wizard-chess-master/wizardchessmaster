import React from 'react';
import { useAudio } from '../../lib/stores/useAudio';
import { VolumeControls } from '../audio/VolumeControls';
import { useChess } from '../../lib/stores/useChess';
import { playButtonClickSound } from '../../lib/audio/buttonSounds';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Volume2, VolumeX, Info } from 'lucide-react';

interface SettingsDialogProps {
  onClose: () => void;
}

export function SettingsDialog({ onClose }: SettingsDialogProps) {
  const { isMuted, toggleMute } = useAudio();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Game Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* New Game Audio Controls */}
          <VolumeControls />
          
          {/* Game Settings */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <Info className="w-5 h-5 text-blue-600" />
                Game Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">Hints</span>
                  <span className="text-xs text-gray-600">Enable hint suggestions during gameplay</span>
                </div>
                <Switch 
                  checked={useChess.getState().hintsEnabled}
                  onCheckedChange={() => useChess.getState().toggleHints()}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Game Information */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <Info className="w-5 h-5 text-blue-600" />
                Audio Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="text-sm space-y-2 text-gray-800">
                <p><strong>Sound Effects:</strong> Move sounds, captures, wizard abilities</p>
                <p><strong>Voice Narration:</strong> Game events and guidance</p>
                <p><strong>Music:</strong> Background theme with dynamic intensity</p>
              </div>
              
              <div className="text-xs text-foreground bg-amber-50 border border-amber-200 p-2 rounded">
                <strong>Note:</strong> Audio files load from /assets/ directories. 
                Place your MP3 files in the appropriate folders for full functionality.
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <Info className="w-5 h-5 text-blue-600" />
                Game Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="text-sm">
                <p className="font-medium text-gray-900">Fantasy Chess v1.0</p>
                <p className="text-xs text-gray-700">10x10 board with Wizard pieces</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between">
                  <span className="font-medium">Escape</span>
                  <span className="text-gray-600">Deselect</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Ctrl+Z</span>
                  <span className="text-gray-600">Undo</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Ctrl+M</span>
                  <span className="text-gray-600">Mute</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Ctrl+H</span>
                  <span className="text-gray-600">Menu</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => {
              playButtonClickSound();
              onClose();
              const { resetGame } = useChess.getState();
              resetGame();
            }}
          >
            🏠 Main Menu
          </Button>
          <Button 
            className="flex-1" 
            onClick={() => {
              playButtonClickSound();
              onClose();
            }}
          >
            ✕ Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}