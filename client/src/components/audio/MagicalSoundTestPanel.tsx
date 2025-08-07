import React, { useState, useMemo } from 'react';
import { useAudio } from '../../lib/stores/useAudio';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  MAGICAL_SOUND_LIBRARY, 
  type MagicalSoundEffect, 
  type MagicalSoundCategory 
} from '../../lib/audio/magicalSoundLibrary';
import { Wand2, Sword, Crown, Settings, VolumeX, Volume2 } from 'lucide-react';

export function MagicalSoundTestPanel() {
  const { 
    playMagicalSound, 
    playPieceMovementSound, 
    playWizardAbility, 
    playGameEvent, 
    playUISound, 
    playAmbientMagic,
    stopAmbientMagic,
    isMuted 
  } = useAudio();
  
  const [isPlaying, setIsPlaying] = useState<MagicalSoundEffect | null>(null);
  const [lastPlayed, setLastPlayed] = useState<string>('');

  const playSound = async (soundId: MagicalSoundEffect, name: string) => {
    setIsPlaying(soundId);
    setLastPlayed(name);
    
    try {
      await playMagicalSound(soundId);
    } catch (error) {
      console.error('Failed to play sound:', error);
    } finally {
      // Clear playing state after sound duration
      const sound = MAGICAL_SOUND_LIBRARY.find(s => s.id === soundId);
      setTimeout(() => setIsPlaying(null), sound?.duration || 1000);
    }
  };

  const testPieceMovement = async (pieceType: string) => {
    setLastPlayed(`${pieceType} movement`);
    await playPieceMovementSound(pieceType);
  };

  const testWizardAbility = async (ability: 'teleport' | 'ranged_attack' | 'summon') => {
    setLastPlayed(`Wizard ${ability}`);
    await playWizardAbility(ability);
  };

  const testGameEvent = async (event: 'check' | 'checkmate_win' | 'checkmate_lose' | 'castling' | 'promotion' | 'game_start') => {
    setLastPlayed(`Game event: ${event}`);
    await playGameEvent(event);
  };

  const testUISound = async (ui: 'hover' | 'click' | 'menu_open' | 'menu_close' | 'success' | 'error' | 'notification') => {
    setLastPlayed(`UI: ${ui}`);
    await playUISound(ui);
  };

  const testAmbientMagic = async (intensity: 'low' | 'medium' | 'high') => {
    setLastPlayed(`Ambient magic: ${intensity}`);
    await playAmbientMagic(intensity);
  };

  const getCategoryIcon = (category: MagicalSoundCategory) => {
    switch (category) {
      case 'wizard_abilities': return <Wand2 className="w-4 h-4" />;
      case 'piece_capture': return <Sword className="w-4 h-4" />;
      case 'game_events': return <Crown className="w-4 h-4" />;
      case 'ui_interactions': return <Settings className="w-4 h-4" />;
      default: return <Volume2 className="w-4 h-4" />;
    }
  };

  const soundsByCategory = useMemo(() => {
    return MAGICAL_SOUND_LIBRARY.reduce((acc, sound) => {
      if (!acc[sound.category]) acc[sound.category] = [];
      acc[sound.category].push(sound);
      return acc;
    }, {} as Record<MagicalSoundCategory, typeof MAGICAL_SOUND_LIBRARY>);
  }, []);



  if (isMuted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VolumeX className="w-5 h-5" />
            Magical Sound Library - Audio Muted
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Enable audio in settings to test magical sound effects
          </p>
          <div className="text-center">
            <Button 
              onClick={() => {
                // Try to unmute audio from within the panel
                const audioStore = useAudio.getState();
                audioStore.toggleMute();
                console.log('🎵 Attempted to unmute audio from panel');
              }}
              variant="outline"
            >
              🔊 Enable Audio
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }



  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="border-2 border-purple-500/20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Wand2 className="w-6 h-6 text-purple-600" />
            Magical Sound Effect Library
            <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
              ✨ {MAGICAL_SOUND_LIBRARY.length} Sounds Ready
            </Badge>
          </CardTitle>
          <p className="text-base text-muted-foreground">
            🎭 Test the comprehensive magical audio system with {MAGICAL_SOUND_LIBRARY.length} immersive sound effects across {Object.keys(soundsByCategory).length} categories
          </p>
          {lastPlayed && (
            <Badge variant="outline" className="w-fit bg-green-50 text-green-700 border-green-200">
              🔊 Last played: {lastPlayed}
            </Badge>
          )}
        </CardHeader>
      </Card>

      <Tabs defaultValue="quick-tests" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 bg-purple-100 dark:bg-purple-900/20">
          <TabsTrigger value="quick-tests" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            🎯 Quick Tests
          </TabsTrigger>
          <TabsTrigger value="by-category" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            📂 By Category
          </TabsTrigger>
          <TabsTrigger value="ambient" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            ✨ Ambient Magic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick-tests" className="space-y-6 mt-6">
          
          {/* Fallback test if content doesn't render */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border-2 border-yellow-400/50 mb-4">
            <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-200 mb-2">
              🎭 Magical Sound Library Status
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              Loaded {MAGICAL_SOUND_LIBRARY.length} sounds across {Object.keys(soundsByCategory).length} categories
            </p>
            <Button 
              className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={() => {
                console.log('🎵 Test button clicked!');
                setLastPlayed('Test click');
              }}
            >
              🔊 Test Audio System
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Piece Movement Tests */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  ♟️ Piece Movements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['pawn', 'rook', 'knight', 'bishop', 'queen', 'king', 'wizard'].map(piece => (
                  <Button
                    key={piece}
                    variant="outline"
                    size="sm"
                    onClick={() => testPieceMovement(piece)}
                    className="w-full capitalize bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/20 border-blue-300"
                  >
                    {piece === 'wizard' ? '🧙‍♂️' : piece === 'king' ? '👑' : piece === 'queen' ? '♛' : '♟️'} {piece}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Wizard Abilities Tests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Wizard Abilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testWizardAbility('teleport')}
                  className="w-full"
                >
                  Teleport
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testWizardAbility('ranged_attack')}
                  className="w-full"
                >
                  Ranged Attack
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testWizardAbility('summon')}
                  className="w-full"
                >
                  Summon
                </Button>
              </CardContent>
            </Card>

            {/* Game Events Tests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Game Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testGameEvent('check')}
                  className="w-full"
                >
                  Check Warning
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testGameEvent('checkmate_win')}
                  className="w-full"
                >
                  Victory
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testGameEvent('checkmate_lose')}
                  className="w-full"
                >
                  Defeat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testGameEvent('castling')}
                  className="w-full"
                >
                  Castling
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testGameEvent('promotion')}
                  className="w-full"
                >
                  Pawn Promotion
                </Button>
              </CardContent>
            </Card>

            {/* UI Sounds Tests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">UI Interactions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testUISound('click')}
                  className="w-full"
                >
                  Button Click
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testUISound('success')}
                  className="w-full"
                >
                  Success
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testUISound('error')}
                  className="w-full"
                >
                  Error
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testUISound('notification')}
                  className="w-full"
                >
                  Notification
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-category" className="space-y-6 mt-6">
          
          {/* Category Status */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border-2 border-blue-400/50">
            <h3 className="font-bold text-lg text-blue-800 dark:text-blue-200 mb-2">
              📂 Sound Categories
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              Browse {Object.keys(soundsByCategory).length} categories with {MAGICAL_SOUND_LIBRARY.length} total sounds
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(soundsByCategory).map(([category, sounds]) => (
              <Card key={category} className="border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
                  <CardTitle className="flex items-center gap-2 text-lg capitalize">
                    {getCategoryIcon(category as MagicalSoundCategory)}
                    {category.replace('_', ' ')}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-medium">
                    {sounds.length} magical sounds available
                  </p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {sounds.map(sound => (
                      <div key={sound.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">{sound.name}</p>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {sound.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {sound.duration}ms
                            </Badge>
                            <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                              Vol: {(sound.volume * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playSound(sound.id, sound.name)}
                          disabled={isPlaying === sound.id}
                          className="ml-3 hover:bg-purple-200 dark:hover:bg-purple-700"
                        >
                          {isPlaying === sound.id ? '🔊' : '▶️'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ambient" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ambient Magical Atmosphere</CardTitle>
              <p className="text-sm text-muted-foreground">
                Test looping ambient magical sounds by intensity level
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => testAmbientMagic('low')}
                  className="flex flex-col items-center gap-2 h-20"
                >
                  <div className="text-2xl">🌟</div>
                  <span>Low Intensity</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testAmbientMagic('medium')}
                  className="flex flex-col items-center gap-2 h-20"
                >
                  <div className="text-2xl">⚡</div>
                  <span>Medium Intensity</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testAmbientMagic('high')}
                  className="flex flex-col items-center gap-2 h-20"
                >
                  <div className="text-2xl">🔥</div>
                  <span>High Intensity</span>
                </Button>
              </div>
              <Button
                variant="destructive"
                onClick={stopAmbientMagic}
                className="w-full"
              >
                Stop All Ambient Sounds
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}