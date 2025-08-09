import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Achievement } from '../../lib/achievements/types';
import { EnhancedAchievementNotification } from './EnhancedAchievementNotification';
import { Crown, Trophy, Award, Star } from 'lucide-react';

// Test achievements for demonstration
const testAchievements: Achievement[] = [
  {
    id: 'test-common',
    name: 'First Steps',
    description: 'Complete your first game',
    icon: '🎯',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'games_played', target: 1 },
    reward: {
      experiencePoints: 10,
      unlockMessage: 'Welcome to the world of wizard chess!'
    }
  },
  {
    id: 'test-rare',
    name: 'Rising Star',
    description: 'Win 5 games in a row',
    icon: '⭐',
    rarity: 'rare',
    category: 'strategic',
    criteria: { type: 'streaks', target: 5 },
    reward: {
      experiencePoints: 50,
      title: 'Star Player',
      unlockMessage: 'Your skills are shining bright!'
    }
  },
  {
    id: 'test-epic',
    name: 'Master Tactician',
    description: 'Defeat the AI on hard difficulty',
    icon: '🧙‍♂️',
    rarity: 'epic',
    category: 'mastery',
    criteria: { type: 'ai_defeats', target: 1 },
    reward: {
      experiencePoints: 100,
      title: 'Tactical Genius',
      unlockMessage: 'You have mastered the art of strategy!'
    }
  },
  {
    id: 'test-legendary',
    name: 'Chess Grandmaster',
    description: 'Achieve perfection in the ancient art',
    icon: '👑',
    rarity: 'legendary',
    category: 'mastery',
    criteria: { type: 'perfect_games', target: 10 },
    reward: {
      experiencePoints: 500,
      title: 'Grandmaster Supreme',
      unlockMessage: 'You have transcended mortal limits of chess mastery!'
    }
  }
];

export function AchievementTestPanel() {
  const [activeNotification, setActiveNotification] = useState<Achievement | null>(null);

  const triggerCelebration = (achievement: Achievement) => {
    setActiveNotification(achievement);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400';
      case 'epic': return 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-400';
      case 'rare': return 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400';
      default: return 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'epic': return <Award className="w-4 h-4 text-purple-600" />;
      case 'rare': return <Trophy className="w-4 h-4 text-blue-600" />;
      default: return <Star className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold medieval-text mb-2">Achievement Celebration Test Panel</h2>
        <p className="text-muted-foreground">Test the enhanced achievement celebration microinteractions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {testAchievements.map((achievement) => (
          <Card key={achievement.id} className={`${getRarityColor(achievement.rarity)} border-2`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="text-4xl">{achievement.icon}</div>
                <Badge variant="outline" className="capitalize flex items-center gap-1">
                  {getRarityIcon(achievement.rarity)}
                  {achievement.rarity}
                </Badge>
              </div>
              <CardTitle className="text-lg">{achievement.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span>Reward:</span>
                  <span className="font-bold text-green-600">+{achievement.reward.experiencePoints} XP</span>
                </div>
                {achievement.reward.title && (
                  <div className="flex justify-between text-xs">
                    <span>Title:</span>
                    <Badge variant="secondary" className="text-xs">{achievement.reward.title}</Badge>
                  </div>
                )}
              </div>
              <Button
                onClick={() => triggerCelebration(achievement)}
                className="w-full medieval-btn"
                size="sm"
              >
                Test {achievement.rarity} Celebration
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <h3 className="font-bold text-amber-800 mb-2">🎯 Celebration Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
            <div>
              <h4 className="font-semibold mb-1">Visual Effects:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Screen flash for rare+ achievements</li>
                <li>• Particle burst animations</li>
                <li>• Confetti for epic+ rarities</li>
                <li>• Fireworks for legendary</li>
                <li>• Animated card borders and glows</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Interactive Features:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Screen shake effects</li>
                <li>• Haptic feedback (mobile)</li>
                <li>• Victory sound effects</li>
                <li>• Smooth entrance animations</li>
                <li>• Auto-hide after 10 seconds</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Notification */}
      {activeNotification && (
        <EnhancedAchievementNotification
          achievement={activeNotification}
          onClose={() => setActiveNotification(null)}
        />
      )}
    </div>
  );
}