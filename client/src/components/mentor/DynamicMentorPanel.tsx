import React, { useEffect, useState } from 'react';
import { useDynamicAIMentor } from '../../lib/stores/useDynamicAIMentor';
import { useAIDifficultyProgression } from '../../lib/stores/useAIDifficultyProgression';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  Settings, 
  Award,
  BarChart3,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react';

export function DynamicMentorPanel() {
  const {
    isActive,
    currentFeedback,
    analytics,
    currentStrategy,
    adaptationSensitivity,
    feedbackStyle,
    autoAdjustDifficulty,
    showRealTimeAnalysis,
    sessionProgress,
    gamesThisSession,
    activateMentor,
    deactivateMentor,
    setAdaptationSensitivity,
    setFeedbackStyle,
    toggleAutoAdjustDifficulty,
    toggleRealTimeAnalysis,
    resetSession,
    clearOldFeedback
  } = useDynamicAIMentor();

  const { currentDifficulty, recentPerformance } = useAIDifficultyProgression();

  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll feedback to latest
  useEffect(() => {
    if (autoScroll && currentFeedback.length > 0) {
      const feedbackContainer = document.getElementById('mentor-feedback-container');
      if (feedbackContainer) {
        feedbackContainer.scrollTop = feedbackContainer.scrollHeight;
      }
    }
  }, [currentFeedback, autoScroll]);

  // Clean up old feedback periodically
  useEffect(() => {
    const interval = setInterval(() => {
      clearOldFeedback();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [clearOldFeedback]);

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'encouragement': return <Shield className="w-4 h-4 text-green-500" />;
      case 'strategy': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'warning': return <Target className="w-4 h-4 text-red-500" />;
      case 'celebration': return <Award className="w-4 h-4 text-purple-500" />;
      case 'analysis': return <BarChart3 className="w-4 h-4 text-blue-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'low': return 'bg-gray-100 border-gray-300 text-gray-600';
      default: return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isActive) {
    return (
      <Card className="w-full max-w-md bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="text-center">
          <Brain className="w-12 h-12 mx-auto text-purple-600 mb-2" />
          <CardTitle className="text-lg text-purple-800">AI Mentor</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Activate your AI mentor for personalized coaching, adaptive difficulty, and real-time feedback.
          </p>
          <Button 
            onClick={activateMentor}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            Activate AI Mentor
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <CardTitle className="text-xl text-purple-800">Dynamic AI Mentor</CardTitle>
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
            <Zap className="w-3 h-3 mr-1" />
            Active
          </span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetSession}
            className="text-purple-600 border-purple-300"
          >
            Reset Session
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={deactivateMentor}
            className="text-red-600 border-red-300"
          >
            Deactivate
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Real-time Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Performance Overview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Current Game Score</span>
                      <span className="font-medium">{Math.round(analytics.currentGameScore)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${analytics.currentGameScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Learning Progress</span>
                      <span className="font-medium">{Math.round(analytics.learningProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${analytics.learningProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Move Quality:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-transparent border ${getQualityColor(analytics.moveQuality)}`}>
                      {analytics.moveQuality.charAt(0).toUpperCase() + analytics.moveQuality.slice(1)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recommended Difficulty:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white border border-gray-300 text-gray-700">
                      Level {analytics.recommendedDifficulty}/10
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Session Progress */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Session Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{gamesThisSession}</div>
                      <div className="text-xs text-gray-600">Games Played</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {sessionProgress.improvementPoints}
                      </div>
                      <div className="text-xs text-gray-600">Improvement Points</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Next Milestone:</div>
                    <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                      {analytics.nextMilestone}
                    </div>
                  </div>

                  {sessionProgress.milestonesReached.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Recent Achievements:</div>
                      <div className="flex flex-wrap gap-1">
                        {sessionProgress.milestonesReached.slice(-3).map((milestone, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            🏆 {milestone}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Learning Areas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Learning Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-green-600 mb-2">Strong Areas:</div>
                    {analytics.strongAreas.length > 0 ? (
                      <div className="space-y-1">
                        {analytics.strongAreas.map((area, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium mr-1 mb-1 text-green-700 bg-green-100">
                            ✓ {area}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">Play more games to identify strengths</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-orange-600 mb-2">Areas for Improvement:</div>
                    {analytics.weakAreas.length > 0 ? (
                      <div className="space-y-1">
                        {analytics.weakAreas.map((area, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium mr-1 mb-1 text-orange-700 bg-orange-100">
                            📈 {area}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">No weak areas identified yet</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Real-time Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Real-time Coaching Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  id="mentor-feedback-container"
                  className="h-64 overflow-y-auto space-y-2 bg-gray-50 p-3 rounded"
                >
                  {currentFeedback.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm">
                      Make a move to receive personalized feedback!
                    </div>
                  ) : (
                    currentFeedback.map((feedback) => (
                      <div 
                        key={feedback.id}
                        className={`p-3 rounded-lg border ${getPriorityColor(feedback.priority)}`}
                      >
                        <div className="flex items-start gap-2">
                          {getFeedbackIcon(feedback.type)}
                          <div className="flex-1">
                            <div className="text-sm font-medium">{feedback.message}</div>
                            {feedback.context?.learningPoint && (
                              <div className="text-xs mt-1 opacity-75">
                                💡 {feedback.context.learningPoint}
                              </div>
                            )}
                            <div className="text-xs mt-1 opacity-60">
                              {new Date(feedback.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      className="rounded"
                    />
                    Auto-scroll to latest
                  </label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearOldFeedback}
                    className="text-xs"
                  >
                    Clear Old Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Current Strategy Tab */}
          <TabsContent value="strategy" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Active Coaching Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentStrategy ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-lg font-medium text-purple-700">{currentStrategy.name}</div>
                      <div className="text-sm text-gray-600">{currentStrategy.description}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Strategy Parameters:</div>
                        <div className="space-y-1 text-xs">
                          <div>Difficulty Adjustment: {currentStrategy.interventions.difficultyAdjustment > 0 ? '+' : ''}{currentStrategy.interventions.difficultyAdjustment}</div>
                          <div>Feedback Frequency: {currentStrategy.interventions.feedbackFrequency}</div>
                          <div>Hints Available: {currentStrategy.interventions.hintAvailability ? 'Yes' : 'No'}</div>
                          <div>Analysis Depth: {currentStrategy.interventions.analysisDepth}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Current Performance:</div>
                        <div className="space-y-1 text-xs">
                          <div>Win Rate: {Math.round(recentPerformance.winRate)}%</div>
                          <div>Current Streak: {recentPerformance.currentStreak}</div>
                          <div>Skill Level: {recentPerformance.skillLevel}</div>
                          <div>Difficulty: {currentDifficulty}/10</div>
                        </div>
                      </div>
                    </div>

                    {analytics.adaptationNeeded && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                        <div className="text-sm font-medium text-yellow-800">
                          Adaptation Needed
                        </div>
                        <div className="text-xs text-yellow-700">
                          The mentor is analyzing your performance and may adjust the strategy soon.
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    No active strategy. Play a few games to activate personalized coaching.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Mentor Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Adaptation Sensitivity */}
                <div>
                  <label className="text-sm font-medium">Adaptation Sensitivity</label>
                  <div className="mt-1">
                    <select 
                      value={adaptationSensitivity}
                      onChange={(e) => setAdaptationSensitivity(e.target.value as 'conservative' | 'moderate' | 'aggressive')}
                      className="w-full p-2 text-sm border rounded"
                    >
                      <option value="conservative">Conservative - Slow adaptation</option>
                      <option value="moderate">Moderate - Balanced adaptation</option>
                      <option value="aggressive">Aggressive - Quick adaptation</option>
                    </select>
                  </div>
                </div>

                {/* Feedback Style */}
                <div>
                  <label className="text-sm font-medium">Feedback Style</label>
                  <div className="mt-1">
                    <select 
                      value={feedbackStyle}
                      onChange={(e) => setFeedbackStyle(e.target.value as 'encouraging' | 'analytical' | 'challenging')}
                      className="w-full p-2 text-sm border rounded"
                    >
                      <option value="encouraging">Encouraging - Positive and supportive</option>
                      <option value="analytical">Analytical - Detailed and objective</option>
                      <option value="challenging">Challenging - Direct and demanding</option>
                    </select>
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={autoAdjustDifficulty}
                      onChange={toggleAutoAdjustDifficulty}
                      className="rounded"
                    />
                    Auto-adjust AI difficulty
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={showRealTimeAnalysis}
                      onChange={toggleRealTimeAnalysis}
                      className="rounded"
                    />
                    Show real-time move analysis
                  </label>
                </div>

                {/* Information Panel */}
                <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs">
                  <div className="font-medium text-blue-800 mb-1">How Dynamic Mentoring Works:</div>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Analyzes your moves in real-time</li>
                    <li>• Adapts AI difficulty based on performance</li>
                    <li>• Provides contextual feedback and strategies</li>
                    <li>• Tracks learning progress and milestones</li>
                    <li>• Offers personalized coaching interventions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}