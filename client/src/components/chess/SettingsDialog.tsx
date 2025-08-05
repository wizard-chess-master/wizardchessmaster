import React from 'react';
import { useAudio } from '../../lib/stores/useAudio';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Volume2, VolumeX, Info, Home } from 'lucide-react';

interface SettingsDialogProps {
  onClose: () => void;
}

export function SettingsDialog({ onClose }: SettingsDialogProps) {
  const { isMuted, toggleMute } = useAudio();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="settings-dialog">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
        </DialogHeader>
        
        <div className="settings-content">
          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                Audio Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="setting-item">
                <div className="setting-info">
                  <label>Sound Effects</label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for moves and captures
                  </p>
                </div>
                <Switch
                  checked={!isMuted}
                  onCheckedChange={toggleMute}
                />
              </div>
            </CardContent>
          </Card>

          {/* Game Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="about-content">
                <div className="info-item">
                  <h4>Fantasy Chess Variant</h4>
                  <p>A magical twist on traditional chess with a larger board and mystical Wizard pieces.</p>
                </div>
                
                <div className="info-item">
                  <h4>Version</h4>
                  <p>1.0.0</p>
                </div>
                
                <div className="info-item">
                  <h4>Features</h4>
                  <ul>
                    <li>10x10 chess board</li>
                    <li>Traditional chess pieces</li>
                    <li>Magical Wizard pieces</li>
                    <li>AI opponents (3 difficulty levels)</li>
                    <li>Local multiplayer</li>
                    <li>Move history and undo</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="shortcuts-list">
                <div className="shortcut-item">
                  <kbd>Ctrl + Z</kbd>
                  <span>Undo move</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Escape</kbd>
                  <span>Deselect piece</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl + M</kbd>
                  <span>Toggle sound</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl + H</kbd>
                  <span>Return to menu</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="settings-footer">
          <Button 
            variant="outline"
            onClick={() => {
              onClose();
              window.location.reload();
            }}
          >
            <Home className="w-4 h-4 mr-2" />
            Main Menu
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
