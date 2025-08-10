import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AdBanner } from '../monetization/AdBanner';
import { Star, Brain, Target, Zap, Trophy, Users, Play, BookOpen, TrendingUp, Globe, Gamepad2, Shield, Crown, Clock, Lightbulb, BarChart3, Layers, Search, MessageCircle } from 'lucide-react';

// Hint System Blog Page
export function HintSystemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50">
      <header className="bg-white shadow-sm border-b border-yellow-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-yellow-900">Intelligent Hint System</h1>
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
              Get Hints
            </Button>
          </div>
        </div>
        <AdBanner containerId="hint-header-banner" size="leaderboard" />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-yellow-900 mb-6">
              Hint System: Your Personal Chess Mentor
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-yellow-700 mb-8">
              <span>Guidance System</span>
              <span>•</span>
              <span>11 min read</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.7/5 (3,456 learners)</span>
              </div>
            </div>

            <AdBanner containerId="hint-content-top" size="banner" />

            <div className="prose max-w-none mt-8">
              <h2 className="text-2xl font-bold text-yellow-900 mb-4">
                Smart Guidance Without Spoilers
              </h2>
              <p className="text-yellow-800 mb-6 leading-relaxed">
                Our intelligent hint system provides just the right amount of guidance to help you 
                discover solutions independently. Rather than revealing answers, our hints nudge 
                you toward strategic insights and tactical patterns, preserving the satisfaction 
                of discovery while accelerating learning.
              </p>

              <h3 className="text-xl font-bold text-yellow-900 mb-3">
                Hint System Features
              </h3>
              <ul className="list-disc pl-6 text-yellow-800 mb-6 space-y-2">
                <li><strong>Contextual Guidance:</strong> Hints tailored to the specific position and your skill level</li>
                <li><strong>Progressive Revelation:</strong> Multiple hint levels from subtle to explicit</li>
                <li><strong>Learning Focus:</strong> Explanations of why moves work, not just what to play</li>
                <li><strong>Pattern Recognition:</strong> Highlights recurring tactical and strategic themes</li>
                <li><strong>Anti-Repetition Logic:</strong> Varied hint approaches to prevent over-reliance</li>
              </ul>

              <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200 mb-6">
                <h4 className="text-lg font-bold text-yellow-900 mb-3">💡 Hint Effectiveness</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">75%</div>
                    <div className="text-sm text-yellow-700">Independent Solution Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">60</div>
                    <div className="text-sm text-yellow-700">Unique Hint Variations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">95%</div>
                    <div className="text-sm text-yellow-700">Learning Retention</div>
                  </div>
                </div>
              </div>

              <AdBanner containerId="hint-content-mid" size="banner" />

              <h3 className="text-xl font-bold text-yellow-900 mb-3 mt-8">
                Personalized Hint Learning
              </h3>
              <p className="text-yellow-800 mb-6 leading-relaxed">
                Our advanced hint system learns from your interactions, tracking which types of 
                guidance are most effective for your learning style. Over time, hints become 
                increasingly personalized to match your cognitive preferences and chess 
                development needs.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="border-yellow-200">
                  <CardHeader>
                    <Lightbulb className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-yellow-900">Smart Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-yellow-800">
                      Context-aware hints that consider position type, time pressure, 
                      and your current skill level for optimal learning guidance.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardHeader>
                    <Brain className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-yellow-900">Learning Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-yellow-800">
                      Track hint usage patterns and learning progress to optimize 
                      future guidance and identify areas needing focused attention.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-8">
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 text-lg">
                  Experience Smart Hints
                </Button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

// Move Analysis Blog Page
export function MoveAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <header className="bg-white shadow-sm border-b border-emerald-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-emerald-900">Move Analysis Engine</h1>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Analyze Moves
            </Button>
          </div>
        </div>
        <AdBanner containerId="analysis-header-banner" size="leaderboard" />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-emerald-900 mb-6">
              Move Analysis: Deep Chess Insights
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-emerald-700 mb-8">
              <span>Analysis Engine</span>
              <span>•</span>
              <span>16 min read</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.9/5 (4,127 analysts)</span>
              </div>
            </div>

            <AdBanner containerId="analysis-content-top" size="banner" />

            <div className="prose max-w-none mt-8">
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">
                Professional-Grade Chess Analysis
              </h2>
              <p className="text-emerald-800 mb-6 leading-relaxed">
                Our advanced move analysis engine provides comprehensive evaluation of every chess 
                position, offering insights typically available only to professional players and 
                chess masters. Deep positional analysis combined with tactical pattern recognition 
                reveals the hidden complexities of every move.
              </p>

              <h3 className="text-xl font-bold text-emerald-900 mb-3">
                Analysis Capabilities
              </h3>
              <ul className="list-disc pl-6 text-emerald-800 mb-6 space-y-2">
                <li><strong>Position Evaluation:</strong> Comprehensive assessment of material, position, and dynamics</li>
                <li><strong>Tactical Detection:</strong> Identification of all tactical motifs and combinations</li>
                <li><strong>Strategic Assessment:</strong> Long-term planning evaluation and weaknesses analysis</li>
                <li><strong>Alternative Moves:</strong> Comparison of candidate moves with detailed explanations</li>
                <li><strong>Opening Classification:</strong> Database matching and theoretical recommendations</li>
              </ul>

              <div className="bg-emerald-50 p-6 rounded-lg border-2 border-emerald-200 mb-6">
                <h4 className="text-lg font-bold text-emerald-900 mb-3">🔍 Analysis Metrics</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">20+</div>
                    <div className="text-sm text-emerald-700">Evaluation Factors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">15 ply</div>
                    <div className="text-sm text-emerald-700">Analysis Depth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">99.8%</div>
                    <div className="text-sm text-emerald-700">Tactical Accuracy</div>
                  </div>
                </div>
              </div>

              <AdBanner containerId="analysis-content-mid" size="banner" />

              <h3 className="text-xl font-bold text-emerald-900 mb-3 mt-8">
                Real-time Analysis Features
              </h3>
              <p className="text-emerald-800 mb-6 leading-relaxed">
                Experience instant analysis feedback during games with our real-time evaluation 
                system. Watch position assessments update with every move, providing immediate 
                insights into tactical opportunities and strategic considerations.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="border-emerald-200">
                  <CardHeader>
                    <Search className="w-8 h-8 text-emerald-600 mb-2" />
                    <CardTitle className="text-emerald-900">Deep Calculation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-emerald-800">
                      Advanced algorithms calculate variations up to 15 moves deep, 
                      revealing hidden tactical and strategic possibilities.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-200">
                  <CardHeader>
                    <BarChart3 className="w-8 h-8 text-emerald-600 mb-2" />
                    <CardTitle className="text-emerald-900">Visual Evaluation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-emerald-800">
                      Interactive graphs and visual aids make complex analysis 
                      accessible and understandable for players of all levels.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-8">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg">
                  Start Deep Analysis
                </Button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

// Live Tournaments Blog Page
export function LiveTournamentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50">
      <header className="bg-white shadow-sm border-b border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-purple-900">Live Tournaments</h1>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Join Tournament
            </Button>
          </div>
        </div>
        <AdBanner containerId="tournaments-header-banner" size="leaderboard" />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-purple-900 mb-6">
              Live Tournaments: Global Chess Competition
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-purple-700 mb-8">
              <span>Tournament System</span>
              <span>•</span>
              <span>13 min read</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.8/5 (6,234 competitors)</span>
              </div>
            </div>

            <AdBanner containerId="tournaments-content-top" size="banner" />

            <div className="prose max-w-none mt-8">
              <h2 className="text-2xl font-bold text-purple-900 mb-4">
                Competitive Chess at Its Finest
              </h2>
              <p className="text-purple-800 mb-6 leading-relaxed">
                Live tournaments bring the excitement of competitive chess to players worldwide, 
                offering regular competitions across all skill levels. From casual weekend events 
                to prestigious championship series, our tournament system provides structured 
                competition with fair matchmaking and prestigious rewards.
              </p>

              <h3 className="text-xl font-bold text-purple-900 mb-3">
                Tournament Features
              </h3>
              <ul className="list-disc pl-6 text-purple-800 mb-6 space-y-2">
                <li><strong>Skill-Based Brackets:</strong> Compete against players of similar ability</li>
                <li><strong>Multiple Formats:</strong> Swiss, round-robin, and elimination tournaments</li>
                <li><strong>Regular Schedule:</strong> Daily, weekly, and special event competitions</li>
                <li><strong>Prestige Rewards:</strong> Exclusive titles, badges, and recognition</li>
                <li><strong>Live Spectating:</strong> Watch top games with expert commentary</li>
              </ul>

              <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 mb-6">
                <h4 className="text-lg font-bold text-purple-900 mb-3">🏆 Tournament Statistics</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">50+</div>
                    <div className="text-sm text-purple-700">Weekly Tournaments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">15k+</div>
                    <div className="text-sm text-purple-700">Active Competitors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">24/7</div>
                    <div className="text-sm text-purple-700">Tournament Availability</div>
                  </div>
                </div>
              </div>

              <AdBanner containerId="tournaments-content-mid" size="banner" />

              <h3 className="text-xl font-bold text-purple-900 mb-3 mt-8">
                Championship Series
              </h3>
              <p className="text-purple-800 mb-6 leading-relaxed">
                Participate in our prestigious championship series, featuring seasonal competitions 
                that crown the best players in each category. These tournaments offer the ultimate 
                test of chess skill with exclusive rewards and recognition for top performers.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="border-purple-200">
                  <CardHeader>
                    <Trophy className="w-8 h-8 text-purple-600 mb-2" />
                    <CardTitle className="text-purple-900">Competitive Integrity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-800">
                      Advanced anti-cheat systems and fair play monitoring ensure 
                      tournaments maintain the highest standards of competitive integrity.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200">
                  <CardHeader>
                    <Crown className="w-8 h-8 text-purple-600 mb-2" />
                    <CardTitle className="text-purple-900">Prestigious Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-800">
                      Earn exclusive titles, special avatars, and unique badges 
                      that showcase your tournament achievements to the community.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-8">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
                  Enter Competition
                </Button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

// Chess Rankings Blog Page
export function ChessRankingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <header className="bg-white shadow-sm border-b border-rose-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-rose-900">Chess Rankings System</h1>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white">
              View Rankings
            </Button>
          </div>
        </div>
        <AdBanner containerId="rankings-header-banner" size="leaderboard" />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-rose-900 mb-6">
              Chess Rankings: Track Your Progress
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-rose-700 mb-8">
              <span>Ranking System</span>
              <span>•</span>
              <span>12 min read</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.7/5 (3,892 players)</span>
              </div>
            </div>

            <AdBanner containerId="rankings-content-top" size="banner" />

            <div className="prose max-w-none mt-8">
              <h2 className="text-2xl font-bold text-rose-900 mb-4">
                Comprehensive Ranking System
              </h2>
              <p className="text-rose-800 mb-6 leading-relaxed">
                Our sophisticated ranking system provides accurate skill assessment and meaningful 
                progression tracking for players of all levels. Using advanced algorithms that 
                consider multiple performance factors, our rankings offer the most accurate 
                representation of chess ability available.
              </p>

              <h3 className="text-xl font-bold text-rose-900 mb-3">
                Ranking Features
              </h3>
              <ul className="list-disc pl-6 text-rose-800 mb-6 space-y-2">
                <li><strong>Multi-Format Rankings:</strong> Separate ratings for different game modes and time controls</li>
                <li><strong>Performance Analytics:</strong> Detailed statistics and trend analysis</li>
                <li><strong>Global Leaderboards:</strong> Compete with players worldwide across all skill levels</li>
                <li><strong>Achievement Tracking:</strong> Progress markers and milestone celebrations</li>
                <li><strong>Historical Data:</strong> Complete game history and rating progression charts</li>
              </ul>

              <div className="bg-rose-50 p-6 rounded-lg border-2 border-rose-200 mb-6">
                <h4 className="text-lg font-bold text-rose-900 mb-3">📊 Ranking Statistics</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-rose-600">100k+</div>
                    <div className="text-sm text-rose-700">Ranked Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-rose-600">8</div>
                    <div className="text-sm text-rose-700">Rating Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-rose-600">Real-time</div>
                    <div className="text-sm text-rose-700">Updates</div>
                  </div>
                </div>
              </div>

              <AdBanner containerId="rankings-content-mid" size="banner" />

              <h3 className="text-xl font-bold text-rose-900 mb-3 mt-8">
                Advanced Rating Algorithms
              </h3>
              <p className="text-rose-800 mb-6 leading-relaxed">
                Our rating system goes beyond traditional Elo calculations, incorporating factors 
                like consistency, improvement rate, and performance under pressure. This creates 
                more accurate rankings that better reflect true chess ability and potential.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="border-rose-200">
                  <CardHeader>
                    <TrendingUp className="w-8 h-8 text-rose-600 mb-2" />
                    <CardTitle className="text-rose-900">Progress Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-rose-800">
                      Detailed analytics show your improvement over time with insights 
                      into strengths, weaknesses, and areas for focused development.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-rose-200">
                  <CardHeader>
                    <Target className="w-8 h-8 text-rose-600 mb-2" />
                    <CardTitle className="text-rose-900">Goal Setting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-rose-800">
                      Set ranking goals and receive personalized training recommendations 
                      to help you achieve your target rating efficiently.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-8">
                <Button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 text-lg">
                  Check Your Ranking
                </Button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}