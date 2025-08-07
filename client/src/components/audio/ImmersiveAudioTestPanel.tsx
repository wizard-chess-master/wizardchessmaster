/**
 * Immersive Audio Test Panel Component
 * Tests the new 3D audio system with chess-specific sounds
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { immersiveAudio } from '@/lib/audio/immersiveAudioSystem';
import { MAGICAL_SOUND_LIBRARY, getSoundsByCategory, type MagicalSoundCategory } from '@/lib/audio/magicalSoundLibrary_fixed';

export function ImmersiveAudioTestPanel() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [masterVolume, setMasterVolume] = useState([0.7]);
  const [musicVolume, setMusicVolume] = useState([0.3]);
  const [effectsVolume, setEffectsVolume] = useState([0.8]);
  const [activeTab, setActiveTab] = useState('test');
  const [testPosition] = useState({ x: 4, y: 4 }); // Center of chess board

  useEffect(() => {
    // Initialize the audio system
    const initAudio = async () => {
      try {
        await immersiveAudio.initialize();
        setIsInitialized(true);
        console.log('✅ Immersive Audio System initialized');
      } catch (error) {
        console.warn('⚠️ Audio initialization failed:', error);
      }
    };

    initAudio();

    return () => {
      immersiveAudio.dispose();
    };
  }, []);

  const handleVolumeChange = (type: 'master' | 'music' | 'effects', values: number[]) => {
    const volume = values[0];
    
    switch (type) {
      case 'master':
        setMasterVolume(values);
        immersiveAudio.setMasterVolume(volume);
        break;
      case 'music':
        setMusicVolume(values);
        immersiveAudio.setMusicVolume(volume);
        break;
      case 'effects':
        setEffectsVolume(values);
        immersiveAudio.setEffectsVolume(volume);
        break;
    }
  };

  const testChessMove = (pieceType: string) => {
    const from = { x: 3, y: 3 };
    const to = { x: 5, y: 5 };
    immersiveAudio.playPieceMove(from, to, pieceType);
  };

  const testCapture = (isWizard: boolean = false) => {
    immersiveAudio.playPieceCapture(testPosition, isWizard);
  };

  const testWizardAbility = (abilityType: 'teleport' | 'attack') => {
    const from = { x: 2, y: 2 };
    const to = { x: 6, y: 6 };
    
    if (abilityType === 'teleport') {
      immersiveAudio.playWizardTeleport(from, to);
    } else {
      immersiveAudio.playWizardAttack(from, to);
    }
  };

  const testGameEvent = (eventType: 'check' | 'checkmate' | 'castling' | 'promotion') => {
    immersiveAudio.playGameEvent(eventType);
  };

  const testMusicIntensity = (intensity: 'calm' | 'tension' | 'battle' | 'victory' | 'defeat') => {
    immersiveAudio.setMusicIntensity(intensity);
  };

  const playSound = (soundId: string) => {
    // Use the basic spatial play for individual sound testing
    immersiveAudio.playSpatialized3D('pieceMove', testPosition, { volume: 0.6 });
  };

  const categories: MagicalSoundCategory[] = [
    'piece_movement',
    'piece_capture',
    'wizard_abilities',
    'game_events',
    'ui_interactions',
    'ambient_magic'
  ];

  const categoryNames = {
    'piece_movement': 'Piece Movement',
    'piece_capture': 'Piece Capture',
    'wizard_abilities': 'Wizard Abilities',
    'game_events': 'Game Events',
    'ui_interactions': 'UI Interactions',
    'ambient_magic': 'Ambient Magic'
  };

  const categoryColors = {
    'piece_movement': 'bg-blue-100 text-blue-800',
    'piece_capture': 'bg-red-100 text-red-800',
    'wizard_abilities': 'bg-purple-100 text-purple-800',
    'game_events': 'bg-green-100 text-green-800',
    'ui_interactions': 'bg-gray-100 text-gray-800',
    'ambient_magic': 'bg-amber-100 text-amber-800'
  };

  if (!isInitialized) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">🎵 Initializing Immersive Audio System...</CardTitle>
          <CardDescription className="text-center">
            Loading 3D spatial audio for enhanced chess experience
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎭 Immersive Chess Audio System
          <Badge variant="secondary">3D Spatial Audio</Badge>
        </CardTitle>
        <CardDescription>
          Test the new immersive audio system with medieval chess sounds, 3D positioning, and dynamic music
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="test">🧪 Audio Tests</TabsTrigger>
            <TabsTrigger value="sounds">🎵 Sound Library</TabsTrigger>
            <TabsTrigger value="controls">🎛️ Controls</TabsTrigger>
            <TabsTrigger value="info">📊 System Info</TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Chess Movement Tests */}
              <Card>
                <CardHeader>
                  <CardTitle>♟️ Chess Movements</CardTitle>
                  <CardDescription>Test piece-specific movement sounds with 3D positioning</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {['Pawn', 'Rook', 'Knight', 'Bishop', 'Queen', 'King', 'Wizard'].map(piece => (
                      <Button 
                        key={piece}
                        variant="outline" 
                        size="sm"
                        onClick={() => testChessMove(piece.toLowerCase())}
                      >
                        {piece}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Combat Tests */}
              <Card>
                <CardHeader>
                  <CardTitle>⚔️ Combat Sounds</CardTitle>
                  <CardDescription>Test capture and battle audio effects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => testCapture(false)}>
                      Regular Capture
                    </Button>
                    <Button variant="outline" onClick={() => testCapture(true)}>
                      Wizard Capture
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Wizard Abilities */}
              <Card>
                <CardHeader>
                  <CardTitle>🧙‍♂️ Wizard Abilities</CardTitle>
                  <CardDescription>Test magical 3D audio effects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => testWizardAbility('teleport')}>
                      Teleport
                    </Button>
                    <Button variant="outline" onClick={() => testWizardAbility('attack')}>
                      Ranged Attack
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Game Events */}
              <Card>
                <CardHeader>
                  <CardTitle>🏆 Game Events</CardTitle>
                  <CardDescription>Test special game state sounds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => testGameEvent('check')}>
                      Check
                    </Button>
                    <Button variant="outline" onClick={() => testGameEvent('checkmate')}>
                      Checkmate
                    </Button>
                    <Button variant="outline" onClick={() => testGameEvent('castling')}>
                      Castling
                    </Button>
                    <Button variant="outline" onClick={() => testGameEvent('promotion')}>
                      Promotion
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Music Intensity Tests */}
            <Card>
              <CardHeader>
                <CardTitle>🎼 Dynamic Music System</CardTitle>
                <CardDescription>Test adaptive background music based on game intensity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { key: 'calm', label: '😌 Calm', color: 'bg-green-100 text-green-800' },
                    { key: 'tension', label: '😰 Tension', color: 'bg-yellow-100 text-yellow-800' },
                    { key: 'battle', label: '⚔️ Battle', color: 'bg-red-100 text-red-800' },
                    { key: 'victory', label: '🏆 Victory', color: 'bg-blue-100 text-blue-800' },
                    { key: 'defeat', label: '💔 Defeat', color: 'bg-gray-100 text-gray-800' }
                  ].map(({ key, label, color }) => (
                    <Button
                      key={key}
                      variant="outline"
                      className={`${color} border-current`}
                      onClick={() => testMusicIntensity(key as any)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sounds" className="space-y-4">
            <div className="grid gap-4">
              {categories.map(category => {
                const sounds = getSoundsByCategory(category);
                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Badge className={categoryColors[category]}>
                          {categoryNames[category]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ({sounds.length} sounds)
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {sounds.map(sound => (
                          <div key={sound.id} className="flex items-center gap-2 p-2 rounded border">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => playSound(sound.id)}
                            >
                              ▶️
                            </Button>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{sound.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {sound.description}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="controls" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <Card>
                <CardHeader>
                  <CardTitle>🔊 Master Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Slider
                      value={masterVolume}
                      onValueChange={(values) => handleVolumeChange('master', values)}
                      max={1}
                      min={0}
                      step={0.1}
                    />
                    <div className="text-sm text-muted-foreground text-center">
                      {Math.round(masterVolume[0] * 100)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🎼 Music Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Slider
                      value={musicVolume}
                      onValueChange={(values) => handleVolumeChange('music', values)}
                      max={1}
                      min={0}
                      step={0.1}
                    />
                    <div className="text-sm text-muted-foreground text-center">
                      {Math.round(musicVolume[0] * 100)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🎭 Effects Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Slider
                      value={effectsVolume}
                      onValueChange={(values) => handleVolumeChange('effects', values)}
                      max={1}
                      min={0}
                      step={0.1}
                    />
                    <div className="text-sm text-muted-foreground text-center">
                      {Math.round(effectsVolume[0] * 100)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            <Card>
              <CardHeader>
                <CardTitle>🎛️ System Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => immersiveAudio.toggleMute()}>
                    Toggle Mute
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      immersiveAudio.dispose();
                      immersiveAudio.initialize();
                    }}
                  >
                    Restart Audio System
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <Card>
                <CardHeader>
                  <CardTitle>🎵 Audio Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      ✅ <span>Web Audio API 3D Spatial Positioning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      ✅ <span>Low-latency Audio Buffering</span>
                    </li>
                    <li className="flex items-center gap-2">
                      ✅ <span>Dynamic Music Intensity</span>
                    </li>
                    <li className="flex items-center gap-2">
                      ✅ <span>Medieval Background Music Loop</span>
                    </li>
                    <li className="flex items-center gap-2">
                      ✅ <span>Piece-specific Movement Sounds</span>
                    </li>
                    <li className="flex items-center gap-2">
                      ✅ <span>Wizard 3D Teleport/Attack Effects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      ✅ <span>Hall Reverb for Magical Ambiance</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Sound Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Sounds:</span>
                      <Badge>{MAGICAL_SOUND_LIBRARY.length}</Badge>
                    </div>
                    {categories.map(category => (
                      <div key={category} className="flex justify-between">
                        <span>{categoryNames[category]}:</span>
                        <Badge variant="secondary">
                          {getSoundsByCategory(category).length}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>

            <Card>
              <CardHeader>
                <CardTitle>⚙️ Technical Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div><strong>Audio Context:</strong> Web Audio API</div>
                  <div><strong>3D Positioning:</strong> HRTF Panning Model</div>
                  <div><strong>Reverb:</strong> Convolution with 2-second impulse</div>
                  <div><strong>Audio Files:</strong> MP3 format, optimized for web</div>
                  <div><strong>Latency:</strong> Under 50ms for responsive gameplay</div>
                  <div><strong>Browser Compatibility:</strong> Chrome, Firefox, Safari, Edge</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ImmersiveAudioTestPanel;