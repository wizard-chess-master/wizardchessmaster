import React from 'react';
import { useAudio } from '../../lib/stores/useAudio';
import { VolumeControls } from '../audio/VolumeControls';
import { useChess } from '../../lib/stores/useChess';
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
  const { isMuted, toggleMute, isAmbientEnabled, toggleAmbient, currentIntensity } = useAudio();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto max-w-md">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* New Game Audio Controls */}
          <VolumeControls />
          
          {/* Legacy Audio Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                Legacy Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Legacy Sound Effects</label>
                  <p className="text-xs text-muted-foreground">
                    Legacy audio system (use new controls above)
                  </p>
                </div>
                <Switch
                  checked={!isMuted}
                  onCheckedChange={toggleMute}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Legacy Ambient Sounds</label>
                  <p className="text-xs text-muted-foreground">
                    Legacy dynamic background music
                  </p>
                </div>
                <Switch
                  checked={isAmbientEnabled}
                  onCheckedChange={toggleAmbient}
                />
              </div>
              
              {isAmbientEnabled && (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Current Intensity</label>
                    <p className="text-xs text-muted-foreground">
                      Auto-adjusts based on game state
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {currentIntensity}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="w-5 h-5" />
                Game Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="text-sm">
                <p className="font-medium">Fantasy Chess v1.0</p>
                <p className="text-xs text-muted-foreground">10x10 board with Wizard pieces</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between">
                  <span>Escape</span>
                  <span className="text-muted-foreground">Deselect</span>
                </div>
                <div className="flex justify-between">
                  <span>Ctrl+Z</span>
                  <span className="text-muted-foreground">Undo</span>
                </div>
                <div className="flex justify-between">
                  <span>Ctrl+M</span>
                  <span className="text-muted-foreground">Mute</span>
                </div>
                <div className="flex justify-between">
                  <span>Ctrl+H</span>
                  <span className="text-muted-foreground">Menu</span>
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
              onClose();
              const { resetGame } = useChess.getState();
              resetGame();
            }}
          >
            🏠 Main Menu
          </Button>
          <Button 
            className="flex-1" 
            onClick={onClose}
          >
            ✕ Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}