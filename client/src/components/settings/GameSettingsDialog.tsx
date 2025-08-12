import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  Volume2, 
  VolumeX, 
  MessageSquare,
  Brain,
  Music,
  Gamepad2,
  Settings,
  X
} from 'lucide-react';
import { useAudio } from '../../lib/stores/useAudio';
import { useDynamicAIMentor } from '../../lib/stores/useDynamicAIMentor';
import { wizardChessAudio } from '../../lib/audio/audioManager';

interface GameSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GameSettingsDialog({ isOpen, onClose }: GameSettingsDialogProps) {
  const { isMuted, volume, toggleMute, setVolume } = useAudio();
  const { isActive: coachActive, activateMentor, deactivateMentor } = useDynamicAIMentor();
  const [coachVoiceEnabled, setCoachVoiceEnabled] = React.useState(() => {
    return localStorage.getItem('coachVoiceEnabled') !== 'false';
  });
  
  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
  };
  
  const toggleCoach = () => {
    if (coachActive) {
      deactivateMentor();
    } else {
      activateMentor();
    }
  };
  
  const toggleCoachVoice = () => {
    const newState = !coachVoiceEnabled;
    setCoachVoiceEnabled(newState);
    localStorage.setItem('coachVoiceEnabled', String(newState));
    // This setting will be checked by the mentor when it speaks
  };
  
  const testSound = () => {
    wizardChessAudio.onButtonClick();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Settings className="w-5 h-5" />
            Game Settings
          </DialogTitle>
          <DialogDescription>
            Configure your game audio and AI coach preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Audio Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Audio Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Master Volume Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="master-volume">Master Volume</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable all game audio
                  </p>
                </div>
                <Switch
                  id="master-volume"
                  checked={!isMuted}
                  onCheckedChange={toggleMute}
                />
              </div>
              
              {/* Volume Slider */}
              {!isMuted && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Volume Level</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(volume * 100)}%
                    </span>
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
              )}
              
              {/* Test Audio Button */}
              {!isMuted && (
                <Button
                  onClick={testSound}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Test Audio
                </Button>
              )}
              
              {/* Individual Sound Toggles */}
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <Label htmlFor="theme-music">Theme Music</Label>
                  </div>
                  <Switch
                    id="theme-music"
                    checked={!isMuted}
                    disabled={isMuted}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    <Label htmlFor="sound-effects">Sound Effects</Label>
                  </div>
                  <Switch
                    id="sound-effects"
                    checked={!isMuted}
                    disabled={isMuted}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Coach Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Coach Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coach Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="coach-enabled">{coachActive ? 'AI Coach Active' : 'Enable AI Coach'}</Label>
                  <p className="text-xs text-muted-foreground">
                    {coachActive ? 'Coach is providing guidance' : 'Get helpful tips and analysis during gameplay'}
                  </p>
                </div>
                <Switch
                  id="coach-enabled"
                  checked={coachActive}
                  onCheckedChange={toggleCoach}
                />
              </div>
              
              {coachActive && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <Label htmlFor="coach-voice">Voice Commentary</Label>
                      </div>
                      <Switch
                        id="coach-voice"
                        checked={coachVoiceEnabled}
                        onCheckedChange={toggleCoachVoice}
                      />
                    </div>
                    
                    <p className="text-xs text-muted-foreground italic">
                      The AI coach will provide occasional feedback on important moves and game transitions.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Close Button */}
          <Button 
            onClick={onClose} 
            className="w-full"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}