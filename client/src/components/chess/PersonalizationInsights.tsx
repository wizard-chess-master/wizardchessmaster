import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { usePersonalizedHints } from '../../lib/stores/usePersonalizedHints';
import { Brain, TrendingUp, Target, BarChart3 } from 'lucide-react';

export function PersonalizationInsights() {
  const { 
    interactions, 
    preferences, 
    totalHintsGiven, 
    totalHintsFollowed, 
    averageHintEffectiveness, 
    learningProgress,
    getPersonalizationInsights,
    enablePersonalization
  } = usePersonalizedHints();

  if (!enablePersonalization) {
    return (
      <Card className="medieval-panel">
        <CardHeader>
          <CardTitle className="medieval-text text-sm flex items-center gap-2">
            <Brain size={16} />
            Personalized Learning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-600">
            Personalized hints are currently disabled. Enable them in settings to see learning insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (interactions.length < 3) {
    return (
      <Card className="medieval-panel">
        <CardHeader>
          <CardTitle className="medieval-text text-sm flex items-center gap-2">
            <Brain size={16} />
            Learning in Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-xs text-gray-600">
              Use {3 - interactions.length} more hints to unlock personalized insights.
            </p>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(interactions.length / 3) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = getPersonalizationInsights();

  return (
    <div className="space-y-4">
      {/* Learning Progress Overview */}
      <Card className="medieval-panel">
        <CardHeader>
          <CardTitle className="medieval-text text-sm flex items-center gap-2">
            <Brain size={16} />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
              <div className="text-xl font-bold text-blue-700">{totalHintsFollowed}</div>
              <div className="text-xs text-blue-600">Hints Followed</div>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              <div className="text-xl font-bold text-emerald-700">{Math.round(averageHintEffectiveness)}%</div>
              <div className="text-xs text-emerald-600">Success Rate</div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Overall Progress</span>
              <span>{Math.round(learningProgress)}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${learningProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Analysis */}
      <Card className="medieval-panel">
        <CardHeader>
          <CardTitle className="medieval-text text-sm flex items-center gap-2">
            <Target size={16} />
            Your Learning Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Preferred Complexity:</span>
              <span className="font-medium capitalize">{preferences.preferredComplexity}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Preferred Style:</span>
              <span className="font-medium capitalize">{preferences.preferredStyle}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Learning Velocity:</span>
              <span className="font-medium">{(preferences.learningVelocity * 100).toFixed(1)}%</span>
            </div>
          </div>
          
          {insights.mostEffectiveHintTypes.length > 0 && (
            <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
              <div className="text-xs font-medium text-amber-800 mb-1">Best Hint Types:</div>
              <div className="text-xs text-amber-700">
                {insights.mostEffectiveHintTypes.slice(0, 2).map(type => 
                  type.charAt(0).toUpperCase() + type.slice(1)
                ).join(', ')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card className="medieval-panel">
        <CardHeader>
          <CardTitle className="medieval-text text-sm flex items-center gap-2">
            <TrendingUp size={16} />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.learningTrends.length > 2 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-600">Recent Improvement</div>
              <div className="flex items-center gap-1">
                {insights.learningTrends.slice(-5).map((trend, index) => (
                  <div
                    key={index}
                    className={`h-4 w-2 rounded-sm ${
                      trend > 60 ? 'bg-emerald-400' : 
                      trend > 40 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    title={`${trend.toFixed(1)}% success rate`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {insights.preferredGamePhases.length > 0 && (
            <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
              <div className="text-xs font-medium text-purple-800 mb-1">Strong Phases:</div>
              <div className="text-xs text-purple-700">
                {insights.preferredGamePhases.slice(0, 2).map(phase => 
                  phase.charAt(0).toUpperCase() + phase.slice(1)
                ).join(', ')} game
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Improvement Areas */}
      {insights.improvementAreas.length > 0 && (
        <Card className="medieval-panel">
          <CardHeader>
            <CardTitle className="medieval-text text-sm flex items-center gap-2">
              <BarChart3 size={16} />
              Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {insights.improvementAreas.slice(0, 3).map((area, index) => (
                <div key={index} className="text-xs text-gray-700 flex items-center gap-1">
                  <span>•</span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}