import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, Play, Lock, Star, Trophy } from 'lucide-react';
import { useCampaign } from '../../lib/stores/useCampaign';
import { useChess } from '../../lib/stores/useChess';
import type { CampaignLevel } from '../../lib/stores/useCampaign';

interface CampaignModeProps {
  onBackToMenu: () => void;
}

export function CampaignMode({ onBackToMenu }: CampaignModeProps) {
  const { levels, startCampaignLevel } = useCampaign();
  const { startGame } = useChess();

  const handleLevelSelect = (levelId: string) => {
    const level = levels.find(l => l.id === levelId);
    if (!level || !level.unlocked) return;

    startCampaignLevel(levelId);
    
    // Start the campaign game with AI difficulty  
    const difficulty = level.aiStrength <= 2 ? 'easy' : level.aiStrength <= 4 ? 'medium' : 'hard';
    startGame('ai', difficulty);
    
    // Return to game view
    onBackToMenu();
  };

  const getDifficultyColor = (aiStrength: number) => {
    if (aiStrength <= 2) return 'bg-green-100 text-green-800';
    if (aiStrength <= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyText = (aiStrength: number) => {
    if (aiStrength <= 2) return 'Easy';
    if (aiStrength <= 4) return 'Medium';
    return 'Hard';
  };

  const renderStars = (stars: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="campaign-mode min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <Card className="border-amber-300 bg-gradient-to-r from-amber-100 to-yellow-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={onBackToMenu}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Menu
                </Button>
                
                <div>
                  <CardTitle className="text-2xl text-amber-900 flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Campaign Mode
                  </CardTitle>
                  <p className="text-amber-700 mt-1">
                    Progress through challenging levels with increasing difficulty
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Level Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => (
            <Card 
              key={level.id} 
              className={`border-2 transition-all duration-200 ${
                level.unlocked 
                  ? 'border-amber-200 hover:border-amber-300 hover:shadow-lg cursor-pointer' 
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 mb-1">{level.name}</h3>
                    <p className="text-sm text-amber-700 mb-2">{level.description}</p>
                  </div>
                  
                  {!level.unlocked && (
                    <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <Badge className={getDifficultyColor(level.aiStrength)}>
                    AI Level {level.aiStrength} - {getDifficultyText(level.aiStrength)}
                  </Badge>
                  
                  {level.isPremiumLevel && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Premium
                    </Badge>
                  )}
                </div>

                {level.completed && level.stars > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    {renderStars(level.stars)}
                    <span className="text-xs text-amber-600 ml-2">
                      {level.wins}/{level.attempts} wins
                    </span>
                  </div>
                )}

                <Button
                  onClick={() => handleLevelSelect(level.id)}
                  disabled={!level.unlocked}
                  className={`w-full ${
                    level.unlocked
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {level.completed ? 'Play Again' : 'Start Level'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}