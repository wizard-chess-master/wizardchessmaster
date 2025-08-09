import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { usePersonalizedHints } from '../lib/stores/usePersonalizedHints';
import { PersonalizationInsights } from './chess/PersonalizationInsights';
import { Brain, RotateCcw, Settings, BarChart3 } from 'lucide-react';

export function PersonalizationSettings() {
  const { 
    enablePersonalization, 
    adaptationLevel,
    totalHintsGiven,
    interactions,
    togglePersonalization,
    setAdaptationLevel,
    resetLearningData
  } = usePersonalizedHints();

  return (
    <div className="space-y-4">
      {/* Main Personalization Toggle */}
      <Card className="medieval-panel">
        <CardHeader>
          <CardTitle className="medieval-text text-lg flex items-center gap-2">
            <Brain size={20} />
            Personalized Hint Learning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Enable Learning Algorithm</h3>
              <p className="text-xs text-gray-600">
                Adapt hints based on your playing style and preferences
              </p>
            </div>
            <Switch
              checked={enablePersonalization}
              onCheckedChange={togglePersonalization}
            />
          </div>
          
          {enablePersonalization && (
            <div className="space-y-3 pt-3 border-t border-gray-200">
              {/* Adaptation Level */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Learning Speed</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['conservative', 'moderate', 'aggressive'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={adaptationLevel === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAdaptationLevel(level)}
                      className="text-xs"
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {adaptationLevel === 'conservative' && 'Slow, gradual learning changes'}
                  {adaptationLevel === 'moderate' && 'Balanced learning adaptation'}
                  {adaptationLevel === 'aggressive' && 'Quick adaptation to your style'}
                </p>
              </div>

              {/* Learning Statistics */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Learning Stats</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-medium text-blue-700">{totalHintsGiven}</div>
                    <div className="text-blue-600">Total Hints</div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-700">{interactions.length}</div>
                    <div className="text-blue-600">Interactions</div>
                  </div>
                </div>
              </div>

              {/* Reset Learning Data */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Reset Learning Data</h4>
                  <p className="text-xs text-gray-600">
                    Clear all personalization data and start fresh
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('This will reset all your personalized learning data. Continue?')) {
                      resetLearningData();
                    }
                  }}
                  className="text-xs"
                >
                  <RotateCcw size={14} className="mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personalization Insights */}
      {enablePersonalization && <PersonalizationInsights />}

      {/* Information Panel */}
      <Card className="medieval-panel">
        <CardHeader>
          <CardTitle className="medieval-text text-sm flex items-center gap-2">
            <Settings size={16} />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-700 space-y-2">
          <p>
            <strong>Personalized Learning Algorithm</strong> analyzes your interactions with hints to understand your preferences:
          </p>
          <ul className="space-y-1 list-disc list-inside pl-2">
            <li>Tracks which hints you follow vs. ignore</li>
            <li>Learns your preferred complexity level</li>
            <li>Adapts hint style to your learning pace</li>
            <li>Improves recommendations over time</li>
          </ul>
          <p className="pt-2 text-xs text-gray-500">
            All learning data is stored locally on your device and never shared.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}