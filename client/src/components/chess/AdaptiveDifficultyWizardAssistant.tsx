import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { 
  Sparkles, 
  Settings, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Crown, 
  Zap,
  X,
  MessageCircle,
  BarChart3,
  Target,
  Lightbulb
} from 'lucide-react';
import { useWizardAssistant, WizardHint } from '../../lib/stores/useWizardAssistant';
import { useChess } from '../../lib/stores/useChess';
import { useAIDifficultyProgression } from '../../lib/stores/useAIDifficultyProgression';

interface WizardAssistantProps {
  className?: string;
}

export function AdaptiveDifficultyWizardAssistant({ className }: WizardAssistantProps) {
  const { 
    isActive,
    currentHint,
    personality,
    gamesPlayed,
    currentStreak,
    strugglingCounter,
    masteryCounter,
    hintFrequency,
    adaptiveMode,
    autoAdjustDifficulty,
    dismissHint,
    setHintFrequency,
    toggleAdaptiveMode,
    toggleAutoAdjustDifficulty,
    activateWizard,
    deactivateWizard
  } = useWizardAssistant();

  const { gamePhase } = useChess();
  const { currentDifficulty, adaptationEnabled } = useAIDifficultyProgression();

  // Auto-generate hints during gameplay
  useEffect(() => {
    if (gamePhase === 'playing' && isActive && adaptiveMode) {
      const gameState = useChess.getState();
      const interval = setInterval(() => {
        useWizardAssistant.getState().generateHint(gameState);
      }, getHintIntervalMs(hintFrequency));

      return () => clearInterval(interval);
    }
  }, [gamePhase, isActive, adaptiveMode, hintFrequency]);

  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <Button
          onClick={activateWizard}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg"
        >
          <Sparkles className="w-5 h-5" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      {/* Current Hint Display */}
      <AnimatePresence>
        {currentHint && (
          <WizardHintCard hint={currentHint} onDismiss={dismissHint} />
        )}
      </AnimatePresence>

      {/* Wizard Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3"
      >
        <Card className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-sm border-purple-500/30 text-white shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-6 h-6 text-purple-300 opacity-50"
                  >
                    <Zap className="w-6 h-6" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="font-bold text-sm">{personality.name}</h3>
                  <p className="text-xs text-purple-200">{personality.title}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={deactivateWizard}
                className="text-purple-200 hover:text-white hover:bg-purple-700/50 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="bg-purple-800/50 rounded p-2">
                <div className="text-purple-200">Games</div>
                <div className="font-bold">{gamesPlayed}</div>
              </div>
              <div className="bg-purple-800/50 rounded p-2">
                <div className="text-purple-200">Streak</div>
                <div className="font-bold text-yellow-400">{currentStreak}</div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="flex gap-1 mb-3">
              {masteryCounter >= 3 && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0">
                  <Crown className="w-3 h-3 mr-1" />
                  Mastery
                </Badge>
              )}
              {strugglingCounter >= 2 && (
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 text-xs px-2 py-0">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Focus
                </Badge>
              )}
              {adaptationEnabled && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0">
                  <Brain className="w-3 h-3 mr-1" />
                  Adaptive
                </Badge>
              )}
            </div>

            {/* Settings Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-purple-500/50 text-purple-200 hover:bg-purple-700/50 hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Wizard Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Adaptive Difficulty Wizard Assistant
                  </DialogTitle>
                </DialogHeader>
                <WizardSettingsPanel />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function WizardHintCard({ hint, onDismiss }: { hint: WizardHint; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (hint.duration / 100));
        return Math.max(0, newProgress);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [hint.duration]);

  const getHintIcon = () => {
    switch (hint.type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'strategy': return <Brain className="w-5 h-5 text-blue-400" />;
      case 'tactical': return <Target className="w-5 h-5 text-green-400" />;
      case 'difficulty': return <TrendingUp className="w-5 h-5 text-yellow-400" />;
      case 'encouragement': return <Sparkles className="w-5 h-5 text-purple-400" />;
      default: return <MessageCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getHintColor = () => {
    switch (hint.priority) {
      case 'urgent': return 'from-red-900/90 to-red-800/90 border-red-500/50';
      case 'high': return 'from-orange-900/90 to-orange-800/90 border-orange-500/50';
      case 'medium': return 'from-purple-900/90 to-indigo-900/90 border-purple-500/50';
      default: return 'from-blue-900/90 to-blue-800/90 border-blue-500/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className={`bg-gradient-to-br ${getHintColor()} backdrop-blur-sm text-white shadow-2xl max-w-sm`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getHintIcon()}
              <span className="text-sm font-medium capitalize">{hint.type}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-white/60 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          <p className="text-sm mb-2 leading-relaxed">{hint.message}</p>
          
          <div className="flex items-center gap-2 text-xs text-white/80 mb-2">
            <Sparkles className="w-3 h-3" />
            <em>{hint.magicalQuote}</em>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-1">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-purple-400 h-1 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WizardSettingsPanel() {
  const {
    hintFrequency,
    adaptiveMode,
    autoAdjustDifficulty,
    personality,
    setHintFrequency,
    toggleAdaptiveMode,
    toggleAutoAdjustDifficulty,
    resetWizardStats
  } = useWizardAssistant();

  const { currentDifficulty, adaptationEnabled } = useAIDifficultyProgression();

  return (
    <Tabs defaultValue="assistant" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="assistant">Assistant</TabsTrigger>
        <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
        <TabsTrigger value="stats">Statistics</TabsTrigger>
      </TabsList>

      <TabsContent value="assistant" className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="adaptive-mode">Adaptive Hints</Label>
            <Switch
              id="adaptive-mode"
              checked={adaptiveMode}
              onCheckedChange={toggleAdaptiveMode}
            />
          </div>

          <div className="space-y-2">
            <Label>Hint Frequency</Label>
            <div className="grid grid-cols-4 gap-2">
              {['minimal', 'normal', 'frequent', 'maximum'].map((freq) => (
                <Button
                  key={freq}
                  variant={hintFrequency === freq ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHintFrequency(freq as any)}
                  className="capitalize"
                >
                  {freq}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Wizard Personality</span>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>{personality.name}</strong> - {personality.title}
            </p>
            <p className="text-sm text-muted-foreground">
              Current mood: <em className="capitalize">{personality.mood}</em>
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs">
                <span>Arcane Level</span>
                <span>{personality.arcaneLevel}/100</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${personality.arcaneLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="difficulty" className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-adjust">Auto-Adjust Difficulty</Label>
            <Switch
              id="auto-adjust"
              checked={autoAdjustDifficulty}
              onCheckedChange={toggleAutoAdjustDifficulty}
            />
          </div>

          <div className="space-y-2">
            <Label>Current AI Difficulty</Label>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
              <div className="flex justify-between text-sm">
                <span>Difficulty Level</span>
                <span>{Math.round(currentDifficulty * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full"
                  style={{ width: `${currentDifficulty * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {adaptationEnabled ? 'Adaptive mode enabled' : 'Fixed difficulty'}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              <span className="font-medium">How It Works</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The wizard monitors your performance and automatically adjusts AI difficulty to keep games challenging but fair. 
              Win streaks increase difficulty, while struggles decrease it.
            </p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="stats" className="space-y-4">
        <WizardStatsDisplay />
      </TabsContent>
    </Tabs>
  );
}

function WizardStatsDisplay() {
  const { gamesPlayed, currentStreak, strugglingCounter, masteryCounter, hintHistory, resetWizardStats } = useWizardAssistant();

  const recentHints = hintHistory.slice(-10);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{gamesPlayed}</div>
            <div className="text-sm text-muted-foreground">Games Played</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{masteryCounter}</div>
            <div className="text-sm text-muted-foreground">Mastery Points</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{strugglingCounter}</div>
            <div className="text-sm text-muted-foreground">Struggle Points</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Recent Hints</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentHints.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hints given yet</p>
            ) : (
              recentHints.reverse().map((hint) => (
                <div key={hint.id} className="text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="flex justify-between">
                    <span className="capitalize font-medium">{hint.type}</span>
                    <span className="text-muted-foreground">{new Date(hint.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-muted-foreground truncate">{hint.message}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        size="sm"
        onClick={resetWizardStats}
        className="w-full"
      >
        Reset Statistics
      </Button>
    </div>
  );
}

function getHintIntervalMs(frequency: string): number {
  switch (frequency) {
    case 'minimal': return 60000; // 1 minute
    case 'normal': return 30000;  // 30 seconds
    case 'frequent': return 15000; // 15 seconds
    case 'maximum': return 10000;  // 10 seconds
    default: return 30000;
  }
}