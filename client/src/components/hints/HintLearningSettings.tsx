import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { 
  Brain, 
  Settings, 
  TrendingUp, 
  RotateCcw, 
  Info,
  AlertCircle 
} from 'lucide-react';
import { hintLearning } from '../../lib/hints/hintLearning';

export function HintLearningSettings() {
  const [insights, setInsights] = useState<any>(null);
  const [adaptationLevel, setAdaptationLevel] = useState(50);

  useEffect(() => {
    updateInsights();
  }, []);

  const updateInsights = () => {
    const currentInsights = hintLearning.getLearningInsights();
    setInsights(currentInsights);
    setAdaptationLevel(currentInsights.preferences.adaptationLevel);
  };

  const handleAdaptationChange = (value: number[]) => {
    const newLevel = value[0];
    setAdaptationLevel(newLevel);
    hintLearning.setAdaptationLevel(newLevel);
    updateInsights();
  };

  const handleResetLearning = () => {
    if (confirm('Reset all hint learning data? This will clear your personalized preferences.')) {
      hintLearning.resetLearning();
      updateInsights();
    }
  };

  const getAdaptationDescription = (level: number) => {
    if (level < 25) return 'Conservative - hints adapt slowly to your preferences';
    if (level < 50) return 'Balanced - moderate adaptation to your style';
    if (level < 75) return 'Adaptive - hints quickly adjust to your preferences';
    return 'Aggressive - maximum personalization based on your feedback';
  };

  const getHintTypeIcon = (type: string) => {
    switch (type) {
      case 'beginner': return '🌱';
      case 'tactical': return '⚔️';
      case 'grandmaster': return '👑';
      default: return '💡';
    }
  };

  if (!insights) return null;

  return (
    <div className="space-y-6">
      {/* Learning Overview */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Hint Learning System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">
                {insights.metrics.totalInteractions}
              </div>
              <div className="text-sm text-muted-foreground">Interactions</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(insights.metrics.preferenceConfidence)}%
              </div>
              <div className="text-sm text-muted-foreground">Confidence</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(insights.metrics.learningProgress)}%
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">
                {insights.metrics.totalInteractions > 0 
                  ? Math.round((insights.metrics.successfulHints / insights.metrics.totalInteractions) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>

          {/* Current Preferences */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Your Learned Preferences
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-sm font-medium">Preferred Hint Types:</span>
                <div className="flex flex-wrap gap-2">
                  {insights.preferences.preferredHintTypes.map((type: string) => (
                    <Badge key={type} variant="secondary" className="flex items-center gap-1">
                      <span>{getHintTypeIcon(type)}</span>
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Complexity Preference:</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(insights.preferences.preferredComplexity / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(insights.preferences.preferredComplexity)}/10
                  </span>
                </div>
              </div>
            </div>

            {/* Response Patterns */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-2 bg-green-50 rounded border">
                <div className="text-lg font-bold text-green-600">
                  {Math.round(insights.preferences.responsePatterns.followRate)}%
                </div>
                <div className="text-xs text-muted-foreground">Follow Rate</div>
              </div>
              
              <div className="text-center p-2 bg-yellow-50 rounded border">
                <div className="text-lg font-bold text-yellow-600">
                  {Math.round(insights.preferences.responsePatterns.requestMoreRate)}%
                </div>
                <div className="text-xs text-muted-foreground">Request More</div>
              </div>
              
              <div className="text-center p-2 bg-red-50 rounded border">
                <div className="text-lg font-bold text-red-600">
                  {Math.round(insights.preferences.responsePatterns.dismissRate)}%
                </div>
                <div className="text-xs text-muted-foreground">Dismiss Rate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adaptation Settings */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            Adaptation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Adaptation Level</span>
              <Badge variant="outline">
                {adaptationLevel}%
              </Badge>
            </div>
            
            <Slider
              value={[adaptationLevel]}
              onValueChange={handleAdaptationChange}
              max={100}
              step={5}
              className="w-full"
            />
            
            <p className="text-sm text-muted-foreground">
              {getAdaptationDescription(adaptationLevel)}
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>How it works:</strong> The system learns from your interactions with hints. 
                Higher adaptation levels make hints change faster based on your feedback, 
                while lower levels provide more stable, consistent hint types.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Insights */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.insights.map((insight: string, index: number) => (
            <div key={index} className="p-3 bg-white rounded-lg border border-indigo-100">
              <p className="text-sm">{insight}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reset Option */}
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Reset Learning Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Reset all learned preferences and start fresh. This will clear your interaction history 
            and return to default hint selection behavior.
          </p>
          
          <Button
            onClick={handleResetLearning}
            variant="outline"
            className="w-full border-red-300 text-red-700 hover:bg-red-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All Learning Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}