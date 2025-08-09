import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { 
  Volume2, 
  VolumeX, 
  Settings, 
  Brain, 
  Gamepad2, 
  Info,
  X 
} from 'lucide-react';
import { useAudio } from '../../lib/stores/useAudio';
import { HintLearningSettings } from '../hints/HintLearningSettings';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { isMuted, toggleMute } = useAudio();
  const [volume, setVolume] = useState(50);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto medieval-panel">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 medieval-text">
            <Settings className="w-5 h-5" />
            Game Settings
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        <Tabs defaultValue="audio" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="hints" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Hint Learning
            </TabsTrigger>
            <TabsTrigger value="gameplay" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Gameplay
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              About
            </TabsTrigger>
          </TabsList>

          {/* Audio Settings */}
          <TabsContent value="audio" className="space-y-6">
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-amber-600" />
                  Audio Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Master Volume */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Master Volume</span>
                    <Badge variant="outline">{volume}%</Badge>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Mute Toggle */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      Audio Enabled
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable all game audio including music and sound effects
                    </p>
                  </div>
                  <Switch
                    checked={!isMuted}
                    onCheckedChange={toggleMute}
                  />
                </div>

                {/* Audio Information */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <strong>Audio Features:</strong>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>Medieval theme music with dynamic volume control</li>
                        <li>Sound effects for moves, captures, and wizard abilities</li>
                        <li>Voice narration for game events and hints</li>
                        <li>Button click feedback for enhanced user experience</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hint Learning Settings */}
          <TabsContent value="hints" className="space-y-6">
            <HintLearningSettings />
          </TabsContent>

          {/* Gameplay Settings */}
          <TabsContent value="gameplay" className="space-y-6">
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-green-600" />
                  Gameplay Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-2">Game Rules</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 10x10 board with traditional chess pieces plus wizards</li>
                    <li>• Wizards can teleport within 2 squares or attack at range</li>
                    <li>• All standard chess rules apply with wizard variations</li>
                  </ul>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">H</kbd> Get Hint</div>
                    <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">U</kbd> Undo Move</div>
                    <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">R</kbd> Reset Game</div>
                    <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">M</kbd> Toggle Music</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About/Info */}
          <TabsContent value="info" className="space-y-6">
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-purple-600" />
                  About Wizard Chess Duel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-2">Game Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Advanced AI with multiple difficulty levels</li>
                    <li>• Personalized hint learning system</li>
                    <li>• Campaign mode with progressive challenges</li>
                    <li>• Achievement system with celebrations</li>
                    <li>• Immersive medieval fantasy theme</li>
                  </ul>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-2">Personalized Learning</h4>
                  <p className="text-sm text-muted-foreground">
                    The AI mentor "Merlin the Wise" learns from your playing style and 
                    adapts hints to match your preferences. The more you play, the better 
                    the hints become!
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-2">Version Information</h4>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Version:</strong> 2.0.0</p>
                    <p><strong>Features:</strong> Personalized Hint Learning, Achievement Celebrations</p>
                    <p><strong>AI Engine:</strong> Minimax with Neural Network Learning</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="medieval-btn">
            <X className="w-4 h-4 mr-2" />
            Close Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}